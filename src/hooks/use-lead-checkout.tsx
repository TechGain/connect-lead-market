
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
    if (!user) {
      toast.error("Please log in to purchase leads");
      navigate('/login');
      return;
    }
    
    setSelectedLead(lead);
    setIsPreviewDialogOpen(true);
    // Reset any previous checkout errors
    setCheckoutError(null);
  };
  
  const initiateCheckout = async () => {
    if (!selectedLead || !user) return;
    
    try {
      setIsProcessing(true);
      setCheckoutError(null);
      
      console.log("Initiating checkout for lead:", selectedLead.id);
      
      const { data, error } = await supabase.functions.invoke('create-lead-checkout', {
        body: { leadId: selectedLead.id }
      });
      
      console.log("Checkout response:", data, error);
      
      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(error.message || 'Function invocation failed');
      }
      
      if (!data || !data.success) {
        const errorMsg = data?.error || 'Failed to create checkout session';
        console.error("Checkout error:", errorMsg);
        throw new Error(errorMsg);
      }
      
      if (!data.url) {
        throw new Error('No checkout URL returned');
      }
      
      // Close the dialog
      setIsPreviewDialogOpen(false);
      
      // Redirect to Stripe Checkout
      console.log("Redirecting to Stripe checkout:", data.url);
      window.location.href = data.url;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error initiating checkout:', errorMessage);
      setCheckoutError(errorMessage);
      toast.error(`Failed to initiate checkout: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompletePurchase = async (leadId: string) => {
    try {
      setIsProcessing(true);
      
      const { data, error } = await supabase.functions.invoke('complete-lead-purchase', {
        body: { leadId }
      });

      if (error) throw new Error(error.message);
      if (!data.success) throw new Error(data.error || 'Failed to complete purchase');
      
      toast.success('Lead purchased successfully!');
      navigate('/purchases');
    } catch (error) {
      console.error('Error completing purchase:', error);
      toast.error('Failed to complete the purchase. Please contact support.');
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
