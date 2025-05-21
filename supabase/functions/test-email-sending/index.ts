
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
    
    // Send a test email using Resend's default domain
    const emailResult = await resend.emails.send({
      from: "Leads Marketplace <onboarding@resend.dev>",
      to: email,
      subject: "Email Notification Test",
      html: `
        <html>
          <body>
            <h1>Email Test Successful</h1>
            <p>This is a test email to verify that the email sending functionality is working properly.</p>
            <p>If you're receiving this, it means the configuration is correct!</p>
            <p>Date and time of test: ${new Date().toLocaleString()}</p>
            <p><em>Note: This email is sent from Resend's default domain (onboarding@resend.dev) while your custom domain is being verified.</em></p>
          </body>
        </html>
      `,
    });
    
    // Handle the case where Resend returns an error object
    if ('error' in emailResult && emailResult.error) {
      console.error("Resend API Error:", JSON.stringify(emailResult.error));
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
        message: "Test email sent successfully",
        id: emailResult.id
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
