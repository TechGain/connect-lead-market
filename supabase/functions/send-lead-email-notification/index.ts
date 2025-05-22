
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Import refactored modules
import { createEmailService, sendEmail } from "./email-service.ts";
import { generateLeadEmailHtml, generateLeadEmailSubject } from "./email-templates.ts";
import { 
  corsHeaders, 
  createJsonResponse, 
  formatCurrency, 
  formatDate 
} from "./utils.ts";

// Initialize services
const resend = createEmailService();

// Initialize Supabase client with admin privileges
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Get the website URL from environment or use a fallback
const websiteUrl = Deno.env.get('WEBSITE_URL') || 'https://stayconnectus.com';

interface LeadEmailNotificationRequest {
  leadId: string;
}

async function fetchLeadDetails(leadId: string) {
  // Modified query to not use the foreign key relationship that was causing errors
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();
  
  if (leadError || !lead) {
    console.error("Error fetching lead:", leadError);
    throw new Error(leadError?.message || "Lead not found");
  }
  
  return lead;
}

async function fetchActiveBuyers() {
  try {
    // Use a direct query instead of the function that might be problematic
    const { data: buyers, error: buyersError } = await supabase
      .from('profiles')
      .select('email, full_name, id')
      .eq('role', 'buyer')
      .eq('email_notifications_enabled', true)
      .not('email', 'is', null);
    
    if (buyersError) {
      console.error("Error fetching buyers:", buyersError);
      throw new Error(buyersError.message);
    }
    
    return buyers || [];
  } catch (error) {
    console.error("Exception fetching buyers:", error);
    throw error;
  }
}

async function processLeadNotification(leadId: string) {
  console.log("Processing lead notification for lead ID:", leadId);
  
  // Fetch the lead details
  const lead = await fetchLeadDetails(leadId);
  console.log("Lead details fetched:", lead.id, lead.type);
  
  // Get all active buyers who have enabled email notifications
  const buyers = await fetchActiveBuyers();
  console.log(`Found ${buyers.length} buyers with email notifications enabled`);
  
  if (buyers.length === 0) {
    console.log("No buyers found with email notifications enabled");
    return { message: "No buyers to notify", results: [] };
  }
  
  // Format the lead data for display in email
  const formattedPrice = formatCurrency(lead.price);
  const creationDate = formatDate(lead.created_at);
  
  // Create email content
  const emailSubject = generateLeadEmailSubject(lead);
  const emailHtml = generateLeadEmailHtml(lead, formattedPrice, creationDate, websiteUrl);
  
  console.log("Email content prepared:", { subject: emailSubject });
  
  // Send emails to all buyers with rate limiting
  const emailResults = [];
  
  // Use a delay between email sends to avoid rate limiting
  const delayBetweenEmails = 500; // milliseconds
  
  for (const buyer of buyers) {
    console.log(`Sending email to buyer: ${buyer.id}, email: ${buyer.email}`);
    
    try {
      const result = await sendEmail(resend, buyer.email, emailSubject, emailHtml);
      
      console.log(`Email result for ${buyer.email}:`, result);
      
      emailResults.push({
        buyer: buyer.id,
        email: buyer.email,
        ...result
      });
      
      // If this was successful and we have more emails to send, add a delay
      if (result.success && buyer !== buyers[buyers.length - 1]) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenEmails));
      }
    } catch (error) {
      console.error(`Exception sending email to ${buyer.email}:`, error);
      emailResults.push({
        buyer: buyer.id,
        email: buyer.email,
        success: false,
        error: error.message
      });
    }
  }
  
  // Count successful emails
  const successCount = emailResults.filter(r => r.success).length;
  const rateLimitedCount = emailResults.filter(r => r.rateLimited).length;
  
  // Create appropriate message
  let message = `Notification sent to ${successCount} buyers`;
  if (rateLimitedCount > 0) {
    message += `. ${rateLimitedCount} emails couldn't be sent due to rate limiting.`;
  }
  
  return {
    message,
    results: emailResults,
    rateLimited: rateLimitedCount > 0
  };
}

// Main request handler
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received request to send-lead-email-notification");
    
    const body = await req.json();
    const { leadId } = body as LeadEmailNotificationRequest;

    if (!leadId) {
      console.error("Missing leadId in request");
      return createJsonResponse({ error: "Lead ID is required" }, 400);
    }

    console.log(`Processing notification for lead: ${leadId}`);
    const result = await processLeadNotification(leadId);
    console.log("Notification processing completed:", result);
    return createJsonResponse(result);

  } catch (error) {
    console.error("Error in send-lead-email-notification function:", error);
    return createJsonResponse({ error: error.message }, 500);
  }
});
