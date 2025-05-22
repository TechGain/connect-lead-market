
/**
 * Email sending service for lead notifications
 */
import { Resend } from "npm:resend@2.0.0";

/**
 * Initialize Resend with API key
 */
export function createEmailService() {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  
  if (!apiKey) {
    console.error("RESEND_API_KEY environment variable is not set!");
    throw new Error("RESEND_API_KEY is not configured");
  } else {
    console.log("Resend API key is configured properly");
  }
  
  const resend = new Resend(apiKey);
  return resend;
}

/**
 * Send email to a buyer
 */
export async function sendEmail(
  resend: Resend,
  recipient: string,
  subject: string,
  htmlContent: string
) {
  try {
    console.log(`Attempting to send email to ${recipient}`);
    
    if (!recipient) {
      console.error("No recipient email provided");
      return { success: false, error: "No recipient email provided" };
    }
    
    // Get the FROM email address configured properly - use the full email
    const fromName = "Leads Marketplace";
    const fromEmail = Deno.env.get("FROM_EMAIL") || "info@stayconnectus.com";
    const fromAddress = `${fromName} <${fromEmail}>`;
    
    // For logging and debugging
    console.log(`Using from email: ${fromAddress}`);
    
    const verifiedEmail = Deno.env.get("VERIFIED_EMAIL") || "stayconnectorg@gmail.com";
    
    // Log the raw value of DOMAIN_VERIFIED for debugging
    const rawDomainVerifiedValue = Deno.env.get("DOMAIN_VERIFIED");
    console.log(`Raw DOMAIN_VERIFIED value: "${rawDomainVerifiedValue}"`);
    
    // More robust checking for domain verification
    // Check for various truthy values: "true", "TRUE", "1", "yes", etc.
    const domainVerifiedValue = (Deno.env.get("DOMAIN_VERIFIED") || "").trim().toLowerCase();
    const isTestMode = !["true", "1", "yes", "y"].includes(domainVerifiedValue);
    
    console.log(`Test mode (domain not verified): ${isTestMode}`);
    
    const effectiveRecipient = isTestMode ? verifiedEmail : recipient;
    
    // If we're in test mode and not sending to the verified email, log a warning
    if (isTestMode && recipient !== verifiedEmail) {
      console.warn(`IMPORTANT: In test mode - redirecting email intended for ${recipient} to ${verifiedEmail} due to domain verification requirements`);
      console.warn(`To send to all recipients, verify a domain at https://resend.com/domains and set DOMAIN_VERIFIED=true in your environment`);
    }
    
    const emailResponse = await resend.emails.send({
      from: isTestMode ? "Leads Marketplace <onboarding@resend.dev>" : fromAddress,
      to: effectiveRecipient,
      subject: isTestMode && recipient !== verifiedEmail ? `[TEST MODE] ${subject} (intended for: ${recipient})` : subject,
      html: htmlContent,
    });
    
    // Handle the case where Resend returns an error object
    if ('error' in emailResponse && emailResponse.error) {
      console.error(`Resend API Error: ${JSON.stringify(emailResponse.error)}`);
      
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
    const redirected = isTestMode && recipient !== verifiedEmail;
    
    console.log(`Email sent to ${redirected ? verifiedEmail + ' (redirected)' : recipient}`, emailResponse);
    return { 
      success: true, 
      id: emailResponse.id,
      redirected,
      intendedRecipient: redirected ? recipient : undefined
    };
  } catch (error) {
    // Handle rate limiting specifically
    if (error.message && error.message.includes("Too many requests")) {
      console.error(`Rate limit exceeded for ${recipient}:`, error);
      return { 
        success: false, 
        error: "Rate limit exceeded. Please try again in a few seconds.",
        rateLimited: true
      };
    }
    
    console.error(`Failed to send email to ${recipient}:`, error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}
