
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
      
      console.log("Starting checkout process for lead:", selectedLead.id);
      console.log("Current user:", user.id);
      
      const { data, error } = await supabase.functions.invoke('create-lead-checkout', {
        body: { leadId: selectedLead.id }
      });
      
      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Function error: ${error.message}`);
      }
      
      console.log("Checkout function response:", data);
      
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
      console.log("Redirecting to Stripe checkout:", data.url);
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error occurred';
      console.error('Error initiating checkout:', error);
      
      // Set detailed error for debugging
      setCheckoutError(errorMessage);
      
      // Show different messages based on error type
      if (errorMessage.includes('authentication') || errorMessage.includes('auth')) {
        toast.error('Authentication error. Please try logging out and back in.');
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        toast.error('Network error. Please check your connection.');
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
      
      console.log("Completing purchase for lead:", leadId);
      
      const { data, error } = await supabase.functions.invoke('complete-lead-purchase', {
        body: { leadId }
      });

      if (error) {
        console.error('Function error:', error);
        throw new Error(error.message);
      }
      
      console.log("Complete purchase response:", data);

      if (!data.success) {
        throw new Error(data.error || 'Failed to complete purchase');
      }
      
      toast.success('Lead purchased successfully!');
      navigate('/purchases');
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error occurred';
      console.error('Error completing purchase:', error);
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
