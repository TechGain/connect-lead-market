
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LeadCard from '@/components/LeadCard';
import StarRating from '@/components/StarRating';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from "sonner";
import { Lead, mapDbLeadToAppLead } from '@/types/lead';
import { rateLead } from '@/lib/mock-data';
import { useUserRole } from '@/hooks/use-user-role';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useCheckoutUrlParams } from '@/hooks/use-checkout-url-params';
import { useAuthCheck } from '@/hooks/use-auth-check';

const Purchases = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use our auth check hook for more detailed status
  const { user, isLoggedIn, role, authChecked, authError } = useAuthCheck();
  
  const [purchasedLeads, setPurchasedLeads] = useState<Lead[]>([]);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Handle completing a purchase
  const handleCompletePurchase = async (leadId: string) => {
    try {
      setIsLoading(true);
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
  
  useEffect(() => {
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
    
    if (authChecked && isLoggedIn && role === 'buyer' && user?.id) {
      loadPurchasedLeads();
    }
  }, [isLoggedIn, role, user?.id, authChecked]);
  
  const handleRateLead = (lead: Lead) => {
    setSelectedLead(lead);
    setRatingDialogOpen(true);
  };
  
  const submitRating = async () => {
    if (!selectedLead || !user?.id) return;
    
    try {
      // Insert rating into lead_ratings table
      const { error } = await supabase.from('lead_ratings').insert({
        lead_id: selectedLead.id,
        buyer_id: user.id,
        rating: rating,
        review: review
      });
      
      if (error) throw error;
      
      toast.success('Thank you for your feedback!');
      setRatingDialogOpen(false);
      
      // Reset form
      setRating(5);
      setReview('');
    } catch (error) {
      console.error('[PURCHASE PAGE] Error submitting rating:', error);
      toast.error('Failed to submit rating');
    }
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
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <p>Loading your purchases...</p>
          </div>
        ) : purchasedLeads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchasedLeads.map(lead => (
              <div key={lead.id} className="relative">
                <LeadCard
                  lead={lead}
                  showFullDetails={true}
                  isPurchased={true}
                />
                <div className="mt-2 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRateLead(lead)}
                  >
                    Rate This Lead
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No Purchased Leads</h3>
            <p className="text-gray-600 mb-4">You haven't purchased any leads yet</p>
            <Button onClick={() => navigate('/marketplace')}>Browse Marketplace</Button>
          </div>
        )}
        
        <Dialog open={ratingDialogOpen} onOpenChange={setRatingDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Rate this Lead</DialogTitle>
              <DialogDescription>
                Please rate the quality of this lead and provide feedback.
              </DialogDescription>
            </DialogHeader>
            
            {selectedLead && (
              <div className="py-4">
                <div className="border-b pb-3 mb-3">
                  <h3 className="font-medium">{selectedLead.type} Lead in {selectedLead.location}</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="font-medium">Quality Rating</label>
                    <div className="flex items-center">
                      <StarRating 
                        rating={rating} 
                        onRatingChange={setRating}
                        readOnly={false}
                        size={24} 
                      />
                      <span className="ml-2 text-sm text-gray-500">{rating} of 5 stars</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="font-medium">Your Review (Optional)</label>
                    <Textarea
                      placeholder="Tell us about your experience with this lead..."
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setRatingDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitRating}>
                Submit Rating
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      
      <Footer />
    </div>
  );
};

export default Purchases;
