
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from "sonner";
import { Lead, mapDbLeadToAppLead } from '@/types/lead';
import { supabase } from '@/integrations/supabase/client';
import { useCheckoutUrlParams } from '@/hooks/use-checkout-url-params';
import { useAuthCheck } from '@/hooks/use-auth-check';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RatingDialog from '@/components/purchases/RatingDialog';
import LoadingState from '@/components/purchases/LoadingState';
import EmptyState from '@/components/purchases/EmptyState';
import PurchasedLeadsList from '@/components/purchases/PurchasedLeadsList';

const Purchases = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use our auth check hook for more detailed status
  const { user, isLoggedIn, role, authChecked, authError } = useAuthCheck();
  
  const [purchasedLeads, setPurchasedLeads] = useState<Lead[]>([]);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Handle completing a purchase
  const handleCompletePurchase = async (leadId: string) => {
    try {
      setIsLoading(true);
      
      console.log("[PURCHASE PAGE] Completing purchase for lead:", leadId);
      
      const { data, error } = await supabase.functions.invoke('complete-lead-purchase', {
        body: { leadId }
      });

      if (error) {
        console.error('[PURCHASE PAGE] Function error:', error);
        throw new Error(error.message);
      }
      
      console.log("[PURCHASE PAGE] Complete purchase response:", data);

      if (!data.success) {
        throw new Error(data.error || 'Failed to complete purchase');
      }
      
      toast.success('Lead purchased successfully!');
      // We'll reload leads via the normal effect after success
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error occurred';
      console.error('[PURCHASE PAGE] Error completing purchase:', error);
      toast.error('Failed to complete the purchase: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Process URL parameters if present
  useCheckoutUrlParams(authChecked, isLoggedIn, role, handleCompletePurchase);
  
  // First check for URL parameters before redirecting
  const queryParams = new URLSearchParams(location.search);
  const success = queryParams.get('success');
  const leadId = queryParams.get('lead_id');
  const hasCheckoutParams = success === 'true' && leadId;
  
  // Only redirect if no checkout parameters are present
  useEffect(() => {
    console.log('[PURCHASE PAGE] Auth state check:', { 
      isLoggedIn, 
      role, 
      authChecked,
      hasCheckoutParams,
      pathname: location.pathname,
      search: location.search
    });
    
    if (!authChecked) {
      console.log('[PURCHASE PAGE] Auth not checked yet, waiting...');
      return; // Wait until auth is checked
    }
    
    if (hasCheckoutParams) {
      console.log('[PURCHASE PAGE] Has checkout parameters, not redirecting');
      if (!isLoggedIn) {
        console.log('[PURCHASE PAGE] Not logged in with checkout params, storing for after login');
        sessionStorage.setItem('pendingPurchase', JSON.stringify({ success: true, leadId }));
        sessionStorage.setItem('redirectAfterLogin', '/purchases');
        navigate('/login', { replace: true });
      }
      return; // Don't redirect if we have checkout parameters
    }
    
    if (!isLoggedIn) {
      console.log('[PURCHASE PAGE] Not logged in, redirecting to login');
      toast.error("You must be logged in as a buyer to view this page");
      navigate('/login');
      return;
    }
    
    if (role !== 'buyer') {
      console.log('[PURCHASE PAGE] Not a buyer, redirecting to home');
      toast.error("Only buyers can access this page");
      navigate('/');
      return;
    }
  }, [isLoggedIn, role, authChecked, navigate, hasCheckoutParams, leadId, location.pathname, location.search]);
  
  const loadPurchasedLeads = async () => {
    if (!isLoggedIn || role !== 'buyer' || !user?.id) {
      console.log('[PURCHASE PAGE] Cannot load leads, not logged in as buyer');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("[PURCHASE PAGE] Loading purchased leads for user:", user.id);
      
      // Fetch leads from Supabase where the current user is the buyer
      const { data: leadsData, error } = await supabase
        .from('leads')
        .select('*')
        .eq('buyer_id', user.id)
        .eq('status', 'sold')
        .order('purchased_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      // Map database leads to app format
      const purchased = leadsData.map(mapDbLeadToAppLead);
      console.log("[PURCHASE PAGE] Fetched purchased leads:", purchased.length);
      
      setPurchasedLeads(purchased);
    } catch (error) {
      console.error('[PURCHASE PAGE] Error loading purchased leads:', error);
      toast.error('Failed to load your purchased leads');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (authChecked && isLoggedIn && role === 'buyer' && user?.id) {
      loadPurchasedLeads();
    }
  }, [isLoggedIn, role, user?.id, authChecked]);
  
  const handleRateLead = (lead: Lead) => {
    setSelectedLead(lead);
    setRatingDialogOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">My Purchased Leads</h1>
          <p className="text-gray-600">
            View and manage your purchased leads
          </p>
        </div>
        
        {isLoading ? (
          <LoadingState />
        ) : purchasedLeads.length > 0 ? (
          <PurchasedLeadsList leads={purchasedLeads} onRate={handleRateLead} />
        ) : (
          <EmptyState />
        )}
        
        <RatingDialog 
          open={ratingDialogOpen}
          selectedLead={selectedLead}
          userId={user?.id}
          onOpenChange={setRatingDialogOpen}
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default Purchases;
