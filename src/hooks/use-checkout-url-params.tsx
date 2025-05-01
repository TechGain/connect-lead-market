
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
    // We don't want to check URL parameters until authentication is checked
    if (!authChecked) {
      console.log('useCheckoutUrlParams: auth not checked yet, skipping URL check');
      return;
    }
    
    // If user is not logged in or not a buyer, we don't need to check URL parameters
    if (!isLoggedIn || role !== 'buyer') {
      console.log('useCheckoutUrlParams: user not logged in or not a buyer, skipping URL check', { isLoggedIn, role });
      return;
    }
    
    console.log('useCheckoutUrlParams: checking URL parameters');
    const queryParams = new URLSearchParams(window.location.search);
    const success = queryParams.get('success');
    const canceled = queryParams.get('canceled');
    const leadId = queryParams.get('lead_id');

    if (success === 'true' && leadId) {
      console.log('useCheckoutUrlParams: successful purchase, completing', { leadId });
      // Complete the lead purchase after successful payment
      handleCompletePurchase(leadId);
    } else if (canceled === 'true') {
      console.log('useCheckoutUrlParams: payment canceled');
      toast.error('Payment was canceled');
    }

    // Clear URL parameters
    if (success || canceled) {
      console.log('useCheckoutUrlParams: clearing URL parameters');
      navigate('/marketplace', { replace: true });
    }
  }, [authChecked, isLoggedIn, role, navigate, handleCompletePurchase]);
};
