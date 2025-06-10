
import { supabase } from '@/integrations/supabase/client';

export const trackNotificationAttempt = async (
  leadId: string, 
  type: 'email', 
  status: 'pending' | 'success' | 'failed' | 'retrying',
  errorDetails?: string,
  functionResponse?: any
) => {
  try {
    console.log(`=== TRACKING NOTIFICATION ATTEMPT ===`);
    console.log(`Lead ID: ${leadId}, Type: ${type}, Status: ${status}`);
    
    const { error } = await supabase
      .from('notification_attempts')
      .insert({
        lead_id: leadId,
        notification_type: type,
        status,
        error_details: errorDetails,
        function_response: functionResponse,
        completed_at: status !== 'pending' ? new Date().toISOString() : null
      });

    if (error) {
      console.error('Failed to track notification attempt:', error);
    } else {
      console.log('Notification attempt tracked successfully');
    }
  } catch (err) {
    console.error('Exception tracking notification attempt:', err);
  }
};
