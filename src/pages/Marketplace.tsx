
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LeadCard from '@/components/LeadCard';
import LeadFilters from '@/components/LeadFilters';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import { Lead } from '@/types/lead';
import { mockLeads } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import { useUserRole } from '@/hooks/use-user-role';

const Marketplace = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useUserRole();
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  
  useEffect(() => {
    // In a real app, we would fetch leads from an API
    const availableLeads = mockLeads.filter(lead => lead.status !== 'sold');
    setLeads(availableLeads);
    setFilteredLeads(availableLeads);
  }, []);
  
  const handleFilterChange = (filters: any) => {
    let filtered = [...leads];
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(lead => 
        lead.type.toLowerCase().includes(searchTerm) ||
        lead.location.toLowerCase().includes(searchTerm) ||
        lead.description.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filters.type) {
      filtered = filtered.filter(lead => 
        lead.type.toLowerCase() === filters.type.toLowerCase()
      );
    }
    
    if (filters.location) {
      filtered = filtered.filter(lead => 
        lead.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    filtered = filtered.filter(lead => 
      lead.price >= filters.minPrice && 
      lead.price <= filters.maxPrice
    );
    
    if (filters.minRating > 0) {
      filtered = filtered.filter(lead => lead.qualityRating >= filters.minRating);
    }
    
    setFilteredLeads(filtered);
  };
  
  const handlePurchaseLead = (lead: Lead) => {
    if (!isLoggedIn) {
      toast.error("Please log in to purchase leads");
      navigate('/login');
      return;
    }
    
    setSelectedLead(lead);
    setIsPreviewDialogOpen(true);
  };
  
  const confirmPurchase = () => {
    if (!selectedLead) return;
    
    // In a real app, we would make an API call to purchase the lead
    toast.success(`Lead purchased successfully!`);
    
    // Update the lead status
    const updatedLeads = leads.map(l => 
      l.id === selectedLead.id 
        ? { ...l, status: 'sold' as const, buyerId: 'current-buyer-id', purchasedAt: new Date().toISOString() } 
        : l
    );
    
    setLeads(updatedLeads);
    setFilteredLeads(updatedLeads.filter(l => l.status !== 'sold'));
    setIsPreviewDialogOpen(false);
    
    // Navigate to the purchases page
    navigate('/purchases');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Lead Marketplace</h1>
          <p className="text-gray-600">
            Browse available leads from verified sellers
          </p>
        </div>
        
        <LeadFilters onFilterChange={handleFilterChange} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.length > 0 ? (
            filteredLeads.map(lead => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onPurchase={handlePurchaseLead}
              />
            ))
          ) : (
            <div className="col-span-3 py-12 text-center">
              <h3 className="text-xl font-semibold mb-2">No leads match your filters</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria</p>
              <Button 
                onClick={() => handleFilterChange({
                  search: '',
                  type: '',
                  location: '',
                  minPrice: 0,
                  maxPrice: 500,
                  minRating: 0,
                })}
                variant="outline"
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
        
        <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Confirm Lead Purchase</DialogTitle>
              <DialogDescription>
                You're about to purchase this lead. Once confirmed, you'll get full access to the contact information.
              </DialogDescription>
            </DialogHeader>
            
            {selectedLead && (
              <div className="py-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-lg">{selectedLead.type}</h3>
                    <p className="text-gray-500">{selectedLead.location}</p>
                  </div>
                  
                  <p className="text-gray-700">{selectedLead.description}</p>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Lead Price:</span>
                      <span className="font-semibold">{formatCurrency(selectedLead.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quality Rating:</span>
                      <span>{selectedLead.qualityRating} / 5</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>Cancel</Button>
              <Button onClick={confirmPurchase}>
                Purchase for {selectedLead ? formatCurrency(selectedLead.price) : '$0.00'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      
      <Footer />
    </div>
  );
};

export default Marketplace;
