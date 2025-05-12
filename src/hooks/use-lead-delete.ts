
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useLeadDelete = () => {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteLead = async (leadId: string): Promise<boolean> => {
    if (!leadId) {
      toast.error('Lead ID is missing');
      return false;
    }
    
    setIsDeleting(true);
    
    try {
      console.log('Marking lead as erased in Supabase:', leadId);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to delete a lead');
      }
      
      // Update the lead status to 'erased' rather than deleting it
      const { data, error } = await supabase
        .from('leads')
        .update({ status: 'erased' })
        .eq('id', leadId)
        .eq('seller_id', user.id) // Security: ensure user can only delete their own leads
        .select()
        .single();
        
      if (error) {
        console.error('Supabase error when deleting lead:', error);
        throw error;
      }
      
      console.log('Lead marked as erased successfully:', data);
      toast.success('Lead deleted successfully!');
      return true;
      
    } catch (error) {
      console.error('Error deleting lead:', error);
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
