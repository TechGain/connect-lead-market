
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAdminLeadRefund = () => {
  const [isRefunding, setIsRefunding] = useState(false);

  const refundLead = async (leadId: string): Promise<boolean> => {
    try {
      setIsRefunding(true);
      
      // Update the lead status to 'refunded'
      const { error } = await supabase
        .from('leads')
        .update({ status: 'refunded' })
        .eq('id', leadId);

      if (error) {
        console.error('Error refunding lead:', error);
        toast.error('Failed to mark lead as refunded');
        return false;
      }

      toast.success('Lead has been marked as refunded');
      return true;
    } catch (err: any) {
      console.error('Exception when refunding lead:', err);
      toast.error('An unexpected error occurred');
      return false;
    } finally {
      setIsRefunding(false);
    }
  };

  return {
    refundLead,
    isRefunding
  };
};
