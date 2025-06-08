
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize Supabase client with admin privileges
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function processPendingNotifications() {
  console.log("=== PROCESSING PENDING NOTIFICATIONS ===");
  console.log("Timestamp:", new Date().toISOString());

  try {
    // Find pending notifications older than 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const { data: pendingNotifications, error } = await supabase
      .from('notification_attempts')
      .select('*')
      .eq('status', 'pending')
      .lt('attempted_at', fiveMinutesAgo)
      .limit(10); // Process up to 10 at a time

    if (error) {
      console.error("Error fetching pending notifications:", error);
      return { error: error.message };
    }

    console.log(`Found ${pendingNotifications?.length || 0} pending notifications to process`);

    if (!pendingNotifications || pendingNotifications.length === 0) {
      return { 
        message: "No pending notifications to process",
        processed: 0 
      };
    }

    const results = [];

    for (const notification of pendingNotifications) {
      console.log(`Processing notification: ${notification.id} (${notification.notification_type})`);

      try {
        let functionName = '';
        if (notification.notification_type === 'email') {
          functionName = 'send-lead-email-notification';
        } else if (notification.notification_type === 'sms') {
          functionName = 'send-lead-notification';
        } else {
          console.error(`Unknown notification type: ${notification.notification_type}`);
          continue;
        }

        // Update status to retrying
        await supabase
          .from('notification_attempts')
          .update({ 
            status: 'retrying',
            attempt_count: notification.attempt_count + 1
          })
          .eq('id', notification.id);

        // Invoke the appropriate notification function
        const result = await supabase.functions.invoke(functionName, {
          body: { leadId: notification.lead_id }
        });

        console.log(`Notification ${notification.id} result:`, result);

        results.push({
          id: notification.id,
          type: notification.notification_type,
          leadId: notification.lead_id,
          success: !result.error,
          result: result.error || result.data
        });

      } catch (error) {
        console.error(`Error processing notification ${notification.id}:`, error);
        
        // Mark as failed
        await supabase
          .from('notification_attempts')
          .update({ 
            status: 'failed',
            error_details: error.message,
            completed_at: new Date().toISOString()
          })
          .eq('id', notification.id);

        results.push({
          id: notification.id,
          type: notification.notification_type,
          leadId: notification.lead_id,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    
    console.log(`Processed ${results.length} notifications, ${successCount} successful`);

    return {
      message: `Processed ${results.length} pending notifications`,
      processed: results.length,
      successful: successCount,
      results
    };

  } catch (error) {
    console.error("Error in process-pending-notifications:", error);
    return { error: error.message };
  }
}

// Main request handler
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const result = await processPendingNotifications();
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error("Error in process-pending-notifications function:", error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  }
});
