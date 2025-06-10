
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Lead, mapAppLeadToDbLead } from '@/types/lead';

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

  const sendEmailNotificationAsync = async (leadId: string) => {
    console.log(`=== STARTING ASYNC EMAIL NOTIFICATION ===`);
    console.log(`Lead ID: ${leadId}`);

    try {
      // Track the attempt as pending
      await trackNotificationAttempt(leadId, 'email', 'pending');

      console.log(`Invoking send-lead-email-notification at ${new Date().toISOString()}`);

      // Use URL parameter approach as primary method to avoid CORS issues
      const result = await supabase.functions.invoke('send-lead-email-notification', {
        body: { leadId },
        headers: {
          'Content-Type': 'application/json',
        }
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

  const uploadLead = async (lead: Omit<Lead, 'id'>) => {
    console.log('=== LEAD UPLOAD STARTED ===');
    console.log('Upload timestamp:', new Date().toISOString());
    
    // Ensure we always reset loading state
    setIsUploading(true);
    
    try {
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
      
      // Show immediate success - lead is uploaded!
      toast.success('Lead uploaded successfully! Email notifications are being sent to buyers.');
      
      // Reset loading state immediately after successful upload
      setIsUploading(false);
      
      // Fire email notifications asynchronously (don't await)
      console.log('Starting async email notifications...');
      sendEmailNotificationAsync(insertedLead.id).catch(error => {
        console.error('Async email notification failed:', error);
        // Don't show error toast here as the lead was successfully uploaded
      });
      
      console.log('=== LEAD UPLOAD COMPLETED ===');
      return true;
      
    } catch (error) {
      console.error('=== LEAD UPLOAD FAILED ===');
      console.error('Error uploading lead:', error);
      toast.error('Failed to upload lead. Please try again.');
      return false;
    } finally {
      // Ensure loading state is always reset
      setIsUploading(false);
    }
  };

  return {
    uploadLead,
    isUploading
  };
};
