
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Lead, mapDbLeadToAppLead } from '@/types/lead';
import { toast } from 'sonner';

export type LeadStatusFilter = 'all' | 'active' | 'sold' | 'erased';

export const useAdminLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<LeadStatusFilter>('all');

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching admin leads with status filter:', statusFilter);
      
      let query = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Apply status filters
      if (statusFilter === 'active') {
        query = query.in('status', ['new', 'pending']);
      } else if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching leads:', error);
        setError(error.message);
        toast.error('Failed to load leads');
        return;
      }

      console.log('Fetched leads:', data);
      const mappedLeads = data.map(mapDbLeadToAppLead);
      setLeads(mappedLeads);
      
    } catch (err: any) {
      console.error('Exception when fetching leads:', err);
      setError(err.message);
      toast.error('An error occurred while loading leads');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  return {
    leads,
    isLoading,
    error,
    statusFilter,
    setStatusFilter,
    refreshLeads: fetchLeads
  };
};
