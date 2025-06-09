
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client with admin privileges
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function processPendingNotifications() {
  console.log("=== PROCESSING PENDING NOTIFICATIONS ===");
  console.log("Timestamp:", new Date().toISOString());

  try {
    // Get all pending notification attempts older than 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const { data: pendingAttempts, error: fetchError } = await supabase
      .from('notification_attempts')
      .select('*')
      .eq('status', 'pending')
      .lt('attempted_at', fiveMinutesAgo)
      .order('attempted_at', { ascending: true })
      .limit(10); // Process 10 at a time to avoid overwhelming the system

    if (fetchError) {
      console.error('Error fetching pending notifications:', fetchError);
      return { error: fetchError.message };
    }

    if (!pendingAttempts || pendingAttempts.length === 0) {
      console.log('No pending notifications to process');
      return { message: 'No pending notifications found', processed: 0 };
    }

    console.log(`Found ${pendingAttempts.length} pending notifications to process`);

    let processedCount = 0;
    const results = [];

    for (const attempt of pendingAttempts) {
      console.log(`Processing notification: ${attempt.id} for lead: ${attempt.lead_id}`);
      
      try {
        let functionName = '';
        if (attempt.notification_type === 'email') {
          functionName = 'send-lead-email-notification';
        } else if (attempt.notification_type === 'sms') {
          functionName = 'send-lead-notification';
        } else {
          console.error(`Unknown notification type: ${attempt.notification_type}`);
          continue;
        }

        // Mark as processing
        await supabase
          .from('notification_attempts')
          .update({ 
            status: 'retrying',
            attempt_count: (attempt.attempt_count || 0) + 1
          })
          .eq('id', attempt.id);

        // Invoke the notification function
        const result = await supabase.functions.invoke(functionName, {
          body: { leadId: attempt.lead_id }
        });

        if (result.error) {
          // Mark as failed
          await supabase
            .from('notification_attempts')
            .update({
              status: 'failed',
              error_details: result.error.message || JSON.stringify(result.error),
              completed_at: new Date().toISOString(),
              function_response: result
            })
            .eq('id', attempt.id);

          console.error(`Failed to process notification ${attempt.id}:`, result.error);
          results.push({ id: attempt.id, status: 'failed', error: result.error });
        } else {
          // Mark as success
          await supabase
            .from('notification_attempts')
            .update({
              status: 'success',
              completed_at: new Date().toISOString(),
              function_response: result.data
            })
            .eq('id', attempt.id);

          console.log(`Successfully processed notification ${attempt.id}`);
          results.push({ id: attempt.id, status: 'success' });
          processedCount++;
        }
      } catch (error) {
        console.error(`Exception processing notification ${attempt.id}:`, error);
        
        // Mark as failed
        await supabase
          .from('notification_attempts')
          .update({
            status: 'failed',
            error_details: error.message || 'Unknown error',
            completed_at: new Date().toISOString()
          })
          .eq('id', attempt.id);

        results.push({ id: attempt.id, status: 'failed', error: error.message });
      }
    }

    console.log(`Processed ${processedCount} notifications successfully`);
    return {
      message: `Processed ${processedCount} out of ${pendingAttempts.length} notifications`,
      processed: processedCount,
      total: pendingAttempts.length,
      results
    };

  } catch (error) {
    console.error('Error in processPendingNotifications:', error);
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
    console.log("Received request to process-pending-notifications");
    
    const result = await processPendingNotifications();
    console.log("Processing completed:", result);
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error("Error in process-pending-notifications function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});
