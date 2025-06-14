
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RefundRequestNotificationRequest {
  refundRequestId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== REFUND REQUEST NOTIFICATION FUNCTION START ===')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'noreply@stayconnect.co'
    
    if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
      throw new Error('Missing required environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { refundRequestId }: RefundRequestNotificationRequest = await req.json()
    console.log('Processing refund request notification for ID:', refundRequestId)

    // Get the refund request details with related data
    const { data: refundRequest, error: refundError } = await supabase
      .from('refund_requests')
      .select(`
        *,
        lead:leads(*),
        buyer:profiles!refund_requests_buyer_id_fkey(*)
      `)
      .eq('id', refundRequestId)
      .single()

    if (refundError || !refundRequest) {
      console.error('Error fetching refund request:', refundError)
      throw new Error('Refund request not found')
    }

    console.log('Refund request data:', {
      id: refundRequest.id,
      buyer: refundRequest.buyer?.full_name,
      lead_type: refundRequest.lead?.type,
      lead_location: refundRequest.lead?.location,
      reason: refundRequest.reason,
      requested_at: refundRequest.requested_at
    })

    // Get admin emails
    const { data: admins, error: adminError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('role', 'admin')
      .not('email', 'is', null)

    if (adminError) {
      console.error('Error fetching admin emails:', adminError)
      throw new Error('Failed to fetch admin emails')
    }

    if (!admins || admins.length === 0) {
      console.log('No admin emails found')
      return new Response(
        JSON.stringify({ success: true, message: 'No admins to notify' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    console.log(`Found ${admins.length} admin(s) to notify`)

    // Format the requested date and time
    const requestedDate = new Date(refundRequest.requested_at)
    const formattedDateTime = requestedDate.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    })

    // Create email content
    const subject = `🔄 New Refund Request - ${refundRequest.lead?.type} in ${refundRequest.lead?.location}`
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🔄 New Refund Request</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f9fafb;">
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h2 style="color: #374151; margin-top: 0;">Refund Request Details</h2>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #6b7280;">Requested on:</strong>
              <span style="color: #f59e0b; font-weight: bold;">${formattedDateTime}</span>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #6b7280;">Buyer:</strong> ${refundRequest.buyer?.full_name || 'Unknown'}
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #6b7280;">Email:</strong> ${refundRequest.buyer?.email || 'Unknown'}
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #6b7280;">Company:</strong> ${refundRequest.buyer?.company || 'Not specified'}
            </div>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h2 style="color: #374151; margin-top: 0;">Lead Information</h2>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #6b7280;">Type:</strong> ${refundRequest.lead?.type || 'Unknown'}
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #6b7280;">Location:</strong> ${refundRequest.lead?.location || 'Unknown'}
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #6b7280;">Price:</strong> $${refundRequest.lead?.price || '0'}
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #6b7280;">Contact:</strong> ${refundRequest.lead?.contact_name || 'Unknown'}
            </div>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
            <h3 style="color: #92400e; margin-top: 0;">Refund Reason</h3>
            <p style="color: #92400e; margin-bottom: 0; font-style: italic;">"${refundRequest.reason}"</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #6b7280; margin-bottom: 20px;">Review this refund request in your admin dashboard</p>
            <a href="https://stayconnect.co/admin-leads" 
               style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Review Refund Request
            </a>
          </div>
        </div>
        
        <div style="background: #374151; color: #d1d5db; padding: 15px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">This is an automated notification from StayConnect</p>
        </div>
      </div>
    `

    const textContent = `
NEW REFUND REQUEST

Requested on: ${formattedDateTime}

BUYER INFORMATION:
- Name: ${refundRequest.buyer?.full_name || 'Unknown'}
- Email: ${refundRequest.buyer?.email || 'Unknown'}  
- Company: ${refundRequest.buyer?.company || 'Not specified'}

LEAD INFORMATION:
- Type: ${refundRequest.lead?.type || 'Unknown'}
- Location: ${refundRequest.lead?.location || 'Unknown'}
- Price: $${refundRequest.lead?.price || '0'}
- Contact: ${refundRequest.lead?.contact_name || 'Unknown'}

REFUND REASON:
"${refundRequest.reason}"

Review this refund request in your admin dashboard: https://stayconnect.co/admin-leads
    `

    // Send emails to all admins
    const emailPromises = admins.map(async (admin) => {
      try {
        console.log(`Sending refund notification to admin: ${admin.email}`)
        
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [admin.email],
            subject: subject,
            html: htmlContent,
            text: textContent,
          }),
        })

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text()
          console.error(`Failed to send email to ${admin.email}:`, errorText)
          throw new Error(`Email send failed: ${errorText}`)
        }

        const emailResult = await emailResponse.json()
        console.log(`Email sent successfully to ${admin.email}:`, emailResult.id)
        
        return { 
          success: true, 
          adminEmail: admin.email, 
          emailId: emailResult.id 
        }
      } catch (error) {
        console.error(`Error sending email to ${admin.email}:`, error)
        return { 
          success: false, 
          adminEmail: admin.email, 
          error: error.message 
        }
      }
    })

    const emailResults = await Promise.all(emailPromises)
    const successCount = emailResults.filter(result => result.success).length
    const failureCount = emailResults.filter(result => !result.success).length

    console.log(`Email notifications sent: ${successCount} successful, ${failureCount} failed`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Refund request notifications sent to ${successCount} admin(s)`,
        results: emailResults,
        refundRequestId: refundRequestId
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in refund request notification function:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
