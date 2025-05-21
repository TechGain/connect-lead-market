
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

// Initialize Resend for sending emails
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Initialize Supabase client with admin privileges
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LeadEmailNotificationRequest {
  leadId: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadId } = await req.json() as LeadEmailNotificationRequest;

    if (!leadId) {
      return new Response(
        JSON.stringify({ error: "Lead ID is required" }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders 
          }
        }
      );
    }

    // Fetch the lead details
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*, profiles!leads_seller_id_fkey(full_name, company)')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      console.error("Error fetching lead:", leadError);
      return new Response(
        JSON.stringify({ error: "Lead not found", details: leadError?.message }),
        { 
          status: 404, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders 
          }
        }
      );
    }

    // Get all active buyers who have enabled email notifications
    const { data: buyers, error: buyersError } = await supabase.rpc('get_active_buyer_emails');

    if (buyersError) {
      console.error("Error fetching buyers:", buyersError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch buyers", details: buyersError.message }),
        { 
          status: 500, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders 
          }
        }
      );
    }

    if (!buyers || buyers.length === 0) {
      console.log("No buyers found with email notifications enabled");
      return new Response(
        JSON.stringify({ message: "No buyers to notify" }),
        { 
          status: 200, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders 
          }
        }
      );
    }

    // Format the lead price
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(lead.price);

    // Format the creation date
    const creationDate = new Date(lead.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Create the email content
    const emailSubject = `New Lead Available: ${lead.type} in ${lead.location}`;
    
    const emailHtml = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4338ca; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            .lead-details { margin: 20px 0; }
            .lead-detail { margin-bottom: 10px; }
            .label { font-weight: bold; }
            .price { color: #059669; font-weight: bold; font-size: 1.2em; }
            .cta-button { 
              display: inline-block; 
              background-color: #4338ca; 
              color: white; 
              padding: 10px 20px; 
              text-decoration: none; 
              border-radius: 5px; 
              margin-top: 20px; 
            }
            .footer { margin-top: 20px; font-size: 0.8em; color: #6b7280; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Lead Alert</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>A new lead has just been uploaded to the marketplace and is now available for purchase.</p>
              
              <div class="lead-details">
                <div class="lead-detail">
                  <span class="label">Lead Type:</span> ${lead.type}
                </div>
                <div class="lead-detail">
                  <span class="label">Location:</span> ${lead.location}
                </div>
                <div class="lead-detail">
                  <span class="label">Price:</span> <span class="price">${formattedPrice}</span>
                </div>
                <div class="lead-detail">
                  <span class="label">Description:</span> ${lead.description || 'No description provided'}
                </div>
                <div class="lead-detail">
                  <span class="label">Date Added:</span> ${creationDate}
                </div>
                <div class="lead-detail">
                  <span class="label">Seller:</span> ${lead.profiles?.full_name || 'Unknown'} ${lead.profiles?.company ? `(${lead.profiles.company})` : ''}
                </div>
              </div>
              
              <p>Don't miss out on this opportunity!</p>
              <a href="${supabaseUrl.replace('.supabase.co', '.lovable.app')}/marketplace" class="cta-button">View Lead in Marketplace</a>
            </div>
            <div class="footer">
              <p>You're receiving this email because you've enabled lead notifications. 
              You can manage your notification preferences in your profile settings.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send emails to all buyers
    const emailResults = [];
    for (const buyer of buyers) {
      try {
        const emailResponse = await resend.emails.send({
          from: "Leads Marketplace <notifications@resend.dev>", // Using Resend's default domain for now
          to: buyer.email,
          subject: emailSubject,
          html: emailHtml,
        });
        
        emailResults.push({
          buyer: buyer.id,
          email: buyer.email,
          success: true,
          id: emailResponse.id
        });
        
        console.log(`Email sent to ${buyer.email}`, emailResponse);
      } catch (error) {
        console.error(`Failed to send email to ${buyer.email}:`, error);
        emailResults.push({
          buyer: buyer.id,
          email: buyer.email,
          success: false,
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Notification sent to ${emailResults.filter(r => r.success).length} buyers`,
        results: emailResults
      }),
      { 
        status: 200, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        }
      }
    );

  } catch (error) {
    console.error("Error in send-lead-email-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        }
      }
    );
  }
});
