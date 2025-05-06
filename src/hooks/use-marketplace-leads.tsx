
import { useState, useEffect, useCallback } from 'react';
import { toast } from "sonner";
import { Lead, mapDbLeadToAppLead } from '@/types/lead';
import { supabase } from '@/integrations/supabase/client';

export const useMarketplaceLeads = (shouldLoad: boolean, role: string | null) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [leadCounts, setLeadCounts] = useState({ available: 0, sold: 0, pending: 0, total: 0 });
  
  // Extract the load leads function so we can call it manually
  const loadLeads = useCallback(async () => {
    console.log('useMarketplaceLeads: loading leads, force refresh triggered');
    
    setIsLoading(true);
    try {
      console.log('useMarketplaceLeads: loading ALL leads from Supabase...');
      
      // Explicitly log the query we're sending to Supabase
      console.log('Querying Supabase leads table with no filters or status restrictions');
      
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
        setLeadCounts({ available: 0, sold: 0, pending: 0, total: 0 });
        setIsLoading(false);
        return;
      }
      
      // Log each raw lead status before mapping
      console.log('Lead statuses BEFORE mapping:');
      leadsData.forEach(lead => {
        console.log(`Lead ID: ${lead.id}, Raw DB Status: ${lead.status} (${typeof lead.status})`);
      });
      
      // Map database leads to app format and do NOT filter out sold ones
      const allLeads = leadsData.map(mapDbLeadToAppLead);
      
      // Explicitly log each lead's status after mapping
      console.log('Lead statuses AFTER mapping:');
      allLeads.forEach(lead => {
        console.log(`Lead ID: ${lead.id}, Mapped Status: ${lead.status}`);
      });
      
      // Count leads by status with explicit type checking
      const availableCount = allLeads.filter(lead => lead.status === 'new').length;
      const soldCount = allLeads.filter(lead => lead.status === 'sold').length;
      const pendingCount = allLeads.filter(lead => lead.status === 'pending').length;
      
      console.log('Status counts calculation:', {
        new: availableCount,
        sold: soldCount,
        pending: pendingCount,
        total: allLeads.length
      });
      
      setLeadCounts({
        available: availableCount,
        sold: soldCount,
        pending: pendingCount,
        total: allLeads.length
      });
      
      console.log('useMarketplaceLeads: loaded leads count:', allLeads.length);
      console.log('Lead statuses breakdown:', {
        new: availableCount,
        sold: soldCount,
        pending: pendingCount
      });
      
      setLeads(allLeads);
      setFilteredLeads(allLeads);
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
    
    // Update counts for the filtered results
    const availableCount = filtered.filter(lead => lead.status === 'new').length;
    const soldCount = filtered.filter(lead => lead.status === 'sold').length;
    const pendingCount = filtered.filter(lead => lead.status === 'pending').length;
    
    setLeadCounts({
      available: availableCount,
      sold: soldCount,
      pending: pendingCount,
      total: filtered.length
    });
    
    setFilteredLeads(filtered);
  };
  
  const resetFilters = () => {
    // Reset counts to match all leads when filters are reset
    const availableCount = leads.filter(lead => lead.status === 'new').length;
    const soldCount = leads.filter(lead => lead.status === 'sold').length;
    const pendingCount = leads.filter(lead => lead.status === 'pending').length;
    
    setLeadCounts({
      available: availableCount,
      sold: soldCount,
      pending: pendingCount,
      total: leads.length
    });
    
    setFilteredLeads(leads);
  };

  return {
    leads,
    filteredLeads,
    isLoading,
    handleFilterChange,
    resetFilters,
    refreshLeads: loadLeads,
    lastRefreshed,
    leadCounts
  };
};
