
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUserRole } from '@/hooks/use-user-role';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useSellerLeads } from '@/hooks/use-seller-leads';
import LoadingState from '@/components/my-leads/LoadingState';
import RoleErrorState from '@/components/my-leads/RoleErrorState';
import LeadsListTab from '@/components/my-leads/LeadsListTab';
import UploadLeadTab from '@/components/my-leads/UploadLeadTab';

const MyLeads = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoggedIn, role, isAdmin, isLoading, user } = useUserRole();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'leads');
  
  const { leads } = useSellerLeads(user?.id);
  
  console.log("MyLeads component - Current auth state:", { 
    isLoggedIn, 
    role,
    isAdmin,
    isLoading,
    userId: user?.id,
    activeTab
  });
  
  useEffect(() => {
    // Set active tab based on URL parameter
    const tabParam = searchParams.get('tab');
    if (tabParam && (tabParam === 'leads' || tabParam === 'upload')) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);
  
  const handleTabChange = (value: string) => {
    console.log("Tab changed to:", value);
    setActiveTab(value);
    
    // Update URL without causing a full page reload
    const newUrl = `/my-leads?tab=${value}`;
    navigate(newUrl, { replace: true });
  };
  
  // Show loading state while auth is being determined
  if (isLoading) {
    console.log("MyLeads: Auth is loading, showing loading state");
    return <LoadingState onRefresh={() => window.location.reload()} />;
  }
  
  // Check if user is logged in
  if (!isLoggedIn) {
    console.log("MyLeads: User is not logged in, redirecting to login");
    toast.error("Please log in to view your leads");
    navigate('/login');
    return null;
  }
  
  // Check if user has a valid role
  if (!role) {
    console.log("MyLeads: User role is null, showing error state");
    return <RoleErrorState onRefresh={() => window.location.reload()} />;
  }
  
  // Check if user is authorized (seller, buyer, or admin)
  if (role !== 'seller' && role !== 'buyer' && !isAdmin) {
    console.log("MyLeads: User is not authorized, redirecting to home", { actualRole: role });
    toast.error(`Only sellers, buyers and admins can view this page. Your current role is: ${role}`);
    navigate('/');
    return null;
  }
  
  console.log("MyLeads: Rendering main content");
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="container mx-auto px-4 pt-8">
          <TabsList>
            {(role === 'seller' || isAdmin) && (
              <TabsTrigger value="leads">My Leads</TabsTrigger>
            )}
            {(role === 'seller' || isAdmin) && (
              <TabsTrigger value="upload">Upload Lead</TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="leads">
            <LeadsListTab leads={leads} role={role} isAdmin={isAdmin} />
          </TabsContent>
          <TabsContent value="upload">
            <UploadLeadTab />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default MyLeads;
