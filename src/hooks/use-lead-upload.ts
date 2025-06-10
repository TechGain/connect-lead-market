
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Lead, mapAppLeadToDbLead } from '@/types/lead';
import { sendEmailNotificationAsync } from '@/services/email-notification';

export const useLeadUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadLead = async (lead: Omit<Lead, 'id'>) => {
    console.log('=== LEAD UPLOAD STARTED ===');
    console.log('Upload timestamp:', new Date().toISOString());
    
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
