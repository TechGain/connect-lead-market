
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: PasswordResetRequest = await req.json();

    if (!email) {
      console.error("No email provided in request");
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Processing password reset request for email:", email);

    // Validate environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("FROM_EMAIL");
    const websiteUrl = Deno.env.get("WEBSITE_URL");

    console.log("Environment variables check:");
    console.log("- SUPABASE_URL:", !!supabaseUrl);
    console.log("- SUPABASE_SERVICE_ROLE_KEY:", !!supabaseServiceKey);
    console.log("- RESEND_API_KEY:", !!resendApiKey);
    console.log("- FROM_EMAIL:", fromEmail || "NOT SET");
    console.log("- WEBSITE_URL:", websiteUrl || "NOT SET");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      throw new Error("Missing Supabase configuration");
    }

    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      throw new Error("RESEND_API_KEY not configured");
    }

    if (!fromEmail) {
      console.error("FROM_EMAIL not configured");
      throw new Error("FROM_EMAIL not configured - this is required for sending emails");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user exists
    console.log("Checking if user exists...");
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error("Error fetching users:", userError);
      throw new Error("Failed to verify user");
    }

    const user = userData.users.find(u => u.email === email);
    
    if (!user) {
      console.log("User not found, but returning success for security");
      // Don't reveal if user exists or not for security
      return new Response(
        JSON.stringify({ message: "If an account with that email exists, a reset link has been sent." }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("User found, generating reset token...");

    // Generate secure reset token
    const resetToken = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, '');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now

    // Store the reset token in database
    console.log("Storing reset token in database...");
    const { error: tokenError } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: user.id,
        token: resetToken,
        expires_at: expiresAt.toISOString()
      });

    if (tokenError) {
      console.error("Error storing reset token:", tokenError);
      throw new Error("Failed to generate reset token");
    }

    console.log("Reset token stored successfully");

    // Initialize Resend
    console.log("Initializing Resend with API key...");
    const resend = new Resend(resendApiKey);
    const finalWebsiteUrl = websiteUrl || "http://localhost:8080";
    
    // Create reset URL
    const resetUrl = `${finalWebsiteUrl}/reset-password?token=${resetToken}`;
    console.log("Reset URL generated:", resetUrl);

    // Prepare email data
    const emailData = {
      from: fromEmail,
      to: [email],
      subject: "Reset Your Password",
      html: generatePasswordResetEmailHtml(resetUrl, user.email || email)
    };

    console.log("Sending email with data:", {
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject,
      html_length: emailData.html.length
    });

    // Send email using Resend
    try {
      const emailResponse = await resend.emails.send(emailData);
      
      console.log("Resend API response:", JSON.stringify(emailResponse, null, 2));

      if (emailResponse.error) {
        console.error("Resend API returned error:", emailResponse.error);
        throw new Error(`Resend API error: ${JSON.stringify(emailResponse.error)}`);
      }

      if (!emailResponse.data || !emailResponse.data.id) {
        console.error("Resend API response missing expected data:", emailResponse);
        throw new Error("Invalid response from email service");
      }

      console.log("Email sent successfully with ID:", emailResponse.data.id);

      return new Response(
        JSON.stringify({ 
          message: "If an account with that email exists, a reset link has been sent.",
          success: true,
          emailId: emailResponse.data.id // Include for debugging
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );

    } catch (resendError: any) {
      console.error("Resend email sending failed:", resendError);
      console.error("Resend error details:", {
        name: resendError.name,
        message: resendError.message,
        stack: resendError.stack
      });
      
      // Return a more specific error for debugging
      throw new Error(`Email sending failed: ${resendError.message}`);
    }

  } catch (error: any) {
    console.error("Error in send-password-reset-email function:", error);
    console.error("Error stack:", error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        details: error.message // Include error details for debugging
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

function generatePasswordResetEmailHtml(resetUrl: string, email: string): string {
  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4338ca; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .reset-button { 
            display: inline-block; 
            background-color: #4338ca; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
            font-weight: bold;
          }
          .footer { margin-top: 20px; font-size: 0.8em; color: #6b7280; text-align: center; }
          .warning { background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>We received a request to reset the password for your account (${email}).</p>
            
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" class="reset-button">Reset Password</a>
            
            <div class="warning">
              <strong>Important:</strong> This link will expire in 30 minutes for security reasons.
            </div>
            
            <p>If you didn't request this password reset, you can safely ignore this email. Your password will not be changed.</p>
            
            <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #4338ca;">${resetUrl}</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

serve(handler);
