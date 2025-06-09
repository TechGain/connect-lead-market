
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

async function updateNotificationAttempt(
  leadId: string, 
  status: 'success' | 'failed',
  errorDetails?: string,
  functionResponse?: any
) {
  try {
    console.log(`Updating notification attempt: ${leadId} -> ${status}`);
    
    const updateData: any = {
      status,
      completed_at: new Date().toISOString()
    };

    if (errorDetails) {
      updateData.error_details = errorDetails;
    }

    if (functionResponse) {
      updateData.function_response = functionResponse;
    }

    const { error } = await supabase
      .from('notification_attempts')
      .update(updateData)
      .eq('lead_id', leadId)
      .eq('notification_type', 'email')
      .eq('status', 'pending');

    if (error) {
      console.error('Failed to update notification attempt:', error);
    } else {
      console.log('Notification attempt updated successfully');
    }
  } catch (err) {
    console.error('Exception updating notification attempt:', err);
  }
}

async function fetchLeadDetails(leadId: string) {
  console.log(`Fetching lead details for: ${leadId}`);
  
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();
  
  if (leadError || !lead) {
    console.error("Error fetching lead:", leadError);
    throw new Error(leadError?.message || "Lead not found");
  }
  
  console.log(`Lead details fetched:`, {
    id: lead.id,
    type: lead.type,
    location: lead.location,
    price: lead.price,
    status: lead.status
  });
  
  return lead;
}

async function fetchActiveBuyers() {
  try {
    console.log('Fetching active buyers with email notifications enabled...');
    
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
    
    console.log(`Found ${buyers?.length || 0} buyers with email notifications enabled`);
    
    return buyers || [];
  } catch (error) {
    console.error("Exception fetching buyers:", error);
    throw error;
  }
}

async function processLeadNotification(leadId: string) {
  console.log("=== EMAIL NOTIFICATION FUNCTION STARTED ===");
  console.log("Processing lead notification for lead ID:", leadId);
  console.log("Timestamp:", new Date().toISOString());
  console.log("Environment check:");
  console.log("- SUPABASE_URL:", Deno.env.get('SUPABASE_URL') ? 'SET' : 'NOT SET');
  console.log("- SUPABASE_SERVICE_ROLE_KEY:", Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'SET' : 'NOT SET');
  console.log("- RESEND_API_KEY:", Deno.env.get('RESEND_API_KEY') ? 'SET' : 'NOT SET');
  console.log("- DOMAIN_VERIFIED:", Deno.env.get('DOMAIN_VERIFIED') || 'NOT SET');
  console.log("- FROM_EMAIL:", Deno.env.get('FROM_EMAIL') || 'NOT SET');
  console.log("- VERIFIED_EMAIL:", Deno.env.get('VERIFIED_EMAIL') || 'NOT SET');
  
  try {
    // Fetch the lead details
    const lead = await fetchLeadDetails(leadId);
    
    // Get all active buyers who have enabled email notifications
    const buyers = await fetchActiveBuyers();
    
    if (buyers.length === 0) {
      console.log("No buyers found with email notifications enabled");
      await updateNotificationAttempt(leadId, 'failed', 'No buyers with email notifications enabled');
      return { 
        message: "No buyers to notify", 
        results: [],
        success: false,
        reason: 'no_buyers'
      };
    }
    
    // Apply buyer markup to the price for email display
    const buyerPrice = applyBuyerPriceMarkup(lead.price);
    const formattedPrice = formatCurrency(buyerPrice);
    const creationDate = formatDate(lead.created_at);
    
    console.log(`Price calculation: Original: ${lead.price}, With markup: ${buyerPrice}, Formatted: ${formattedPrice}`);
    
    // Create email content with the marked-up price
    const emailSubject = generateLeadEmailSubject(lead);
    const emailHtml = generateLeadEmailHtml(lead, formattedPrice, creationDate, websiteUrl);
    
    console.log("Email content prepared:");
    console.log("- Subject:", emailSubject);
    console.log("- HTML length:", emailHtml.length);
    
    // Send emails to all buyers with rate limiting
    const emailResults = [];
    
    // Use a more conservative delay between email sends to avoid rate limiting
    const delayBetweenEmails = 2000; // milliseconds
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
      console.log(`\n--- Processing buyer ${buyer.id} (${buyer.email}) ---`);
      
      let attempts = 0;
      let result;
      
      // Try sending the email with retries for rate-limited requests
      while (attempts <= maxRetries) {
        try {
          // If this is a retry attempt, add an additional delay
          if (attempts > 0) {
            const retryDelay = delayBetweenEmails * (attempts * 2);
            console.log(`Retry attempt ${attempts} for ${buyer.email}, waiting ${retryDelay}ms`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
          
          console.log(`Sending email attempt ${attempts + 1} to ${buyer.email}`);
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
            error: error.message,
            exception: true
          };
          break;
        }
      }
      
      // Record the result
      emailResults.push({
        buyer: buyer.id,
        email: buyer.email,
        ...result,
        attempts: attempts + 1
      });
      
      // If this wasn't the last buyer and wasn't rate limited, add the standard delay
      if (buyer !== buyers[buyers.length - 1] && (!result || !result.rateLimited)) {
        console.log(`Waiting ${delayBetweenEmails}ms before next email...`);
        await new Promise(resolve => setTimeout(resolve, delayBetweenEmails));
      }
    }
    
    // Count successful emails
    const successCount = emailResults.filter(r => r.success).length;
    const rateLimitedCount = emailResults.filter(r => r.rateLimited).length;
    const redirectedCount = emailResults.filter(r => r.redirected).length;
    const domainVerificationCount = emailResults.filter(r => r.domainVerificationRequired).length;
    const apiKeyErrorCount = emailResults.filter(r => r.apiKeyError).length;
    const networkErrorCount = emailResults.filter(r => r.networkError).length;
    const totalAttempts = emailResults.reduce((sum, r) => sum + (r.attempts || 0), 0);
    
    // Create appropriate message
    let message = `Notification sent to ${successCount} buyers`;
    let success = successCount > 0;
    
    if (apiKeyErrorCount > 0) {
      message += `. ${apiKeyErrorCount} emails failed due to API key issues.`;
    }
    if (networkErrorCount > 0) {
      message += `. ${networkErrorCount} emails failed due to network issues.`;
    }
    if (rateLimitedCount > 0) {
      message += `. ${rateLimitedCount} emails couldn't be sent due to rate limiting.`;
    }
    if (redirectedCount > 0) {
      message += `. ${redirectedCount} emails were redirected to the verified email because domain verification is required.`;
    }
    if (domainVerificationCount > 0) {
      message += `. Domain verification is required to send emails to all buyers.`;
    }
    
    console.log(`\n=== EMAIL NOTIFICATION SUMMARY ===`);
    console.log(`Total buyers: ${buyers.length}`);
    console.log(`Successful emails: ${successCount}`);
    console.log(`Rate limited: ${rateLimitedCount}`);
    console.log(`Redirected: ${redirectedCount}`);
    console.log(`API key errors: ${apiKeyErrorCount}`);
    console.log(`Network errors: ${networkErrorCount}`);
    console.log(`Domain verification issues: ${domainVerificationCount}`);
    console.log(`Total attempts: ${totalAttempts}`);
    console.log(`Test mode: ${isTestMode}`);
    console.log("==================================");
    
    // Update notification attempt status
    if (success) {
      await updateNotificationAttempt(leadId, 'success', null, {
        message,
        results: emailResults,
        stats: {
          total: buyers.length,
          successful: successCount,
          rateLimited: rateLimitedCount,
          redirected: redirectedCount,
          apiKeyErrors: apiKeyErrorCount,
          networkErrors: networkErrorCount,
          totalAttempts
        }
      });
    } else {
      await updateNotificationAttempt(leadId, 'failed', 'No emails sent successfully', {
        message,
        results: emailResults,
        stats: {
          total: buyers.length,
          successful: successCount,
          rateLimited: rateLimitedCount,
          redirected: redirectedCount,
          apiKeyErrors: apiKeyErrorCount,
          networkErrors: networkErrorCount,
          totalAttempts
        }
      });
    }
    
    return {
      message,
      results: emailResults,
      rateLimited: rateLimitedCount > 0,
      redirected: redirectedCount > 0,
      domainVerificationRequired: domainVerificationCount > 0,
      apiKeyError: apiKeyErrorCount > 0,
      networkError: networkErrorCount > 0,
      testMode: isTestMode,
      success,
      stats: {
        total: buyers.length,
        successful: successCount,
        rateLimited: rateLimitedCount,
        redirected: redirectedCount,
        domainVerificationRequired: domainVerificationCount,
        apiKeyErrors: apiKeyErrorCount,
        networkErrors: networkErrorCount,
        totalAttempts
      }
    };

  } catch (error) {
    console.error("=== CRITICAL ERROR IN LEAD NOTIFICATION ===");
    console.error("Error processing lead notification:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    await updateNotificationAttempt(leadId, 'failed', error.message);
    throw error;
  }
}

// Main request handler
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== NEW REQUEST RECEIVED ===");
    console.log("Method:", req.method);
    console.log("URL:", req.url);
    console.log("Headers:", Object.fromEntries(req.headers.entries()));
    
    // Improved body parsing with multiple fallback strategies
    const contentLength = req.headers.get('content-length');
    const contentType = req.headers.get('content-type');
    console.log("Content-Length:", contentLength);
    console.log("Content-Type:", contentType);
    
    let body;
    let leadId;
    
    // Strategy 1: Try to read body text first
    let bodyText = '';
    try {
      bodyText = await req.text();
      console.log("Raw body text:", bodyText);
      console.log("Body text length:", bodyText.length);
    } catch (readError) {
      console.error("Failed to read request body text:", readError);
    }
    
    if (!bodyText || bodyText.trim() === '') {
      console.log("Empty body detected, checking URL params and headers for leadId...");
      
      // Strategy 2: Check URL parameters
      const url = new URL(req.url);
      const urlLeadId = url.searchParams.get('leadId');
      if (urlLeadId) {
        console.log("Found leadId in URL params:", urlLeadId);
        leadId = urlLeadId;
      } else {
        // Strategy 3: Check headers
        const headerLeadId = req.headers.get('x-lead-id');
        if (headerLeadId) {
          console.log("Found leadId in headers:", headerLeadId);
          leadId = headerLeadId;
        } else {
          console.error("No leadId found in body, URL params, or headers");
          return createJsonResponse({ 
            error: "Lead ID is required", 
            hint: "Please provide leadId in request body as JSON, URL parameter, or x-lead-id header",
            debug: {
              bodyLength: bodyText.length,
              contentLength,
              contentType,
              urlParams: Object.fromEntries(url.searchParams.entries()),
              method: req.method
            }
          }, 400);
        }
      }
    } else {
      // Strategy 4: Parse JSON body
      try {
        body = JSON.parse(bodyText);
        leadId = body.leadId;
        console.log("Successfully parsed JSON body:", body);
      } catch (parseError) {
        console.error("JSON parsing error:", parseError);
        console.error("Failed to parse body:", bodyText);
        
        // Strategy 5: Try to extract leadId from malformed JSON
        const leadIdMatch = bodyText.match(/"?leadId"?\s*:\s*"?([^",}\s]+)"?/i);
        if (leadIdMatch) {
          leadId = leadIdMatch[1];
          console.log("Extracted leadId from malformed JSON:", leadId);
        } else {
          return createJsonResponse({ 
            error: "Invalid JSON in request body", 
            details: parseError.message,
            bodyReceived: bodyText,
            hint: "Please provide valid JSON like { \"leadId\": \"your-lead-id\" }"
          }, 400);
        }
      }
    }

    if (!leadId) {
      console.error("No leadId found after all parsing strategies");
      return createJsonResponse({ 
        error: "Lead ID is required", 
        received: { body, bodyText, contentLength, contentType },
        hint: "Please provide leadId in request body, URL parameter, or header"
      }, 400);
    }

    console.log(`Processing notification for lead: ${leadId}`);
    const result = await processLeadNotification(leadId);
    console.log("Notification processing completed successfully:", result);
    return createJsonResponse(result);

  } catch (error) {
    console.error("=== UNHANDLED ERROR IN REQUEST HANDLER ===");
    console.error("Error in send-lead-email-notification function:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return createJsonResponse({ 
      error: error.message,
      details: {
        name: error.name,
        stack: error.stack
      }
    }, 500);
  }
});
