
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LeadCard from '@/components/LeadCard';
import LeadUploader from '@/components/LeadUploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import { Lead } from '@/types/lead';
import { mockLeads } from '@/lib/mock-data';
import { generateId } from '@/lib/utils';
import { useUserRole } from '@/hooks/use-user-role';
import { useNavigate } from 'react-router-dom';

const MyLeads = () => {
  const navigate = useNavigate();
  const { isLoggedIn, role } = useUserRole();
  const [myLeads, setMyLeads] = useState<Lead[]>([]);
  const [activeTab, setActiveTab] = useState('active');
  
  useEffect(() => {
    if (!isLoggedIn || role !== 'seller') {
      toast.error("You must be logged in as a seller to view this page");
      navigate('/login');
      return;
    }
    
    // In a real app, we would fetch the seller's leads from an API
    const sellerLeads = mockLeads.filter(lead => lead.sellerId === 'seller-1');
    setMyLeads(sellerLeads);
  }, [isLoggedIn, role, navigate]);
  
  const handleLeadSubmit = (leadData: Omit<Lead, 'id'>) => {
    const newLead = {
      ...leadData,
      id: generateId()
    };
    
    setMyLeads([newLead, ...myLeads]);
    setActiveTab('active');
  };
  
  const getFilteredLeads = () => {
    switch (activeTab) {
      case 'active':
        return myLeads.filter(lead => lead.status === 'new' || lead.status === 'pending');
      case 'sold':
        return myLeads.filter(lead => lead.status === 'sold');
      case 'upload':
        return [];
      default:
        return myLeads;
    }
  };
  
  const handlePurchase = () => {
    // This is just a placeholder since sellers shouldn't purchase their own leads
    toast.error("You can't purchase your own leads");
  };
  
  const filteredLeads = getFilteredLeads();
  const activeLeadsCount = myLeads.filter(lead => lead.status === 'new' || lead.status === 'pending').length;
  const soldLeadsCount = myLeads.filter(lead => lead.status === 'sold').length;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">My Leads</h1>
          <p className="text-gray-600">
            Manage your leads and track their status
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="active" className="relative">
              Active Leads
              {activeLeadsCount > 0 && (
                <Badge className="ml-2 bg-brand-500">{activeLeadsCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sold" className="relative">
              Sold Leads
              {soldLeadsCount > 0 && (
                <Badge className="ml-2 bg-green-500">{soldLeadsCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="upload">Upload New Lead</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            {filteredLeads.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLeads.map(lead => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onPurchase={handlePurchase}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No Active Leads</h3>
                <p className="text-gray-600 mb-4">You don't have any active leads right now</p>
                <Button onClick={() => setActiveTab('upload')}>Upload New Lead</Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="sold">
            {filteredLeads.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLeads.map(lead => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onPurchase={handlePurchase}
                    isPurchased={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No Sold Leads</h3>
                <p className="text-gray-600 mb-4">You haven't sold any leads yet</p>
                <Button onClick={() => setActiveTab('upload')}>Upload New Lead</Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="upload">
            <LeadUploader onLeadSubmit={handleLeadSubmit} />
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default MyLeads;
