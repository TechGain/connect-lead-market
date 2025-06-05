
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAdminLeadMarkPaid = () => {
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);

  const markLeadAsPaid = async (leadId: string): Promise<boolean> => {
    try {
      setIsMarkingPaid(true);
      
      // Update the lead status to 'paid'
      const { error } = await supabase
        .from('leads')
        .update({ status: 'paid' })
        .eq('id', leadId);

      if (error) {
        console.error('Error marking lead as paid:', error);
        toast.error('Failed to mark lead as paid');
        return false;
      }

      toast.success('Lead has been marked as paid');
      return true;
    } catch (err: any) {
      console.error('Exception when marking lead as paid:', err);
      toast.error('An unexpected error occurred');
      return false;
    } finally {
      setIsMarkingPaid(false);
    }
  };

  return {
    markLeadAsPaid,
    isMarkingPaid
  };
};
