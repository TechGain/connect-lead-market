
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
  
  const handlePurchaseLead = (lead: Lead) => {
    if (!user) {
      toast.error("Please log in to purchase leads");
      navigate('/login');
      return;
    }
    
    setSelectedLead(lead);
    setIsPreviewDialogOpen(true);
  };
  
  const initiateCheckout = async () => {
    if (!selectedLead || !user) return;
    
    try {
      setIsProcessing(true);
      
      const { data, error } = await supabase.functions.invoke('create-lead-checkout', {
        body: { leadId: selectedLead.id }
      });
      
      if (error) throw new Error(error.message);
      if (!data.success) throw new Error(data.error || 'Failed to create checkout session');
      
      // Close the dialog
      setIsPreviewDialogOpen(false);
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Error initiating checkout:', error);
      toast.error('Failed to initiate checkout');
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
    handlePurchaseLead,
    setIsPreviewDialogOpen,
    initiateCheckout,
    handleCompletePurchase
  };
};
