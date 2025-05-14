
import { useState, useEffect, useCallback } from 'react';
import { toast } from "sonner";
import { Lead, mapDbLeadToAppLead } from '@/types/lead';
import { supabase } from '@/integrations/supabase/client';

export const useMarketplaceLeads = (shouldLoad: boolean, role: string | null) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  
  // Extract the load leads function so we can call it manually
  const loadLeads = useCallback(async () => {
    console.log('useMarketplaceLeads: loading leads, force refresh triggered');
    
    setIsLoading(true);
    try {
      console.log('useMarketplaceLeads: loading ALL leads from Supabase...');
      
      const { data: leadsData, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      console.log('Raw leads data from Supabase:', leadsData);
      
      if (!leadsData || leadsData.length === 0) {
        console.log('No leads returned from database');
        setLeads([]);
        setFilteredLeads([]);
        setIsLoading(false);
        return;
      }
      
      // Map database leads to app format
      const allLeads = leadsData.map(mapDbLeadToAppLead);
      
      // Sort leads - first by status (new leads first), then by creation date
      const sortedLeads = [...allLeads].sort((a, b) => {
        // First sort by status - 'new' comes before other statuses
        if (a.status === 'new' && b.status !== 'new') return -1;
        if (a.status !== 'new' && b.status === 'new') return 1;
        
        // If statuses are the same, sort by creation date (newest first)
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      
      console.log('useMarketplaceLeads: loaded leads count:', sortedLeads.length);
      console.log('Lead statuses after sorting:', sortedLeads.map(l => l.status).join(', '));
      
      setLeads(sortedLeads);
      setFilteredLeads(sortedLeads);
      // Update last refreshed timestamp
      setLastRefreshed(new Date());
      toast.success('Marketplace data refreshed');
    } catch (error) {
      console.error('Error loading marketplace leads:', error);
      toast.error('Failed to load marketplace leads');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Load leads when shouldLoad is true (auth is successful or force show enabled)
  useEffect(() => {
    console.log('useMarketplaceLeads: checking if leads should be loaded', { shouldLoad });
    
    if (!shouldLoad) {
      console.log('useMarketplaceLeads: not loading leads yet, waiting for auth or force show');
      return;
    }
    
    loadLeads();
  }, [shouldLoad, loadLeads]);

  const handleFilterChange = (filters: any) => {
    let filtered = [...leads];
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(lead => 
        lead.type.toLowerCase().includes(searchTerm) ||
        lead.location.toLowerCase().includes(searchTerm) ||
        lead.description.toLowerCase().includes(searchTerm) ||
        lead.zipCode?.toLowerCase().includes(searchTerm) ||
        lead.firstName?.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filters.type) {
      filtered = filtered.filter(lead => 
        lead.type.toLowerCase() === filters.type.toLowerCase()
      );
    }
    
    if (filters.location) {
      filtered = filtered.filter(lead => 
        lead.location.toLowerCase().includes(filters.location.toLowerCase()) ||
        lead.zipCode?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    filtered = filtered.filter(lead => 
      lead.price >= filters.minPrice && 
      lead.price <= filters.maxPrice
    );
    
    if (filters.minRating > 0) {
      filtered = filtered.filter(lead => lead.qualityRating >= filters.minRating);
    }
    
    // After applying all filters, re-sort to maintain the order (available first, then sold)
    filtered = filtered.sort((a, b) => {
      // First sort by status - 'new' comes before other statuses
      if (a.status === 'new' && b.status !== 'new') return -1;
      if (a.status !== 'new' && b.status === 'new') return 1;
      
      // If statuses are the same, sort by creation date (newest first)
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
    
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
    resetFilters,
    refreshLeads: loadLeads,
    lastRefreshed
  };
};
