
import { useState } from 'react';
import { toast } from "sonner";
import { Lead } from '@/types/lead';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const useLeadCheckout = (user: any) => {
  const navigate = useNavigate();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [redirectingToStripe, setRedirectingToStripe] = useState(false);
  const [stripeUrl, setStripeUrl] = useState<string | null>(null);
  
  const handlePurchaseLead = (lead: Lead) => {
    // Reset any previous errors
    setCheckoutError(null);
    
    if (!user) {
      toast.error("Please log in to purchase leads");
      navigate('/login');
      return;
    }
    
    setSelectedLead(lead);
    setIsPreviewDialogOpen(true);
  };
  
  const initiateCheckout = async () => {
    if (!selectedLead || !user) {
      setCheckoutError("Missing lead or user data");
      toast.error("Missing required data for checkout");
      return;
    }
    
    try {
      setIsProcessing(true);
      setCheckoutError(null);
      setStripeUrl(null);
      
      console.log("[CHECKOUT] Starting checkout process");
      console.log("[CHECKOUT] Lead ID:", selectedLead.id);
      console.log("[CHECKOUT] User ID:", user.id);
      console.log("[CHECKOUT] User email:", user.email);
      
      // Check if user has valid session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("No active session found. Please log in again.");
      }
      console.log("[CHECKOUT] Authentication status:", !!sessionData.session);
      
      // Invoke the edge function
      console.log("[CHECKOUT] Invoking create-lead-checkout function");
      const { data, error } = await supabase.functions.invoke('create-lead-checkout', {
        body: { 
          leadId: selectedLead.id 
        }
      });
      
      if (error) {
        console.error('[CHECKOUT] Supabase function error:', error);
        throw new Error(`Function error: ${error.message || error.name || 'Unknown error'}`);
      }
      
      console.log("[CHECKOUT] Checkout function response:", data);
      
      if (!data) {
        throw new Error("No data returned from checkout function");
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create checkout session');
      }
      
      if (!data.url) {
        throw new Error('No checkout URL returned');
      }
      
      // Store the URL for manual redirect fallback
      setStripeUrl(data.url);
      
      // Close the dialog and set redirecting state
      setIsPreviewDialogOpen(false);
      setRedirectingToStripe(true);
      
      // Log the URL we're redirecting to
      console.log("[CHECKOUT] Redirecting to Stripe checkout:", data.url);
      
      // Show toast before redirecting
      toast.info("Redirecting to secure checkout...");
      
      // CRITICAL FIX: Use window.top to ensure redirect happens at top level, not in iframe
      // This addresses the Stripe error: "Checkout is not able to run in an iFrame"
      setTimeout(() => {
        // Use window.top.location.href to ensure redirect happens at the top level
        window.top.location.href = data.url;
        
        // Set a timeout to detect if redirect failed
        setTimeout(() => {
          if (document.visibilityState !== 'hidden') {
            console.log("[CHECKOUT] Redirect may have failed, visibility state:", document.visibilityState);
            setRedirectingToStripe(false);
            setIsProcessing(false);
            toast.error("Redirect to Stripe failed. Please try the manual link or contact support.");
          }
        }, 5000);
      }, 800);
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error occurred';
      console.error('[CHECKOUT] Error initiating checkout:', error);
      
      setCheckoutError(errorMessage);
      setRedirectingToStripe(false);
      setStripeUrl(null);
      
      if (errorMessage.includes('authentication') || errorMessage.includes('auth') || 
          errorMessage.includes('session') || errorMessage.includes('login')) {
        toast.error('Authentication error. Please try logging out and back in.');
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch') || 
                errorMessage.includes('send') || errorMessage.includes('connect') ||
                errorMessage.includes('CORS')) {
        toast.error('Network or CORS error. Please check your connection and try again.');
      } else {
        toast.error('Failed to initiate checkout: ' + errorMessage);
      }
      
      setIsProcessing(false);
    }
  };

  const handleCompletePurchase = async (leadId: string) => {
    try {
      setIsProcessing(true);
      setCheckoutError(null);
      
      console.log("[CHECKOUT] Completing purchase for lead:", leadId);
      
      const { data, error } = await supabase.functions.invoke('complete-lead-purchase', {
        body: { leadId }
      });

      if (error) {
        console.error('[CHECKOUT] Function error:', error);
        throw new Error(error.message);
      }
      
      console.log("[CHECKOUT] Complete purchase response:", data);

      if (!data.success) {
        throw new Error(data.error || 'Failed to complete purchase');
      }
      
      toast.success('Lead purchased successfully!');
      navigate('/purchases');
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error occurred';
      console.error('[CHECKOUT] Error completing purchase:', error);
      setCheckoutError(errorMessage);
      toast.error('Failed to complete the purchase: ' + errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    selectedLead,
    isPreviewDialogOpen,
    isProcessing,
    checkoutError,
    redirectingToStripe,
    stripeUrl,
    handlePurchaseLead,
    setIsPreviewDialogOpen,
    initiateCheckout,
    handleCompletePurchase
  };
};
