
import { supabase } from '@/integrations/supabase/client';
import { trackNotificationAttempt } from './notification-tracking';

export const sendEmailNotificationAsync = async (leadId: string) => {
  console.log(`=== STARTING ASYNC EMAIL NOTIFICATION ===`);
  console.log(`Lead ID: ${leadId}`);

  try {
    // Track the attempt as pending
    await trackNotificationAttempt(leadId, 'email', 'pending');

    console.log(`Invoking send-lead-email-notification at ${new Date().toISOString()}`);
    console.log(`Sending leadId in body:`, { leadId });

    // Call the edge function - use the exact same pattern as working functions
    const result = await supabase.functions.invoke('send-lead-email-notification', {
      body: { leadId }
    });

    console.log('Email notification function result:', result);

    if (result.error) {
      console.error(`Email notification failed:`, result.error);
      await trackNotificationAttempt(
        leadId, 
        'email', 
        'failed',
        result.error.message || JSON.stringify(result.error),
        result
      );
    } else {
      console.log(`Email notification succeeded:`, result.data);
      await trackNotificationAttempt(leadId, 'email', 'success', null, result.data);
    }
  } catch (error: any) {
    console.error(`Exception in email notification:`, error);
    await trackNotificationAttempt(
      leadId, 
      'email', 
      'failed',
      error.message || 'Unknown error',
      { error: error.message, stack: error.stack }
    );
  }
};
