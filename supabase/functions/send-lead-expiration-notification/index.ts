
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { generateExpirationEmailHtml, generateExpirationEmailSubject } from "./email-templates.ts";
import { createEmailService, sendEmail } from "./email-service.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    console.log('=== LEAD EXPIRATION NOTIFICATION FUNCTION STARTED ===');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Checking for leads expiring in 1 hour...');
    
    // Calculate the time window for leads expiring in 1 hour (within 15 minutes)
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour ahead
    const oneHour15FromNow = new Date(now.getTime() + 75 * 60 * 1000); // 1 hour 15 minutes ahead
    
    console.log(`Current time: ${now.toISOString()}`);
    console.log(`Looking for appointments between: ${oneHourFromNow.toISOString()} and ${oneHour15FromNow.toISOString()}`);

    // Query for leads that:
    // 1. Have appointment times
    // 2. Are purchased (have buyer_id)
    // 3. Haven't received expiration warning yet
    // 4. Have appointments expiring in about 1 hour
    const { data: expiringLeads, error: leadsError } = await supabase
      .from('leads')
      .select(`
        id,
        type,
        location,
        description,
        price,
        appointment_time,
        contact_name,
        contact_email,
        contact_phone,
        seller_id,
        seller_name,
        buyer_id,
        buyer_name,
        purchased_at,
        created_at
      `)
      .not('appointment_time', 'is', null)
      .not('buyer_id', 'is', null)
      .eq('expiration_warning_sent', false)
      .eq('status', 'sold');

    if (leadsError) {
      console.error('Error fetching leads:', leadsError);
      throw leadsError;
    }

    console.log(`Found ${expiringLeads?.length || 0} leads to check for expiration`);

    if (!expiringLeads || expiringLeads.length === 0) {
      console.log('No leads found that need expiration warnings');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No leads found that need expiration warnings',
        processed: 0 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Filter leads based on appointment time proximity to 1 hour
    const leadsToNotify = expiringLeads.filter(lead => {
      if (!lead.appointment_time) return false;
      
      try {
        // Parse appointment time format: "Month Day, Year at Time Slot"
        const dateTimeRegex = /^(.*?) at (.*)$/;
        const match = lead.appointment_time.match(dateTimeRegex);
        
        if (!match || match.length < 3) {
          console.warn(`Invalid appointment time format for lead ${lead.id}: ${lead.appointment_time}`);
          return false;
        }
        
        const [_, datePart, timePart] = match;
        
        // Extract start time from time slot (e.g., "8:00 AM - 10:00 AM" -> "8:00 AM")
        const timeRegex = /(\d+:\d+\s*[AP]M)\s*-\s*(\d+:\d+\s*[AP]M)/i;
        const timeMatch = timePart.match(timeRegex);
        
        if (!timeMatch || timeMatch.length < 2) {
          console.warn(`Invalid time slot format for lead ${lead.id}: ${timePart}`);
          return false;
        }
        
        const startTimeStr = timeMatch[1];
        const fullDateTimeStr = `${datePart} ${startTimeStr}`;
        
        // Parse the appointment start time
        const appointmentDate = new Date(fullDateTimeStr);
        
        if (isNaN(appointmentDate.getTime())) {
          console.warn(`Could not parse appointment date for lead ${lead.id}: ${fullDateTimeStr}`);
          return false;
        }
        
        // Check if appointment is approximately 1 hour away (within our 15-minute window)
        const timeDiff = appointmentDate.getTime() - now.getTime();
        const hourInMs = 60 * 60 * 1000;
        const fifteenMinInMs = 15 * 60 * 1000;
        
        const isWithinWindow = timeDiff >= (hourInMs - fifteenMinInMs) && timeDiff <= (hourInMs + fifteenMinInMs);
        
        console.log(`Lead ${lead.id}: appointment at ${appointmentDate.toISOString()}, time diff: ${Math.round(timeDiff / 60000)} minutes, within window: ${isWithinWindow}`);
        
        return isWithinWindow;
      } catch (error) {
        console.error(`Error parsing appointment time for lead ${lead.id}:`, error);
        return false;
      }
    });

    console.log(`${leadsToNotify.length} leads need expiration notifications`);

    if (leadsToNotify.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No leads require notifications at this time',
        processed: 0 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Get seller profiles for the leads that need notifications
    const sellerIds = [...new Set(leadsToNotify.map(lead => lead.seller_id))];
    
    const { data: sellers, error: sellersError } = await supabase
      .from('profiles')
      .select('id, full_name, email, email_notifications_enabled')
      .in('id', sellerIds)
      .eq('email_notifications_enabled', true);

    if (sellersError) {
      console.error('Error fetching seller profiles:', sellersError);
      throw sellersError;
    }

    console.log(`Found ${sellers?.length || 0} sellers with email notifications enabled`);

    if (!sellers || sellers.length === 0) {
      console.log('No sellers found with email notifications enabled');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No sellers with email notifications enabled',
        processed: 0 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Create email service
    const resend = createEmailService();
    const websiteUrl = Deno.env.get('WEBSITE_URL') || 'https://your-domain.com';
    
    let emailsSent = 0;
    let emailsProcessed = 0;
    const processedLeadIds: string[] = [];

    // Send notifications for each qualifying lead
    for (const lead of leadsToNotify) {
      emailsProcessed++;
      
      const seller = sellers.find(s => s.id === lead.seller_id);
      if (!seller || !seller.email) {
        console.warn(`Seller not found or no email for lead ${lead.id}`);
        continue;
      }

      console.log(`Sending expiration notification for lead ${lead.id} to seller ${seller.email}`);

      try {
        // Generate email content
        const formattedPrice = `$${Number(lead.price).toFixed(2)}`;
        const subject = generateExpirationEmailSubject(lead);
        const htmlContent = generateExpirationEmailHtml(lead, formattedPrice, seller.full_name, websiteUrl);

        // Send email
        const emailResult = await sendEmail(resend, seller.email, subject, htmlContent);
        
        if (emailResult.success) {
          console.log(`✅ Expiration notification sent successfully for lead ${lead.id}`);
          emailsSent++;
          processedLeadIds.push(lead.id);
        } else {
          console.error(`❌ Failed to send expiration notification for lead ${lead.id}:`, emailResult.error);
        }
      } catch (error) {
        console.error(`Error sending expiration notification for lead ${lead.id}:`, error);
      }
    }

    // Mark leads as having received expiration warnings
    if (processedLeadIds.length > 0) {
      const { error: updateError } = await supabase
        .from('leads')
        .update({ expiration_warning_sent: true })
        .in('id', processedLeadIds);

      if (updateError) {
        console.error('Error updating expiration_warning_sent status:', updateError);
      } else {
        console.log(`✅ Marked ${processedLeadIds.length} leads as having received expiration warnings`);
      }
    }

    console.log(`=== EXPIRATION NOTIFICATION FUNCTION COMPLETED ===`);
    console.log(`Total leads processed: ${emailsProcessed}`);
    console.log(`Emails sent successfully: ${emailsSent}`);

    return new Response(JSON.stringify({
      success: true,
      message: `Processed ${emailsProcessed} leads, sent ${emailsSent} expiration notifications`,
      emailsSent,
      emailsProcessed,
      processedLeadIds
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('=== EXPIRATION NOTIFICATION FUNCTION ERROR ===');
    console.error('Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Unknown error occurred'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
