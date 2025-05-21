
/**
 * Email sending service for lead notifications
 */
import { Resend } from "npm:resend@2.0.0";

/**
 * Initialize Resend with API key
 */
export function createEmailService() {
  const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
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
    const emailResponse = await resend.emails.send({
      from: "Leads Marketplace <info@stayconnectus.com>",
      to: recipient,
      subject,
      html: htmlContent,
    });
    
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
