
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { Lead } from '@/types/lead';
import { fetchLeads } from '@/lib/mock-data';

export const useMarketplaceLeads = (authChecked: boolean, authError: string | null, isLoggedIn: boolean, role: string | null) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load leads once auth check is complete and user is authorized
  useEffect(() => {
    const loadLeads = async () => {
      if (!authChecked) return; // Don't attempt to load until auth is checked
      if (authError) return; // Don't attempt to load if there's an auth error
      if (!isLoggedIn || role !== 'buyer') return; // Don't attempt to load if user isn't authorized
      
      setIsLoading(true);
      try {
        console.log('Loading marketplace leads...');
        const leadsData = await fetchLeads();
        // Only show available leads (not sold)
        const availableLeads = leadsData.filter(lead => lead.status !== 'sold');
        setLeads(availableLeads);
        setFilteredLeads(availableLeads);
        console.log('Loaded leads:', availableLeads.length);
      } catch (error) {
        console.error('Error loading marketplace leads:', error);
        toast.error('Failed to load marketplace leads');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLeads();
  }, [authChecked, authError, isLoggedIn, role]);

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
