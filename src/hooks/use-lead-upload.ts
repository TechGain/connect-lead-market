
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Lead, mapAppLeadToDbLead } from '@/types/lead';

export const useLeadUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadLead = async (lead: Omit<Lead, 'id'>) => {
    setIsUploading(true);
    
    try {
      console.log('Uploading lead to Supabase:', lead);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to upload a lead');
      }
      
      // Prepare the lead data for Supabase (using our helper function)
      const leadData = mapAppLeadToDbLead({
        ...lead,
        sellerId: user.id
      });
      
      // Insert the lead into the database
      const { data, error } = await supabase
        .from('leads')
        .insert(leadData)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      console.log('Lead uploaded successfully:', data);
      toast.success('Lead uploaded successfully!');

      // Trigger SMS notifications after successful lead upload
      try {
        console.log('Triggering SMS notifications for new lead:', data.id);
        const { error: notificationError } = await supabase.functions.invoke('send-lead-notification', {
          body: { leadId: data.id }
        });

        if (notificationError) {
          console.error('Error triggering notifications:', notificationError);
          // Don't fail the lead upload if notifications fail
          toast.error('Lead uploaded but notifications may be delayed');
        } else {
          console.log('Notifications triggered successfully');
        }
      } catch (notificationError) {
        console.error('Exception triggering notifications:', notificationError);
        // Still count the upload as successful even if notifications fail
      }
      
      return true;
      
    } catch (error) {
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
