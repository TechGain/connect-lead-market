
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from "sonner";

export const useCheckoutUrlParams = (
  authChecked: boolean, 
  isLoggedIn: boolean, 
  role: string | null, 
  handleCompletePurchase: (leadId: string) => Promise<void>
) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Check URL parameters for successful purchase
  useEffect(() => {
    // Extract query parameters first, before any potential navigation
    const queryParams = new URLSearchParams(location.search);
    const success = queryParams.get('success');
    const canceled = queryParams.get('canceled');
    const leadId = queryParams.get('lead_id');
    
    // Log all parameters immediately to debug
    console.log('useCheckoutUrlParams: URL parameters check', { 
      success, 
      canceled, 
      leadId,
      authChecked,
      isLoggedIn,
      role,
      pathname: location.pathname
    });
    
    // Store purchase parameters in sessionStorage if we have them but auth isn't ready
    if ((success === 'true' || canceled === 'true') && (!authChecked || !isLoggedIn)) {
      console.log('useCheckoutUrlParams: Storing purchase params in session storage for after login');
      if (success === 'true' && leadId) {
        sessionStorage.setItem('pendingPurchase', JSON.stringify({ success: true, leadId }));
      } else if (canceled === 'true') {
        sessionStorage.setItem('pendingPurchase', JSON.stringify({ canceled: true }));
      }
    }

    // We don't want to check URL parameters until authentication is checked
    if (!authChecked) {
      console.log('useCheckoutUrlParams: auth not checked yet, skipping URL check');
      return;
    }
    
    // If user is not logged in, wait for login process
    if (!isLoggedIn) {
      console.log('useCheckoutUrlParams: user not logged in, skipping URL check', { isLoggedIn, role });
      return;
    }
    
    // If user is not a buyer, we don't need to check URL parameters
    if (role !== 'buyer') {
      console.log('useCheckoutUrlParams: user not a buyer, skipping URL check', { isLoggedIn, role });
      return;
    }
    
    // Process URL parameters if present
    if (success === 'true' && leadId) {
      console.log('useCheckoutUrlParams: successful purchase, completing', { leadId });
      // Complete the lead purchase after successful payment
      handleCompletePurchase(leadId);
      
      // Clear URL parameters
      navigate('/purchases', { replace: true });
    } else if (canceled === 'true') {
      console.log('useCheckoutUrlParams: payment canceled');
      toast.error('Payment was canceled');
      
      // Clear URL parameters
      navigate('/marketplace', { replace: true });
    }
    
    // Check for pending purchase in session storage (from pre-login state)
    const pendingPurchaseStr = sessionStorage.getItem('pendingPurchase');
    if (pendingPurchaseStr) {
      console.log('useCheckoutUrlParams: found pending purchase in session storage');
      try {
        const pendingPurchase = JSON.parse(pendingPurchaseStr);
        
        if (pendingPurchase.success && pendingPurchase.leadId) {
          console.log('useCheckoutUrlParams: processing pending purchase from session storage', pendingPurchase);
          handleCompletePurchase(pendingPurchase.leadId);
        } else if (pendingPurchase.canceled) {
          console.log('useCheckoutUrlParams: found canceled purchase in session storage');
          toast.error('Payment was canceled');
        }
        
        // Clear pending purchase
        sessionStorage.removeItem('pendingPurchase');
        
        // Navigate accordingly
        if (pendingPurchase.success) {
          navigate('/purchases', { replace: true });
        } else {
          navigate('/marketplace', { replace: true });
        }
      } catch (error) {
        console.error('useCheckoutUrlParams: Error processing pending purchase', error);
        sessionStorage.removeItem('pendingPurchase');
      }
    }
  }, [authChecked, isLoggedIn, role, navigate, handleCompletePurchase, location.search]);
};
