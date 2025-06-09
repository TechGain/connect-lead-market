import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Lead, mapAppLeadToDbLead } from '@/types/lead';

interface NotificationAttempt {
  id: string;
  leadId: string;
  notificationType: 'email';
  status: 'pending' | 'success' | 'failed' | 'retrying';
  attemptCount: number;
  errorDetails?: string;
  functionResponse?: any;
}

export const useLeadUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const trackNotificationAttempt = async (
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

  const invokeEmailNotificationFunction = async (
    leadId: string,
    maxRetries = 3
  ): Promise<{ success: boolean; error: any; data: any }> => {
    let attempt = 0;
    let lastError = null;

    while (attempt < maxRetries) {
      attempt++;
      console.log(`=== EMAIL NOTIFICATION ATTEMPT ${attempt}/${maxRetries} ===`);
      console.log(`Lead ID: ${leadId}`);

      try {
        // Track the attempt as pending
        await trackNotificationAttempt(leadId, 'email', 'pending');

        const startTime = Date.now();
        console.log(`Invoking send-lead-email-notification at ${new Date().toISOString()}`);
        console.log(`Sending leadId: ${leadId}`);

        // Fixed invocation with proper body and headers
        const requestBody = { leadId };
        console.log('Request body being sent:', JSON.stringify(requestBody));

        const result = await supabase.functions.invoke('send-lead-email-notification', {
          body: requestBody,
          headers: {
            'Content-Type': 'application/json',
          }
        });

        const duration = Date.now() - startTime;
        console.log(`Email notification function completed in ${duration}ms`);
        console.log('Function result:', result);

        if (result.error) {
          lastError = result.error;
          console.error(`Email notification function returned error:`, result.error);
          
          // Track failed attempt
          await trackNotificationAttempt(
            leadId, 
            'email', 
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
          console.log(`Email notification function succeeded:`, result.data);
          
          // Track successful attempt
          await trackNotificationAttempt(leadId, 'email', 'success', null, result.data);
          return { success: true, data: result.data, error: null };
        }
      } catch (error: any) {
        lastError = error;
        console.error(`Exception in email notification attempt ${attempt}:`, error);
        
        // Track failed attempt
        await trackNotificationAttempt(
          leadId, 
          'email', 
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

    console.error(`All ${maxRetries} attempts failed for email notification`);
    return { success: false, error: lastError, data: null };
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
      const { data: insertedLead, error } = await supabase
        .from('leads')
        .insert(leadData)
        .select()
        .single();
        
      if (error) {
        console.error('Database insertion error:', error);
        throw error;
      }
      
      console.log('Lead uploaded successfully to database:', insertedLead);
      console.log('Database trigger should have created notification attempt records');

      // Wait a moment for the database trigger to create notification attempts
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if notification attempts were created by the trigger
      const { data: notificationAttempts, error: notificationError } = await supabase
        .from('notification_attempts')
        .select('*')
        .eq('lead_id', insertedLead.id);

      if (notificationError) {
        console.error('Error checking notification attempts:', notificationError);
      } else {
        console.log('Notification attempts found:', notificationAttempts);
      }

      // If no email notification attempts were created by trigger, create one manually
      const emailAttempts = notificationAttempts?.filter(na => na.notification_type === 'email') || [];
      if (emailAttempts.length === 0) {
        console.log('No email notification attempts found, creating one manually...');
        const { error: manualInsertError } = await supabase
          .from('notification_attempts')
          .insert([
            { lead_id: insertedLead.id, notification_type: 'email', status: 'pending' }
          ]);

        if (manualInsertError) {
          console.error('Error creating manual email notification attempt:', manualInsertError);
        } else {
          console.log('Manual email notification attempt created successfully');
        }
      }

      // Try to invoke email notifications
      console.log('=== STARTING EMAIL NOTIFICATIONS ===');
      const emailResult = await invokeEmailNotificationFunction(insertedLead.id);

      // Analyze results and show appropriate messages
      console.log('=== NOTIFICATION RESULTS SUMMARY ===');
      console.log('Email result:', emailResult);

      if (emailResult.success) {
        toast.success('Lead uploaded and email notifications sent successfully!');
      } else {
        toast.warning('Lead uploaded successfully, but email notifications may be delayed. Our backup system will ensure buyers are notified.');
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
