
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LeadCard from '@/components/LeadCard';
import StarRating from '@/components/StarRating';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from "sonner";
import { Lead } from '@/types/lead';
import { fetchLeadsByBuyer, rateLead } from '@/lib/mock-data';
import { useUserRole } from '@/hooks/use-user-role';
import { useNavigate } from 'react-router-dom';

const Purchases = () => {
  const navigate = useNavigate();
  const { isLoggedIn, role, user } = useUserRole();
  
  const [purchasedLeads, setPurchasedLeads] = useState<Lead[]>([]);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!isLoggedIn) {
      toast.error("You must be logged in as a buyer to view this page");
      navigate('/login');
      return;
    }
    
    if (role !== 'buyer') {
      toast.error("Only buyers can access this page");
      navigate('/');
      return;
    }
    
    const loadPurchasedLeads = async () => {
      setIsLoading(true);
      try {
        if (user?.id) {
          const leads = await fetchLeadsByBuyer(user.id);
          setPurchasedLeads(leads);
        }
      } catch (error) {
        console.error('Error loading purchased leads:', error);
        toast.error('Failed to load your purchased leads');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user?.id) {
      loadPurchasedLeads();
    }
  }, [isLoggedIn, role, navigate, user?.id]);
  
  const handleRateLead = (lead: Lead) => {
    setSelectedLead(lead);
    setRatingDialogOpen(true);
  };
  
  const submitRating = async () => {
    if (!selectedLead || !user?.id) return;
    
    try {
      const success = await rateLead(selectedLead.id, user.id, rating, review);
      
      if (success) {
        toast.success('Thank you for your feedback!');
        setRatingDialogOpen(false);
        
        // Reset form
        setRating(5);
        setReview('');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
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
            <p>Loading your purchases...</p>
          </div>
        ) : purchasedLeads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchasedLeads.map(lead => (
              <div key={lead.id} className="relative">
                <LeadCard
                  lead={lead}
                  onPurchase={() => {}}
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
