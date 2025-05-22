
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log("Starting test-email-sending function");
    
    const apiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!apiKey) {
      console.error("RESEND_API_KEY is not configured!");
      return new Response(
        JSON.stringify({ success: false, error: "RESEND_API_KEY environment variable is not set" }),
        { 
          status: 500, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }
    
    console.log("RESEND_API_KEY is configured");
    
    // Parse request body
    const { email } = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: "Email address is required" }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }
    
    console.log(`Attempting to send test email to: ${email}`);
    
    // Initialize Resend
    const resend = new Resend(apiKey);
    
    // Check if we have a verified domain
    const domainVerified = Deno.env.get("DOMAIN_VERIFIED") === "true";
    const fromDomain = Deno.env.get("FROM_EMAIL")?.split('@')[1] || "yourdomain.com";
    const fromName = "Leads Marketplace";
    
    // Set the from email based on domain verification status
    const fromEmail = domainVerified 
      ? `${fromName} <notifications@${fromDomain}>`
      : "Leads Marketplace <onboarding@resend.dev>";
    
    console.log(`Using from email: ${fromEmail}`);
    
    // Check if we need to redirect to the verified email
    const verifiedEmail = Deno.env.get("VERIFIED_EMAIL") || "stayconnectorg@gmail.com";
    const needsRedirect = !domainVerified && email !== verifiedEmail;
    const effectiveRecipient = needsRedirect ? verifiedEmail : email;
    
    if (needsRedirect) {
      console.warn(`IMPORTANT: Redirecting test email intended for ${email} to ${verifiedEmail} due to domain verification requirements`);
      console.warn(`To send to any recipient, verify a domain at https://resend.com/domains and set DOMAIN_VERIFIED=true`);
    }
    
    // Send a test email 
    const emailResult = await resend.emails.send({
      from: fromEmail,
      to: effectiveRecipient,
      subject: needsRedirect ? `[TEST MODE] Email Notification Test (intended for: ${email})` : "Email Notification Test",
      html: `
        <html>
          <body>
            <h1>Email Test Successful</h1>
            <p>This is a test email to verify that the email sending functionality is working properly.</p>
            <p>If you're receiving this, it means the configuration is correct!</p>
            <p>Date and time of test: ${new Date().toLocaleString()}</p>
            ${needsRedirect ? `
            <p><em>NOTE: This email was sent to ${verifiedEmail} instead of ${email} because your domain has not been verified yet.</em></p>
            <p><em>To send emails to any recipient, please verify your domain at <a href="https://resend.com/domains">Resend's Domain Settings</a> and set DOMAIN_VERIFIED=true</em></p>
            ` : ''}
            <p><em>From: ${fromEmail}</em></p>
          </body>
        </html>
      `,
    });
    
    // Handle the case where Resend returns an error object
    if ('error' in emailResult && emailResult.error) {
      console.error("Resend API Error:", JSON.stringify(emailResult.error));
      
      // Check if this is a domain verification error
      if (emailResult.error.message && emailResult.error.message.includes("verify a domain")) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Domain verification required. Please verify a domain at https://resend.com/domains",
            domainVerificationRequired: true
          }),
          { 
            status: 403, 
            headers: { 
              "Content-Type": "application/json",
              ...corsHeaders
            }
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: emailResult.error.message || "Unknown error from Resend API"
        }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }
    
    console.log("Email sending response:", emailResult);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: needsRedirect ? `Test email sent to ${verifiedEmail} (redirected from ${email})` : "Test email sent successfully",
        id: emailResult.id,
        redirected: needsRedirect
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
    console.error("Error in test-email-sending function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
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
