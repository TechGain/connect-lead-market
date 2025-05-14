
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAdminLeadDelete = () => {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteLead = async (leadId: string): Promise<boolean> => {
    if (!leadId) {
      toast.error('Lead ID is missing');
      return false;
    }
    
    setIsDeleting(true);
    
    try {
      console.log('Admin marking lead as erased:', leadId);
      
      // Update the lead status to 'erased' rather than actually deleting it
      const { data, error } = await supabase
        .from('leads')
        .update({ status: 'erased' })
        .eq('id', leadId)
        .select()
        .single();
        
      if (error) {
        console.error('Supabase error when admin deleting lead:', error);
        throw error;
      }
      
      console.log('Lead marked as erased successfully by admin:', data);
      toast.success('Lead deleted successfully!');
      return true;
      
    } catch (error) {
      console.error('Error in admin lead deletion:', error);
      toast.error('Failed to delete lead. Please try again.');
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteLead,
    isDeleting
  };
};
