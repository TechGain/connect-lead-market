
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
    
    // Get the FROM email address from environment or use default
    const fromEmail = Deno.env.get("FROM_EMAIL") || "Leads Marketplace <onboarding@resend.dev>";
    
    // With an upgraded Resend account, we can now send to any email address
    // regardless of whether we're using the default sender or not
    
    const emailResponse = await resend.emails.send({
      from: fromEmail,
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
