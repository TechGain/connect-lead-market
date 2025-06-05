
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
    console.log("Resend API key is configured properly (key starts with:", apiKey.substring(0, 8) + "...)");
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
