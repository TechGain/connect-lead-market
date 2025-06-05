
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Lead, mapAppLeadToDbLead } from '@/types/lead';

export const useLeadUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadLead = async (lead: Omit<Lead, 'id'>) => {
    setIsUploading(true);
    
    try {
      console.log('=== LEAD UPLOAD STARTED ===');
      console.log('Uploading lead to Supabase:', lead);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to upload a lead');
      }
      
      console.log('User authenticated:', user.id);
      
      // Prepare the lead data for Supabase (using our helper function)
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
      toast.success('Lead uploaded successfully!');

      // Trigger notifications after successful lead upload
      console.log('=== STARTING NOTIFICATIONS ===');
      console.log('Triggering notifications for new lead:', data.id);
      
      let smsError = null;
      let emailError = null;
      let smsResponse = null;
      let emailResponse = null;
      
      // Trigger SMS notifications
      try {
        console.log('Invoking SMS notification function...');
        const smsResult = await supabase.functions.invoke('send-lead-notification', {
          body: { leadId: data.id }
        });
        
        console.log('SMS notification function response:', smsResult);
        
        if (smsResult.error) {
          console.error('SMS notification function error:', smsResult.error);
          smsError = smsResult.error;
        } else {
          console.log('SMS notification function success:', smsResult.data);
          smsResponse = smsResult.data;
        }
      } catch (smsException) {
        console.error('SMS notification exception:', smsException);
        smsError = smsException;
      }
      
      // Trigger email notifications
      try {
        console.log('Invoking email notification function...');
        const emailResult = await supabase.functions.invoke('send-lead-email-notification', {
          body: { leadId: data.id }
        });
        
        console.log('Email notification function response:', emailResult);
        
        if (emailResult.error) {
          console.error('Email notification function error:', emailResult.error);
          emailError = emailResult.error;
        } else {
          console.log('Email notification function success:', emailResult.data);
          emailResponse = emailResult.data;
        }
      } catch (emailException) {
        console.error('Email notification exception:', emailException);
        emailError = emailException;
      }
      
      // Report notification results
      console.log('=== NOTIFICATION RESULTS ===');
      console.log('SMS Error:', smsError);
      console.log('SMS Response:', smsResponse);
      console.log('Email Error:', emailError);
      console.log('Email Response:', emailResponse);
      
      if (smsError && emailError) {
        console.error('Both SMS and email notifications failed');
        toast.error('Lead uploaded but all notifications failed. Check console for details.');
      } else if (smsError || emailError) {
        console.warn('Some notifications failed');
        toast.warning('Lead uploaded but some notifications may be delayed. Check console for details.');
      } else {
        console.log('All notifications triggered successfully');
        toast.success('Lead uploaded and notifications sent!');
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
