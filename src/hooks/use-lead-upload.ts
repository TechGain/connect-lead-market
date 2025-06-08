
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Lead, mapAppLeadToDbLead } from '@/types/lead';

interface NotificationAttempt {
  id: string;
  leadId: string;
  notificationType: 'email' | 'sms';
  status: 'pending' | 'success' | 'failed' | 'retrying';
  attemptCount: number;
  errorDetails?: string;
  functionResponse?: any;
}

export const useLeadUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const trackNotificationAttempt = async (
    leadId: string, 
    type: 'email' | 'sms', 
    status: 'pending' | 'success' | 'failed',
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

  const invokeNotificationFunction = async (
    leadId: string, 
    functionName: string, 
    type: 'email' | 'sms',
    maxRetries = 3
  ) => {
    let attempt = 0;
    let lastError = null;

    while (attempt < maxRetries) {
      attempt++;
      console.log(`=== NOTIFICATION ATTEMPT ${attempt}/${maxRetries} ===`);
      console.log(`Function: ${functionName}, Type: ${type}, Lead: ${leadId}`);

      try {
        // Track the attempt as pending
        await trackNotificationAttempt(leadId, type, 'pending');

        const startTime = Date.now();
        console.log(`Invoking ${functionName} at ${new Date().toISOString()}`);

        const result = await supabase.functions.invoke(functionName, {
          body: { leadId }
        });

        const duration = Date.now() - startTime;
        console.log(`${functionName} completed in ${duration}ms`);
        console.log('Function result:', result);

        if (result.error) {
          lastError = result.error;
          console.error(`${functionName} returned error:`, result.error);
          
          // Track failed attempt
          await trackNotificationAttempt(
            leadId, 
            type, 
            attempt === maxRetries ? 'failed' : 'retrying',
            result.error.message || JSON.stringify(result.error),
            result
          );

          if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
            console.log(`Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        } else {
          console.log(`${functionName} succeeded:`, result.data);
          
          // Track successful attempt
          await trackNotificationAttempt(leadId, type, 'success', null, result.data);
          return { success: true, data: result.data };
        }
      } catch (error: any) {
        lastError = error;
        console.error(`Exception in ${functionName} attempt ${attempt}:`, error);
        
        // Track failed attempt
        await trackNotificationAttempt(
          leadId, 
          type, 
          attempt === maxRetries ? 'failed' : 'retrying',
          error.message || 'Unknown error',
          { error: error.message, stack: error.stack }
        );

        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`Retrying after exception in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    console.error(`All ${maxRetries} attempts failed for ${functionName}`);
    return { success: false, error: lastError };
  };

  const uploadLead = async (lead: Omit<Lead, 'id'>) => {
    setIsUploading(true);
    
    try {
      console.log('=== LEAD UPLOAD STARTED ===');
      console.log('Upload timestamp:', new Date().toISOString());
      console.log('Uploading lead to Supabase:', lead);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to upload a lead');
      }
      
      console.log('User authenticated:', user.id);
      
      // Prepare the lead data for Supabase
      const leadData = mapAppLeadToDbLead({
        ...lead,
        sellerId: user.id
      });
      
      console.log('Lead data prepared for database:', leadData);
      
      // Insert the lead into the database
      const { data, error } = await supabase
        .from('leads')
        .insert(leadData)
        .select()
        .single();
        
      if (error) {
        console.error('Database insertion error:', error);
        throw error;
      }
      
      console.log('Lead uploaded successfully to database:', data);
      console.log('Database trigger should have created notification attempt records');

      // Store notification results
      const notificationResults = {
        email: { success: false, error: null, data: null },
        sms: { success: false, error: null, data: null }
      };

      // Try to invoke email notifications
      console.log('=== STARTING EMAIL NOTIFICATIONS ===');
      const emailResult = await invokeNotificationFunction(
        data.id, 
        'send-lead-email-notification', 
        'email'
      );
      notificationResults.email = emailResult;

      // Try to invoke SMS notifications
      console.log('=== STARTING SMS NOTIFICATIONS ===');
      const smsResult = await invokeNotificationFunction(
        data.id, 
        'send-lead-notification', 
        'sms'
      );
      notificationResults.sms = smsResult;

      // Analyze results and show appropriate messages
      console.log('=== NOTIFICATION RESULTS SUMMARY ===');
      console.log('Email result:', notificationResults.email);
      console.log('SMS result:', notificationResults.sms);

      const emailSuccess = notificationResults.email.success;
      const smsSuccess = notificationResults.sms.success;

      if (emailSuccess && smsSuccess) {
        toast.success('Lead uploaded and all notifications sent successfully!');
      } else if (emailSuccess || smsSuccess) {
        const successType = emailSuccess ? 'email' : 'SMS';
        const failType = emailSuccess ? 'SMS' : 'email';
        toast.warning(`Lead uploaded and ${successType} notifications sent. ${failType} notifications may be delayed.`);
      } else {
        toast.warning('Lead uploaded successfully, but notifications may be delayed. Our backup system will ensure buyers are notified.');
      }
      
      console.log('=== LEAD UPLOAD COMPLETED ===');
      return true;
      
    } catch (error) {
      console.error('=== LEAD UPLOAD FAILED ===');
      console.error('Error uploading lead:', error);
      toast.error('Failed to upload lead. Please try again.');
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadLead,
    isUploading
  };
};
