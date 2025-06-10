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

async function fetchQualifiedBuyers(leadType: string, leadLocation: string) {
  try {
    console.log('Fetching qualified buyers for lead type:', leadType, 'and location:', leadLocation);
    
    // First get all buyers with email notifications enabled
    const { data: allBuyers, error: buyersError } = await supabase
      .from('profiles')
      .select('email, full_name, id')
      .eq('role', 'buyer')
      .eq('email_notifications_enabled', true)
      .not('email', 'is', null);
    
    if (buyersError) {
      console.error("Error fetching buyers:", buyersError);
      throw new Error(buyersError.message);
    }
    
    if (!allBuyers || allBuyers.length === 0) {
      console.log('No buyers found with email notifications enabled');
      return [];
    }

    // Now check notification preferences for each buyer
    const qualifiedBuyers = [];
    
    for (const buyer of allBuyers) {
      const { data: preferences, error: prefError } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', buyer.id)
        .maybeSingle();

      if (prefError) {
        console.error(`Error fetching preferences for buyer ${buyer.id}:`, prefError);
        continue;
      }

      // If no preferences exist, include the buyer (default behavior)
      if (!preferences) {
        console.log(`No preferences found for buyer ${buyer.id}, including by default`);
        qualifiedBuyers.push(buyer);
        continue;
      }

      // Check if email notifications are enabled in preferences
      if (!preferences.email_notifications_enabled) {
        console.log(`Email notifications disabled for buyer ${buyer.id}`);
        continue;
      }

      // Check lead type preferences
      const preferredTypes = preferences.preferred_lead_types || [];
      const typeMatches = preferredTypes.length === 0 || preferredTypes.includes(leadType);

      // Check location preferences
      const preferredLocations = preferences.preferred_locations || [];
      const locationMatches = preferredLocations.length === 0 || preferredLocations.includes(leadLocation);

      if (typeMatches && locationMatches) {
        console.log(`Buyer ${buyer.id} qualifies for this lead (type: ${typeMatches}, location: ${locationMatches})`);
        qualifiedBuyers.push(buyer);
      } else {
        console.log(`Buyer ${buyer.id} does not qualify (type: ${typeMatches}, location: ${locationMatches})`);
      }
    }
    
    console.log(`Found ${qualifiedBuyers.length} qualified buyers out of ${allBuyers.length} total buyers`);
    return qualifiedBuyers;
  } catch (error) {
    console.error("Exception fetching qualified buyers:", error);
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
    
    // Get qualified buyers based on lead type and location preferences
    const buyers = await fetchQualifiedBuyers(lead.type, lead.location);
    
    if (buyers.length === 0) {
      console.log("No qualified buyers found for this lead");
      await updateNotificationAttempt(leadId, 'failed', 'No qualified buyers found for this lead type and location');
      return { 
        message: "No qualified buyers to notify", 
        results: [],
        success: false,
        reason: 'no_qualified_buyers'
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
    
    // Send emails to all qualified buyers with rate limiting
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
    let message = `Notification sent to ${successCount} qualified buyers`;
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
    console.log(`Total qualified buyers: ${buyers.length}`);
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
    
    // Get content info
    const contentLength = req.headers.get('content-length');
    const contentType = req.headers.get('content-type');
    console.log("Content-Length:", contentLength);
    console.log("Content-Type:", contentType);
    
    let bodyText = '';
    let leadId;
    
    // PRIMARY FIX: Check headers first for leadId (most reliable)
    const headerLeadId = req.headers.get('x-lead-id') || req.headers.get('X-Lead-ID');
    if (headerLeadId) {
      console.log("SUCCESS: Found leadId in headers:", headerLeadId);
      leadId = headerLeadId;
    } else {
      console.log("No leadId found in headers, checking body and URL params...");
      
      // Read the body text
      try {
        bodyText = await req.text();
        console.log("Raw body text received:", bodyText);
        console.log("Body text length:", bodyText.length);
      } catch (readError) {
        console.error("Failed to read request body text:", readError);
        return createJsonResponse({ 
          error: "Failed to read request body", 
          details: readError.message 
        }, 400);
      }
      
      // If we have body content, try to parse it as JSON
      if (bodyText && bodyText.trim() !== '') {
        try {
          const body = JSON.parse(bodyText);
          leadId = body.leadId;
          console.log("Successfully parsed JSON body:", body);
          console.log("Extracted leadId from body:", leadId);
        } catch (parseError) {
          console.error("JSON parsing error:", parseError);
          console.error("Failed to parse body:", bodyText);
          
          // Try to extract leadId from malformed JSON
          const leadIdMatch = bodyText.match(/"?leadId"?\s*:\s*"?([^",}\s]+)"?/i);
          if (leadIdMatch) {
            leadId = leadIdMatch[1];
            console.log("Extracted leadId from malformed JSON:", leadId);
          }
        }
      }
      
      // If still no leadId, check URL params as final fallback
      if (!leadId) {
        console.log("No leadId in body, checking URL params...");
        const url = new URL(req.url);
        const urlLeadId = url.searchParams.get('leadId');
        if (urlLeadId) {
          console.log("Found leadId in URL params:", urlLeadId);
          leadId = urlLeadId;
        }
      }
    }

    if (!leadId) {
      console.error("CRITICAL: No leadId found after all parsing strategies");
      console.error("Checked: headers, body, URL params");
      console.error("Headers received:", Object.fromEntries(req.headers.entries()));
      console.error("Body received:", bodyText);
      return createJsonResponse({ 
        error: "Lead ID is required", 
        received: { 
          headers: Object.fromEntries(req.headers.entries()),
          bodyText, 
          contentLength, 
          contentType 
        },
        hint: "Please provide leadId in X-Lead-ID header or request body as JSON: { \"leadId\": \"your-lead-id\" }"
      }, 400);
    }

    console.log(`SUCCESS: Using leadId: ${leadId}`);
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
