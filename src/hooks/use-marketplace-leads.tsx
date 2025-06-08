
import { useState, useEffect, useCallback } from 'react';
import { toast } from "sonner";
import { Lead, mapDbLeadToAppLead } from '@/types/lead';
import { supabase } from '@/integrations/supabase/client';
import { isAppointmentPassed, isAppointmentToday, isAppointmentTomorrow, isAppointmentTodayOrTomorrow } from '@/lib/utils';

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
        .neq('status', 'erased') // Exclude erased leads from marketplace
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
      
      // Filter out leads with passed appointment times
      const visibleLeads = allLeads.filter(lead => {
        // Only check confirmed leads with appointment times
        if (lead.status === 'new' && 
            lead.confirmationStatus === 'confirmed' && 
            lead.appointmentTime) {
          
          // If the appointment has passed, mark it as should be erased
          const isPassed = isAppointmentPassed(lead.appointmentTime);
          
          if (isPassed) {
            console.log(`Lead ${lead.id} has passed appointment: ${lead.appointmentTime}`);
            
            // Update the lead status to 'erased' in the database
            // This is done asynchronously so we don't need to await it
            supabase
              .from('leads')
              .update({ status: 'erased' })
              .eq('id', lead.id)
              .then(({ error }) => {
                if (error) {
                  console.error(`Failed to update lead ${lead.id} status:`, error);
                } else {
                  console.log(`Lead ${lead.id} marked as erased due to passed appointment`);
                }
              });
            
            // Don't include this lead in the visible leads
            return false;
          }
        }
        
        return true;
      });
      
      // Sort leads - first by status (new leads first), then by creation date
      const sortedLeads = [...visibleLeads].sort((a, b) => {
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
    
    // Apply appointment date filter
    if (filters.appointmentDateFilter && filters.appointmentDateFilter !== 'all') {
      filtered = filtered.filter(lead => {
        if (!lead.appointmentTime) {
          return false; // Exclude leads without appointment times when filtering by date
        }
        
        switch (filters.appointmentDateFilter) {
          case 'today':
            return isAppointmentToday(lead.appointmentTime);
          case 'tomorrow':
            return isAppointmentTomorrow(lead.appointmentTime);
          case 'today-tomorrow':
            return isAppointmentTodayOrTomorrow(lead.appointmentTime);
          default:
            return true;
        }
      });
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
