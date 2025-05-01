
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

export const useCheckoutUrlParams = (
  authChecked: boolean, 
  isLoggedIn: boolean, 
  role: string | null, 
  handleCompletePurchase: (leadId: string) => Promise<void>
) => {
  const navigate = useNavigate();

  // Check URL parameters for successful purchase
  useEffect(() => {
    if (!authChecked || !isLoggedIn || role !== 'buyer') return;
    
    const queryParams = new URLSearchParams(window.location.search);
    const success = queryParams.get('success');
    const canceled = queryParams.get('canceled');
    const leadId = queryParams.get('lead_id');

    if (success === 'true' && leadId) {
      // Complete the lead purchase after successful payment
      handleCompletePurchase(leadId);
    } else if (canceled === 'true') {
      toast.error('Payment was canceled');
    }

    // Clear URL parameters
    if (success || canceled) {
      navigate('/marketplace', { replace: true });
    }
  }, [authChecked, isLoggedIn, role, navigate, handleCompletePurchase]);
};
