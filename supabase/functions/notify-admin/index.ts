
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// Initialize Resend with API key from environment variables
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Configure CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Function to format date in a more readable format
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const payload = await req.json();
    console.log("Received notification payload:", payload);

    // Extract user information
    const userId = payload.user_id;
    const email = payload.email;
    const createdAt = payload.created_at;
    const metadata = payload.user_metadata || {};
    
    // Admin email to receive notifications (can be configured later in environment variables)
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "admin@yourdomain.com";
    
    // Create email content
    const emailResponse = await resend.emails.send({
      from: "Notifications <onboarding@resend.dev>",
      to: adminEmail,
      subject: "New User Signup Notification",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h1 style="color: #333;">New User Registration</h1>
          <p>A new user has registered on your platform.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #444;">User Details</h2>
            <p><strong>User ID:</strong> ${userId}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Registered At:</strong> ${formatDate(createdAt)}</p>
            ${metadata.full_name ? `<p><strong>Full Name:</strong> ${metadata.full_name}</p>` : ''}
            ${metadata.role ? `<p><strong>Role:</strong> ${metadata.role}</p>` : ''}
            ${metadata.company ? `<p><strong>Company:</strong> ${metadata.company}</p>` : ''}
          </div>
          
          <p>You can view this user in your <a href="https://supabase.com/dashboard/project/bfmxxuarnqmxqqnpxqjf/auth/users" style="color: #0066cc;">Supabase Dashboard</a>.</p>
          
          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #777;">
            <p>This is an automated notification. Please do not reply to this email.</p>
          </div>
        </div>
      `,
    });

    console.log("Email notification sent:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Admin notification sent successfully" 
    }), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders 
      },
    });

  } catch (error) {
    console.error("Error sending admin notification:", error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || "Failed to send notification" 
    }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders 
      },
    });
  }
});
