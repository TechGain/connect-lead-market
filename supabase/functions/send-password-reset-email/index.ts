
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
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user exists
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error("Error fetching users:", userError);
      throw new Error("Failed to verify user");
    }

    const user = userData.users.find(u => u.email === email);
    
    if (!user) {
      // Don't reveal if user exists or not for security
      return new Response(
        JSON.stringify({ message: "If an account with that email exists, a reset link has been sent." }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate secure reset token
    const resetToken = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, '');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now

    // Store the reset token in database
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

    // Initialize Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const resend = new Resend(resendApiKey);
    const websiteUrl = Deno.env.get("WEBSITE_URL") || "http://localhost:8080";
    const fromEmail = Deno.env.get("FROM_EMAIL") || "noreply@example.com";
    
    // Create reset URL
    const resetUrl = `${websiteUrl}/reset-password?token=${resetToken}`;

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: "Reset Your Password",
      html: generatePasswordResetEmailHtml(resetUrl, user.email || email)
    });

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        message: "If an account with that email exists, a reset link has been sent.",
        success: true 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-password-reset-email function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
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
