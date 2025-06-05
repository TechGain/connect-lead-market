
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { UserRoleProvider, useUserRole } from "./hooks/use-user-role";
import { HelmetProvider } from 'react-helmet-async';
import { ChatWidget } from "./components/chat/ChatWidget";
import { ScrollToTop } from "./components/ScrollToTop";
import GoogleAnalytics from "./components/analytics/GoogleAnalytics";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Marketplace from "./pages/Marketplace";
import MyLeads from "./pages/MyLeads";
import Purchases from "./pages/Purchases";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import UploadLeads from "./pages/UploadLeads";
import BuyerGuide from "./pages/BuyerGuide";
import SellerGuide from "./pages/SellerGuide";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import AdminChatDashboardPage from "./pages/AdminChatDashboard";
import AdminLeadsPage from "./pages/AdminLeads";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 1000,
      staleTime: 30000
    }
  }
});

// Buyer or Admin Route Guard - allows both buyers and admins
const BuyerOrAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, role, isLoading, isAdmin } = useUserRole();
  
  React.useEffect(() => {
    console.log("BuyerOrAdminRoute - Current state:", { isLoggedIn, role, isAdmin, isLoading });
  }, [isLoggedIn, role, isAdmin, isLoading]);
  
  // Show loading state while determining role
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">
      <p>Loading...</p>
    </div>;
  }
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  if (role !== 'buyer' && !isAdmin) {
    console.log("Access denied: User role is", role);
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Seller or Admin Route Guard
const SellerOrAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, role, isLoading, isAdmin } = useUserRole();
  
  // Show loading state while determining role
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">
      <p>Loading...</p>
    </div>;
  }
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  if (role !== 'seller' && !isAdmin) {
    console.log("Access denied: User role is", role);
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Buyer Route Guard
const BuyerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, role, isLoading } = useUserRole();
  
  React.useEffect(() => {
    console.log("BuyerRoute - Current state:", { isLoggedIn, role, isLoading });
  }, [isLoggedIn, role, isLoading]);
  
  // Show loading state while determining role
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">
      <p>Loading...</p>
    </div>;
  }
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  if (role !== 'buyer') {
    console.log("Access denied: User role is", role);
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Admin Route Guard
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, role, isLoading } = useUserRole();
  
  // Show loading state while determining role
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">
      <p>Loading...</p>
    </div>;
  }
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  if (role !== 'admin') {
    console.log("Access denied: User role is", role);
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <Router>
          <ScrollToTop />
          <GoogleAnalytics />
          <TooltipProvider>
            <UserRoleProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route 
                  path="/marketplace" 
                  element={
                    <BuyerOrAdminRoute>
                      <Marketplace />
                    </BuyerOrAdminRoute>
                  } 
                />
                <Route 
                  path="/my-leads" 
                  element={
                    <SellerOrAdminRoute>
                      <MyLeads />
                    </SellerOrAdminRoute>
                  } 
                />
                <Route 
                  path="/upload-leads" 
                  element={
                    <SellerOrAdminRoute>
                      <UploadLeads />
                    </SellerOrAdminRoute>
                  } 
                />
                <Route path="/purchases" element={<Purchases />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/about" element={<About />} />
                <Route path="/buyer-guide" element={<BuyerGuide />} />
                <Route path="/seller-guide" element={<SellerGuide />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route 
                  path="/admin/chats" 
                  element={
                    <AdminRoute>
                      <AdminChatDashboardPage />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/admin/leads" 
                  element={
                    <AdminRoute>
                      <AdminLeadsPage />
                    </AdminRoute>
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
              
              <ChatWidget />
            </UserRoleProvider>
          </TooltipProvider>
        </Router>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

export default App;
