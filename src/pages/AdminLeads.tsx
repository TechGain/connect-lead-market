
import React, { useState } from 'react';
import { Check, Trash2, Circle, CircleCheck, CircleX, CircleSlash, FileText } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminLeads, LeadStatusFilter } from '@/hooks/use-admin-leads';
import AdminLeadTable from '@/components/admin/AdminLeadTable';
import { Helmet } from 'react-helmet-async';

const AdminLeadsPage: React.FC = () => {
  const { leads, isLoading, error, statusFilter, setStatusFilter } = useAdminLeads();
  
  const handleTabChange = (value: string) => {
    setStatusFilter(value as LeadStatusFilter);
  };
  
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
          </div>
        ) : (
          <div className="space-y-6">
            <Tabs defaultValue={statusFilter} onValueChange={handleTabChange}>
              <TabsList className="grid grid-cols-4 w-full max-w-md">
                <TabsTrigger value="all">
                  <Circle className="mr-2 h-4 w-4" />
                  All
                </TabsTrigger>
                <TabsTrigger value="active">
                  <CircleCheck className="mr-2 h-4 w-4" />
                  Active
                </TabsTrigger>
                <TabsTrigger value="sold">
                  <Check className="mr-2 h-4 w-4" />
                  Sold
                </TabsTrigger>
                <TabsTrigger value="erased">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Erased
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <h2 className="text-xl font-semibold mb-4">All Leads</h2>
                <AdminLeadTable leads={leads} />
              </TabsContent>
              
              <TabsContent value="active" className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Active Leads</h2>
                <AdminLeadTable leads={leads} />
              </TabsContent>
              
              <TabsContent value="sold" className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Sold Leads</h2>
                <AdminLeadTable leads={leads} />
              </TabsContent>
              
              <TabsContent value="erased" className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Erased Leads</h2>
                <AdminLeadTable leads={leads} />
              </TabsContent>
            </Tabs>
            
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-sm text-gray-600">
              <p className="font-medium">Leads Status Guide:</p>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li><span className="font-semibold">Active:</span> New or pending leads that are available for purchase</li>
                <li><span className="font-semibold">Sold:</span> Leads that have been purchased by buyers</li>
                <li><span className="font-semibold">Erased:</span> Leads that have been deleted by sellers</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default AdminLeadsPage;
