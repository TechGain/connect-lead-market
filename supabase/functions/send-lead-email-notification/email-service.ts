
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
    
    // The Resend account owner's email - Resend only allows sending to this email with the free tier
    const resendAccountEmail = "stayconnectorg@gmail.com";
    
    // If the target email is not the Resend account owner's email, warn about this limitation
    if (recipient !== resendAccountEmail) {
      console.warn(`Warning: With default Resend domain, emails can only be sent to ${resendAccountEmail}`);
      return { 
        success: false, 
        error: `With the default Resend domain, emails can only be sent to ${resendAccountEmail} until domain verification is complete.`
      };
    }
    
    const emailResponse = await resend.emails.send({
      from: "Leads Marketplace <onboarding@resend.dev>",
      to: recipient,
      subject,
      html: htmlContent,
    });
    
    // Handle the case where Resend returns an error object
    if ('error' in emailResponse && emailResponse.error) {
      console.error(`Resend API Error: ${JSON.stringify(emailResponse.error)}`);
      return { 
        success: false, 
        error: emailResponse.error.message || "Unknown error from Resend API" 
      };
    }
    
    console.log(`Email sent to ${recipient}`, emailResponse);
    return { success: true, id: emailResponse.id };
  } catch (error) {
    console.error(`Failed to send email to ${recipient}:`, error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}
