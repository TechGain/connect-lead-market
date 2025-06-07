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

// Import the buyer pricing utility
import { applyBuyerPriceMarkup } from "./pricing-utils.ts";

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
  
  // Apply buyer markup to the price for email display
  const buyerPrice = applyBuyerPriceMarkup(lead.price);
  const formattedPrice = formatCurrency(buyerPrice);
  const creationDate = formatDate(lead.created_at);
  
  console.log(`Original price: ${lead.price}, Buyer price with markup: ${buyerPrice}, Formatted: ${formattedPrice}`);
  
  // Create email content with the marked-up price
  const emailSubject = generateLeadEmailSubject(lead);
  const emailHtml = generateLeadEmailHtml(lead, formattedPrice, creationDate, websiteUrl);
  
  console.log("Email content prepared:", { subject: emailSubject });
  
  // Send emails to all buyers with rate limiting
  const emailResults = [];
  
  // Use a more conservative delay between email sends to avoid rate limiting
  // Increase from 500ms to 2000ms (2 seconds) to ensure we stay well under Resend's rate limit
  const delayBetweenEmails = 2000; // milliseconds
  
  // Maximum number of retry attempts per email
  const maxRetries = 2;
  
  // Check if we're in test mode without domain verification
  const isTestMode = !Deno.env.get("DOMAIN_VERIFIED");
  const verifiedEmail = Deno.env.get("VERIFIED_EMAIL") || "stayconnectorg@gmail.com";
  
  if (isTestMode) {
    console.warn("======== IMPORTANT NOTICE ========");
    console.warn("Running in TEST MODE: Only emails to the verified address will be sent.");
    console.warn(`Verified email: ${verifiedEmail}`);
    console.warn("To send emails to all buyers, verify a domain at https://resend.com/domains");
    console.warn("Then set DOMAIN_VERIFIED=true in your environment variables");
    console.warn("==================================");
  }
  
  for (const buyer of buyers) {
    console.log(`Sending email to buyer: ${buyer.id}, email: ${buyer.email}`);
    
    let attempts = 0;
    let result;
    
    // Try sending the email with retries for rate-limited requests
    while (attempts <= maxRetries) {
      try {
        // If this is a retry attempt, add an additional delay
        if (attempts > 0) {
          // Exponential backoff - wait longer for each retry
          const retryDelay = delayBetweenEmails * (attempts * 2);
          console.log(`Retry attempt ${attempts} for ${buyer.email}, waiting ${retryDelay}ms`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
        
        result = await sendEmail(resend, buyer.email, emailSubject, emailHtml);
        
        console.log(`Email result for ${buyer.email}:`, result);
        
        // If successful or error is not related to rate limiting, break the retry loop
        if (result.success || !result.rateLimited) {
          break;
        }
        
        attempts++;
      } catch (error) {
        console.error(`Exception sending email to ${buyer.email}:`, error);
        result = {
          success: false,
          error: error.message
        };
        break;
      }
    }
    
    // Record the result
    emailResults.push({
      buyer: buyer.id,
      email: buyer.email,
      ...result,
      attempts
    });
    
    // If this wasn't the last buyer and wasn't rate limited, add the standard delay
    if (buyer !== buyers[buyers.length - 1] && (!result || !result.rateLimited)) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenEmails));
    }
  }
  
  // Count successful emails
  const successCount = emailResults.filter(r => r.success).length;
  const rateLimitedCount = emailResults.filter(r => r.rateLimited).length;
  const redirectedCount = emailResults.filter(r => r.redirected).length;
  const domainVerificationCount = emailResults.filter(r => r.domainVerificationRequired).length;
  const totalAttempts = emailResults.reduce((sum, r) => sum + (r.attempts || 0), 0);
  
  // Create appropriate message
  let message = `Notification sent to ${successCount} buyers`;
  if (rateLimitedCount > 0) {
    message += `. ${rateLimitedCount} emails couldn't be sent due to rate limiting.`;
  }
  if (redirectedCount > 0) {
    message += `. ${redirectedCount} emails were redirected to the verified email because domain verification is required.`;
  }
  if (domainVerificationCount > 0) {
    message += `. Domain verification is required to send emails to all buyers.`;
  }
  
  console.log(`Email notification complete: ${successCount} successful, ${rateLimitedCount} rate limited, ${redirectedCount} redirected, total attempts: ${totalAttempts}`);
  
  return {
    message,
    results: emailResults,
    rateLimited: rateLimitedCount > 0,
    redirected: redirectedCount > 0,
    domainVerificationRequired: domainVerificationCount > 0,
    testMode: isTestMode,
    stats: {
      total: buyers.length,
      successful: successCount,
      rateLimited: rateLimitedCount,
      redirected: redirectedCount,
      domainVerificationRequired: domainVerificationCount,
      totalAttempts
    }
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
