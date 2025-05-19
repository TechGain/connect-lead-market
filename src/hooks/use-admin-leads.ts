
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Lead, mapDbLeadToAppLead } from '@/types/lead';
import { toast } from 'sonner';

export type LeadStatusFilter = 'all' | 'active' | 'sold' | 'refunded' | 'erased';

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
      } else if (statusFilter === 'sold') {
        query = query.eq('status', 'sold');
      } else if (statusFilter === 'refunded') {
        query = query.eq('status', 'refunded');
      } else if (statusFilter === 'erased') {
        query = query.eq('status', 'erased');
      }
      // 'all' filter does not add any constraints, returns ALL leads

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Error fetching leads:', fetchError);
        setError(fetchError.message);
        toast.error('Failed to load leads');
        return;
      }

      console.log(`Fetched ${data?.length || 0} leads with status filter: ${statusFilter}`);
      
      if (data) {
        // Log the statuses to debug
        const statuses = data.map(lead => lead.status);
        console.log('Lead statuses in fetched data:', statuses);
        
        const mappedLeads = data.map(mapDbLeadToAppLead);
        setLeads(mappedLeads);
      } else {
        setLeads([]);
      }
      
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
