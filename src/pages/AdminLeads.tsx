
import React, { useEffect } from 'react';
import { Check, Trash2, Circle, CircleCheck, FileText, RefreshCcw } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminLeads, LeadStatusFilter } from '@/hooks/use-admin-leads';
import AdminLeadTable from '@/components/admin/AdminLeadTable';
import { Helmet } from 'react-helmet-async';

const AdminLeadsPage: React.FC = () => {
  const { leads, isLoading, error, statusFilter, setStatusFilter, refreshLeads } = useAdminLeads();
  
  // Force a refresh when the component mounts
  useEffect(() => {
    refreshLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleTabChange = (value: string) => {
    setStatusFilter(value as LeadStatusFilter);
  };

  // Handle lead deletion or refund by refreshing the leads list
  const handleLeadUpdated = () => {
    refreshLeads();
  };

  // Count leads by status
  const activeLeasCount = leads.filter(lead => lead.status === 'new' || lead.status === 'pending').length;
  const soldLeadsCount = leads.filter(lead => lead.status === 'sold').length;
  const erasedLeadsCount = leads.filter(lead => lead.status === 'erased').length;
  const refundedLeadsCount = leads.filter(lead => lead.status === 'refunded').length;
  
  // Log counts for debugging
  useEffect(() => {
    console.log('Current lead counts:', {
      total: leads.length,
      active: activeLeasCount,
      sold: soldLeadsCount,
      erased: erasedLeadsCount,
      refunded: refundedLeadsCount
    });
    
    // Log status distribution
    const statusCounts = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('Status distribution:', statusCounts);
  }, [leads, activeLeasCount, soldLeadsCount, erasedLeadsCount, refundedLeadsCount]);
  
  return (
    <PageLayout>
      <Helmet>
        <title>Admin Leads | StayConnect</title>
      </Helmet>
      
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-2">Admin Leads Dashboard</h1>
        <p className="text-gray-600 mb-6">
          View and manage all leads in the system
        </p>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading leads...</p>
          </div>
        ) : error ? (
          <div className="p-4 border border-red-300 bg-red-50 text-red-700 rounded-md">
            <p>Error loading leads: {error}</p>
            <button 
              onClick={refreshLeads} 
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <Tabs defaultValue={statusFilter} onValueChange={handleTabChange}>
              <TabsList className="grid grid-cols-5 w-full max-w-3xl">
                <TabsTrigger value="all">
                  <Circle className="mr-2 h-4 w-4" />
                  All ({leads.length})
                </TabsTrigger>
                <TabsTrigger value="active">
                  <CircleCheck className="mr-2 h-4 w-4" />
                  Active ({activeLeasCount})
                </TabsTrigger>
                <TabsTrigger value="sold">
                  <Check className="mr-2 h-4 w-4" />
                  Sold ({soldLeadsCount})
                </TabsTrigger>
                <TabsTrigger value="refunded">
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Refunded ({refundedLeadsCount})
                </TabsTrigger>
                <TabsTrigger value="erased">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Erased ({erasedLeadsCount})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <h2 className="text-xl font-semibold mb-4">All Leads ({leads.length})</h2>
                <AdminLeadTable 
                  leads={leads} 
                  onLeadDeleted={handleLeadUpdated}
                  onLeadRefunded={handleLeadUpdated} 
                />
              </TabsContent>
              
              <TabsContent value="active" className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Active Leads ({activeLeasCount})</h2>
                <AdminLeadTable 
                  leads={leads.filter(lead => 
                    lead.status === 'new' || lead.status === 'pending'
                  )} 
                  onLeadDeleted={handleLeadUpdated}
                  onLeadRefunded={handleLeadUpdated}
                />
              </TabsContent>
              
              <TabsContent value="sold" className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Sold Leads ({soldLeadsCount})</h2>
                <AdminLeadTable 
                  leads={leads.filter(lead => lead.status === 'sold')} 
                  onLeadDeleted={handleLeadUpdated}
                  onLeadRefunded={handleLeadUpdated}
                />
              </TabsContent>
              
              <TabsContent value="refunded" className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Refunded Leads ({refundedLeadsCount})</h2>
                <AdminLeadTable 
                  leads={leads.filter(lead => lead.status === 'refunded')} 
                  onLeadDeleted={handleLeadUpdated}
                  onLeadRefunded={handleLeadUpdated}
                />
              </TabsContent>
              
              <TabsContent value="erased" className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Erased Leads ({erasedLeadsCount})</h2>
                <AdminLeadTable 
                  leads={leads.filter(lead => lead.status === 'erased')} 
                  onLeadDeleted={handleLeadUpdated}
                  onLeadRefunded={handleLeadUpdated}
                />
              </TabsContent>
            </Tabs>
            
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-sm text-gray-600">
              <p className="font-medium">Leads Status Guide:</p>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li><span className="font-semibold">Active:</span> New or pending leads that are available for purchase</li>
                <li><span className="font-semibold">Sold:</span> Leads that have been purchased by buyers</li>
                <li><span className="font-semibold">Refunded:</span> Leads that were sold but have been refunded</li>
                <li><span className="font-semibold">Erased:</span> Leads that have been deleted by sellers or admins</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default AdminLeadsPage;
