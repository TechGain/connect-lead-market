
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { Lead, mapDbLeadToAppLead } from '@/types/lead';
import { supabase } from '@/integrations/supabase/client';

export const useMarketplaceLeads = (shouldLoad: boolean, role: string | null) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load leads when shouldLoad is true (auth is successful or force show enabled)
  useEffect(() => {
    const loadLeads = async () => {
      console.log('useMarketplaceLeads: checking if leads should be loaded', { shouldLoad });
      
      if (!shouldLoad) {
        console.log('useMarketplaceLeads: not loading leads yet, waiting for auth or force show');
        return;
      }
      
      setIsLoading(true);
      try {
        console.log('useMarketplaceLeads: loading marketplace leads from Supabase...');
        
        const { data: leadsData, error } = await supabase
          .from('leads')
          .select('*')
          .neq('status', 'sold')
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        // Map database leads to app format
        const availableLeads = leadsData.map(mapDbLeadToAppLead);
        console.log('useMarketplaceLeads: loaded leads:', availableLeads.length);
        
        setLeads(availableLeads);
        setFilteredLeads(availableLeads);
      } catch (error) {
        console.error('Error loading marketplace leads:', error);
        toast.error('Failed to load marketplace leads');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLeads();
  }, [shouldLoad]);

  const handleFilterChange = (filters: any) => {
    let filtered = [...leads];
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(lead => 
        lead.type.toLowerCase().includes(searchTerm) ||
        lead.location.toLowerCase().includes(searchTerm) ||
        lead.description.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filters.type) {
      filtered = filtered.filter(lead => 
        lead.type.toLowerCase() === filters.type.toLowerCase()
      );
    }
    
    if (filters.location) {
      filtered = filtered.filter(lead => 
        lead.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    filtered = filtered.filter(lead => 
      lead.price >= filters.minPrice && 
      lead.price <= filters.maxPrice
    );
    
    if (filters.minRating > 0) {
      filtered = filtered.filter(lead => lead.qualityRating >= filters.minRating);
    }
    
    setFilteredLeads(filtered);
  };
  
  const resetFilters = () => {
    setFilteredLeads(leads);
  };

  return {
    leads,
    filteredLeads,
    isLoading,
    handleFilterChange,
    resetFilters
  };
};
