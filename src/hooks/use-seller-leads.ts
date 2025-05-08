
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Lead, mapDbLeadToAppLead } from '@/types/lead';

export const useSellerLeads = (sellerId: string | undefined) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (sellerId) {
      loadSellerLeads(sellerId);
    }
  }, [sellerId]);

  const loadSellerLeads = async (sellerId: string) => {
    try {
      setIsLoading(true);
      console.log("Loading leads for seller:", sellerId);
      
      const { data: leadsData, error } = await supabase
        .from('leads')
        .select('*')
        .eq('seller_id', sellerId);
        
      if (error) {
        throw error;
      }
      
      console.log("Loaded seller leads:", leadsData?.length);
      
      // Map database leads to app format
      const sellerLeads = leadsData.map(mapDbLeadToAppLead);
      setLeads(sellerLeads);
    } catch (error) {
      console.error("Error loading leads:", error);
      toast.error("Failed to load leads. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    leads,
    isLoading,
    refreshLeads: (sellerId: string) => loadSellerLeads(sellerId)
  };
};
