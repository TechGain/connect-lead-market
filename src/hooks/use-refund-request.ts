
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useRefundRequest = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitRefundRequest = async (leadId: string, reason: string) => {
    try {
      setIsSubmitting(true);
      console.log('Submitting refund request for lead:', leadId, 'with reason:', reason);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Submit refund request
      const { data, error } = await supabase
        .from('refund_requests')
        .insert({
          lead_id: leadId,
          buyer_id: user.id,
          reason: reason.trim()
        })
        .select()
        .single();

      if (error) {
        console.error('Error submitting refund request:', error);
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('You have already submitted a refund request for this lead');
        }
        throw new Error(error.message);
      }

      console.log('Refund request submitted successfully:', data);

      // Trigger admin notification
      try {
        console.log('Sending admin notification for refund request:', data.id);
        const { error: notificationError } = await supabase.functions.invoke('send-refund-request-notification', {
          body: { refundRequestId: data.id }
        });

        if (notificationError) {
          console.error('Failed to send admin notification:', notificationError);
          // Don't fail the entire request if notification fails
        }
      } catch (notificationError) {
        console.error('Exception sending admin notification:', notificationError);
      }

      toast.success('Refund request submitted successfully. An admin will review your request.');
      return true;
    } catch (error: any) {
      console.error('Exception submitting refund request:', error);
      toast.error(error.message || 'Failed to submit refund request');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkExistingRequest = async (leadId: string) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return null;

      const { data, error } = await supabase
        .from('refund_requests')
        .select('*')
        .eq('lead_id', leadId)
        .eq('buyer_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking existing refund request:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Exception checking existing refund request:', error);
      return null;
    }
  };

  return {
    submitRefundRequest,
    checkExistingRequest,
    isSubmitting
  };
};
