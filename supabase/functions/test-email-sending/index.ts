
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
    console.log("=== TEST EMAIL FUNCTION STARTED ===");
    
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
    
    console.log("RESEND_API_KEY is configured (starts with:", apiKey.substring(0, 8) + "...)");
    
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
    
    // Get environment variables for debugging
    const rawDomainVerifiedValue = Deno.env.get("DOMAIN_VERIFIED");
    const fromEmail = Deno.env.get("FROM_EMAIL") || "info@stayconnectus.com";
    const verifiedEmail = Deno.env.get("VERIFIED_EMAIL") || "stayconnectorg@gmail.com";
    
    console.log(`Raw DOMAIN_VERIFIED value: "${rawDomainVerifiedValue}"`);
    console.log(`FROM_EMAIL: "${fromEmail}"`);
    console.log(`VERIFIED_EMAIL: "${verifiedEmail}"`);
    
    // More robust checking for domain verification
    const domainVerifiedValue = (rawDomainVerifiedValue || "").trim().toLowerCase();
    const domainVerified = ["true", "1", "yes", "y"].includes(domainVerifiedValue);
    
    console.log(`Domain verified status: ${domainVerified}`);
    
    // For testing, use Resend's default domain if our domain isn't verified
    const useResendDefault = !domainVerified;
    const fromName = "Leads Marketplace";
    
    const fromAddress = useResendDefault 
      ? "Leads Marketplace <onboarding@resend.dev>"
      : `${fromName} <${fromEmail}>`;
    
    console.log(`Using from email: ${fromAddress}`);
    
    // Check if we need to redirect to the verified email
    const needsRedirect = !domainVerified && email !== verifiedEmail;
    const effectiveRecipient = needsRedirect ? verifiedEmail : email;
    
    if (needsRedirect) {
      console.warn(`Redirecting test email from ${email} to ${verifiedEmail} (domain not verified)`);
    }
    
    if (useResendDefault) {
      console.log(`Using Resend default domain due to domain verification status`);
    }
    
    const emailPayload = {
      from: fromAddress,
      to: effectiveRecipient,
      subject: needsRedirect ? `[TEST MODE] Email Notification Test (intended for: ${email})` : "Email Notification Test",
      html: `
        <html>
          <body>
            <h1>Email Test Successful ✅</h1>
            <p>This is a test email to verify that the email sending functionality is working properly.</p>
            <p>If you're receiving this, it means the configuration is working!</p>
            <p>Date and time of test: ${new Date().toLocaleString()}</p>
            <p><strong>Debug Information:</strong></p>
            <ul>
              <li>DOMAIN_VERIFIED raw value: "${rawDomainVerifiedValue}"</li>
              <li>Domain verified (processed): ${domainVerified}</li>
              <li>FROM_EMAIL value: "${fromEmail}"</li>
              <li>From address used: "${fromAddress}"</li>
              <li>Using Resend default domain: ${useResendDefault}</li>
              <li>Email redirected: ${needsRedirect ? "Yes" : "No"}</li>
            </ul>
            ${needsRedirect ? `
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 15px 0; border-radius: 5px;">
              <p><strong>NOTE:</strong> This email was sent to ${verifiedEmail} instead of ${email} because your domain has not been verified yet.</p>
              <p>To send emails to any recipient, please verify your domain at <a href="https://resend.com/domains">Resend's Domain Settings</a> and set DOMAIN_VERIFIED=true</p>
            </div>
            ` : ''}
          </body>
        </html>
      `,
    };
    
    console.log('Email payload:', JSON.stringify(emailPayload, null, 2));
    
    // Send a test email 
    const emailResult = await resend.emails.send(emailPayload);
    
    console.log("Resend API response:", JSON.stringify(emailResult, null, 2));
    
    // Handle the case where Resend returns an error object
    if ('error' in emailResult && emailResult.error) {
      console.error("Resend API Error:", JSON.stringify(emailResult.error));
      
      // Check if this is a domain verification error
      if (emailResult.error.message && emailResult.error.message.includes("verify a domain")) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Domain verification required. Please verify a domain at https://resend.com/domains",
            domainVerificationRequired: true,
            debugInfo: {
              domainVerifiedRaw: rawDomainVerifiedValue,
              domainVerifiedProcessed: domainVerified,
              fromEmail,
              fromAddress,
              useResendDefault
            }
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
          error: emailResult.error.message || "Unknown error from Resend API",
          debugInfo: {
            domainVerifiedRaw: rawDomainVerifiedValue,
            domainVerifiedProcessed: domainVerified,
            fromEmail,
            fromAddress,
            useResendDefault
          }
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
    
    console.log("Email sent successfully!");
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: needsRedirect ? `Test email sent to ${verifiedEmail} (redirected from ${email})` : "Test email sent successfully",
        id: emailResult.id,
        redirected: needsRedirect,
        debugInfo: {
          domainVerifiedRaw: rawDomainVerifiedValue,
          domainVerifiedProcessed: domainVerified,
          fromEmail,
          fromAddress,
          useResendDefault
        }
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
    console.error("=== TEST EMAIL FUNCTION ERROR ===");
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
