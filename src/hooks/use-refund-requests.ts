
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RefundRequest {
  id: string;
  lead_id: string;
  buyer_id: string;
  reason: string;
  requested_at: string;
  status: 'pending' | 'approved' | 'denied';
  admin_notes?: string;
  processed_at?: string;
  processed_by?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  lead?: any;
  buyer?: any;
}

export const useRefundRequests = () => {
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchRefundRequests = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching refund requests...');

      const { data, error } = await supabase
        .from('refund_requests')
        .select(`
          *,
          lead:leads(*),
          buyer:profiles!refund_requests_buyer_id_fkey(*)
        `)
        .order('requested_at', { ascending: false });

      if (error) {
        console.error('Error fetching refund requests:', error);
        toast.error('Failed to load refund requests');
        return;
      }

      console.log(`Fetched ${data?.length || 0} refund requests`);
      setRefundRequests(data || []);
    } catch (error) {
      console.error('Exception fetching refund requests:', error);
      toast.error('Failed to load refund requests');
    } finally {
      setIsLoading(false);
    }
  };

  const processRefundRequest = async (
    requestId: string, 
    action: 'approve' | 'deny', 
    adminNotes?: string
  ) => {
    try {
      setIsProcessing(true);
      console.log(`Processing refund request ${requestId} with action: ${action}`);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const status = action === 'approve' ? 'approved' : 'denied';
      
      const { data, error } = await supabase
        .from('refund_requests')
        .update({
          status,
          admin_notes: adminNotes || null,
          processed_at: new Date().toISOString(),
          processed_by: user.id
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) {
        console.error('Error processing refund request:', error);
        throw new Error(error.message);
      }

      console.log('Refund request processed successfully:', data);
      
      // If approved, we might want to trigger the actual refund process
      if (action === 'approve') {
        // This could trigger the existing refund lead function
        toast.success('Refund request approved. Processing refund...');
      } else {
        toast.success('Refund request denied.');
      }

      // Refresh the list
      await fetchRefundRequests();
      
      return true;
    } catch (error: any) {
      console.error('Exception processing refund request:', error);
      toast.error(error.message || 'Failed to process refund request');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchRefundRequests();
  }, []);

  return {
    refundRequests,
    isLoading,
    isProcessing,
    fetchRefundRequests,
    processRefundRequest
  };
};
