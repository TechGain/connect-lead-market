
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
      
      // Attempt to invoke the edge function with improved error handling
      console.log("[CHECKOUT] Invoking create-lead-checkout function");
      const { data, error } = await supabase.functions.invoke('create-lead-checkout', {
        body: { 
          leadId: selectedLead.id 
        },
        headers: {
          // Remove the x-application-name header that's causing CORS issues
          // Let Supabase JS client handle the necessary headers
        }
      });
      
      if (error) {
        console.error('[CHECKOUT] Supabase function error:', error);
        
        // Check for CORS-related errors
        if (error.message && error.message.includes("CORS") || error.message.includes("fetch")) {
          console.error('[CHECKOUT] Possible CORS issue detected');
          throw new Error(`CORS or network error: ${error.message}. Please check your network connection and browser settings.`);
        }
        
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
      
      // Close the dialog
      setIsPreviewDialogOpen(false);
      
      // Log the URL we're redirecting to
      console.log("[CHECKOUT] Redirecting to Stripe checkout:", data.url);
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error occurred';
      console.error('[CHECKOUT] Error initiating checkout:', error);
      
      // Set detailed error for debugging
      setCheckoutError(errorMessage);
      
      // Show different messages based on error type
      if (errorMessage.includes('authentication') || errorMessage.includes('auth') || 
          errorMessage.includes('session') || errorMessage.includes('login')) {
        toast.error('Authentication error. Please try logging out and back in.');
        console.error('[CHECKOUT] Authentication issue. User may need to re-authenticate.');
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch') || 
                errorMessage.includes('send') || errorMessage.includes('connect') ||
                errorMessage.includes('CORS')) {
        toast.error('Network or CORS error. Please check your connection and try again.');
        console.error('[CHECKOUT] Network or CORS issue. Edge function may be unreachable.');
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
    handlePurchaseLead,
    setIsPreviewDialogOpen,
    initiateCheckout,
    handleCompletePurchase
  };
};
