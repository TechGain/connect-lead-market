
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { chatId, userName, userEmail, message } = await req.json();
    
    // Validate required fields
    if (!chatId || !message) {
      throw new Error('Missing required fields: chatId and message are required');
    }

    // Use Resend API to send notification email
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }

    // Prepare email content with sender name
    const senderName = userName || 'Anonymous';
    const subject = `New chat message from ${senderName}`;
    const emailContent = `
      <h2>New Chat Message</h2>
      <p><strong>From:</strong> ${senderName} ${userEmail ? `(${userEmail})` : ''}</p>
      <p><strong>Message:</strong> ${message}</p>
      <p><strong>Chat ID:</strong> ${chatId}</p>
      <p>
        <a href="${Deno.env.get('APP_URL') || 'https://stayconnect.app'}/admin/chats/${chatId}" style="padding:10px 15px; background-color:#01cdff; color:white; text-decoration:none; border-radius:4px;">
          Reply to Chat
        </a>
      </p>
    `;

    // Send email using Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'StayConnect <noreply@stayconnect.app>',
        to: Deno.env.get('NOTIFICATION_EMAIL') || 'support@stayconnect.app',
        subject: subject,
        html: emailContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error sending email:', errorData);
      throw new Error(`Failed to send email: ${errorData.message || 'Unknown error'}`);
    }

    // Return success response
    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent successfully' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in send-chat-notification function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send notification'
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
