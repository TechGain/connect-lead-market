
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Lead } from '@/types/lead';

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
      
      // Prepare the lead data for Supabase (mapping to database schema)
      const leadData = {
        type: lead.type,
        location: lead.location,
        description: lead.description,
        price: lead.price,
        quality_rating: lead.qualityRating,
        seller_id: user.id,
        status: 'new',
        contact_name: lead.contactName,
        contact_email: lead.contactEmail,
        contact_phone: lead.contactPhone || null
      };
      
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
