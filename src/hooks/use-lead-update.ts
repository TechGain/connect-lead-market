
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Lead, mapAppLeadToDbLead } from '@/types/lead';

export const useLeadUpdate = () => {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateLead = async (leadId: string, leadData: Partial<Omit<Lead, 'id'>>) => {
    if (!leadId) {
      toast.error('Lead ID is missing');
      return false;
    }
    
    setIsUpdating(true);
    
    try {
      console.log('Updating lead in Supabase:', leadId, leadData);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to update a lead');
      }
      
      // Prepare the lead data for Supabase (convert from camelCase to snake_case)
      const dbLeadData: Record<string, any> = {};
      
      // Manual mapping for each field
      if (leadData.type !== undefined) dbLeadData.type = leadData.type;
      if (leadData.location !== undefined) dbLeadData.location = leadData.location;
      if (leadData.description !== undefined) dbLeadData.description = leadData.description;
      if (leadData.price !== undefined) dbLeadData.price = leadData.price;
      if (leadData.qualityRating !== undefined) dbLeadData.quality_rating = leadData.qualityRating;
      if (leadData.contactName !== undefined) dbLeadData.contact_name = leadData.contactName;
      if (leadData.contactEmail !== undefined) dbLeadData.contact_email = leadData.contactEmail;
      if (leadData.contactPhone !== undefined) dbLeadData.contact_phone = leadData.contactPhone;
      if (leadData.address !== undefined) dbLeadData.address = leadData.address;
      if (leadData.zipCode !== undefined) dbLeadData.zip_code = leadData.zipCode;
      if (leadData.confirmationStatus !== undefined) dbLeadData.confirmation_status = leadData.confirmationStatus;
      if (leadData.appointmentTime !== undefined) dbLeadData.appointment_time = leadData.appointmentTime;
      
      // Update the lead in the database
      const { data, error } = await supabase
        .from('leads')
        .update(dbLeadData)
        .eq('id', leadId)
        .eq('seller_id', user.id) // Security: ensure user can only update their own leads
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      console.log('Lead updated successfully:', data);
      toast.success('Lead updated successfully!');
      return true;
      
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('Failed to update lead. Please try again.');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateLead,
    isUpdating
  };
};
