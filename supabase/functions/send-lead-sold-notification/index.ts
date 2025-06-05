
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";
import { generateLeadSoldEmailHtml, generateLeadSoldEmailSubject } from "./email-templates.ts";

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[LEAD-SOLD-NOTIFICATION] ${step}${detailsStr}`);
};

// Email service functions
function createEmailService() {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  
  if (!apiKey) {
    console.error("RESEND_API_KEY environment variable is not set!");
    throw new Error("RESEND_API_KEY is not configured");
  } else {
    console.log("Resend API key is configured properly (key starts with:", apiKey.substring(0, 8) + "...)");
  }
  
  const resend = new Resend(apiKey);
  return resend;
}

async function sendEmail(
  resend: Resend,
  recipient: string,
  subject: string,
  htmlContent: string
) {
  try {
    console.log(`=== SENDING EMAIL ===`);
    console.log(`Recipient: ${recipient}`);
    console.log(`Subject: ${subject}`);
    
    if (!recipient) {
      console.error("No recipient email provided");
      return { success: false, error: "No recipient email provided" };
    }
    
    // Get the FROM email address configured properly
    const fromName = "Leads Marketplace";
    const fromEmail = Deno.env.get("FROM_EMAIL") || "info@stayconnectus.com";
    const fromAddress = `${fromName} <${fromEmail}>`;
    
    console.log(`From address: ${fromAddress}`);
    
    // Get verification settings
    const verifiedEmail = Deno.env.get("VERIFIED_EMAIL") || "stayconnectorg@gmail.com";
    const rawDomainVerifiedValue = Deno.env.get("DOMAIN_VERIFIED");
    console.log(`Raw DOMAIN_VERIFIED value: "${rawDomainVerifiedValue}"`);
    
    // More robust checking for domain verification
    const domainVerifiedValue = (rawDomainVerifiedValue || "").trim().toLowerCase();
    const isDomainVerified = ["true", "1", "yes", "y"].includes(domainVerifiedValue);
    
    console.log(`Domain verified: ${isDomainVerified}`);
    
    // For testing, let's use Resend's default domain if domain isn't verified
    const useResendDefault = !isDomainVerified;
    const effectiveFromAddress = useResendDefault 
      ? "Leads Marketplace <onboarding@resend.dev>" 
      : fromAddress;
    
    const needsRedirect = !isDomainVerified && recipient !== verifiedEmail;
    const effectiveRecipient = needsRedirect ? verifiedEmail : recipient;
    
    if (needsRedirect) {
      console.warn(`Redirecting email from ${recipient} to ${verifiedEmail} (domain not verified)`);
    }
    
    if (useResendDefault) {
      console.log(`Using Resend default domain for sending`);
    }
    
    console.log(`Final from address: ${effectiveFromAddress}`);
    console.log(`Final recipient: ${effectiveRecipient}`);
    
    const emailPayload = {
      from: effectiveFromAddress,
      to: effectiveRecipient,
      subject: needsRedirect ? `[TEST MODE] ${subject} (intended for: ${recipient})` : subject,
      html: htmlContent,
    };
    
    console.log('Email payload:', JSON.stringify(emailPayload, null, 2));
    
    const emailResponse = await resend.emails.send(emailPayload);
    
    console.log('Resend API response:', JSON.stringify(emailResponse, null, 2));
    
    // Handle the case where Resend returns an error object
    if ('error' in emailResponse && emailResponse.error) {
      console.error(`Resend API Error:`, emailResponse.error);
      
      // Check if this is a domain verification error
      if (emailResponse.error.message && emailResponse.error.message.includes("verify a domain")) {
        return {
          success: false,
          error: "Domain verification required. Please verify a domain at https://resend.com/domains",
          domainVerificationRequired: true
        };
      }
      
      return { 
        success: false, 
        error: emailResponse.error.message || "Unknown error from Resend API" 
      };
    }
    
    // If we're in test mode but not sending to the intended recipient, mark as redirected
    const redirected = needsRedirect;
    
    console.log(`Email sent successfully to ${redirected ? verifiedEmail + ' (redirected)' : recipient}`);
    console.log('Email ID:', emailResponse.id);
    
    return { 
      success: true, 
      id: emailResponse.id,
      redirected,
      intendedRecipient: redirected ? recipient : undefined
    };
  } catch (error) {
    console.error(`=== EMAIL SENDING FAILED ===`);
    console.error(`Failed to send email to ${recipient}:`, error);
    
    // Handle rate limiting specifically
    if (error.message && error.message.includes("Too many requests")) {
      console.error(`Rate limit exceeded for ${recipient}:`, error);
      return { 
        success: false, 
        error: "Rate limit exceeded. Please try again in a few seconds.",
        rateLimited: true
      };
    }
    
    return { 
      success: false, 
      error: error.message 
    };
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    logStep("Function started");
    
    // Parse request body
    const { leadId } = await req.json();
    if (!leadId) {
      throw new Error("Lead ID is required");
    }
    
    logStep("Processing lead sold notification", { leadId });
    
    // Initialize Supabase client with service role key for admin access
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    // Fetch the sold lead details
    logStep("Fetching lead details");
    const { data: lead, error: leadError } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .eq('status', 'sold')
      .single();
    
    if (leadError) {
      throw new Error(`Failed to fetch lead: ${leadError.message}`);
    }
    
    if (!lead) {
      throw new Error('Lead not found or not sold');
    }
    
    logStep("Lead found", { leadType: lead.type, location: lead.location, sellerId: lead.seller_id });
    
    // Fetch seller profile
    logStep("Fetching seller profile");
    const { data: seller, error: sellerError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', lead.seller_id)
      .single();
    
    if (sellerError) {
      throw new Error(`Failed to fetch seller profile: ${sellerError.message}`);
    }
    
    if (!seller || !seller.email) {
      logStep("No seller email found", { sellerId: lead.seller_id });
      return new Response(
        JSON.stringify({ success: false, error: "Seller email not found" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        }
      );
    }
    
    logStep("Seller found", { sellerEmail: seller.email, sellerName: seller.full_name });
    
    // Fetch buyer profile (optional, for email content)
    let buyer = { full_name: 'Anonymous Buyer' };
    if (lead.buyer_id) {
      logStep("Fetching buyer profile");
      const { data: buyerData, error: buyerError } = await supabaseAdmin
        .from('profiles')
        .select('full_name')
        .eq('id', lead.buyer_id)
        .single();
      
      if (!buyerError && buyerData) {
        buyer = buyerData;
        logStep("Buyer found", { buyerName: buyer.full_name });
      }
    }
    
    // Format price and date
    const formattedPrice = `$${parseFloat(lead.price).toFixed(2)}`;
    const saleDate = new Date(lead.purchased_at || lead.updated_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Get website URL
    const websiteUrl = Deno.env.get("WEBSITE_URL") || "https://stayconnectus.com";
    
    // Generate email content
    logStep("Generating email content");
    const htmlContent = generateLeadSoldEmailHtml(
      lead,
      seller,
      buyer,
      formattedPrice,
      saleDate,
      websiteUrl
    );
    
    const subject = generateLeadSoldEmailSubject(lead, formattedPrice);
    
    // Initialize email service
    logStep("Initializing email service");
    const resend = createEmailService();
    
    // Send email to seller
    logStep("Sending email to seller", { 
      sellerEmail: seller.email,
      subject 
    });
    
    const emailResult = await sendEmail(
      resend,
      seller.email,
      subject,
      htmlContent
    );
    
    logStep("Email sending completed", emailResult);
    
    if (!emailResult.success) {
      throw new Error(`Failed to send email: ${emailResult.error}`);
    }
    
    logStep("Lead sold notification sent successfully", {
      leadId,
      sellerEmail: seller.email,
      emailId: emailResult.id
    });
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Lead sold notification sent successfully",
        emailId: emailResult.id,
        redirected: emailResult.redirected || false
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in send-lead-sold-notification", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
