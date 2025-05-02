
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { UserRoleProvider, useUserRole } from "./hooks/use-user-role";
import { HelmetProvider } from 'react-helmet-async';

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 1000,
      staleTime: 30000
    }
  }
});

// Buyer Route Guard
const BuyerRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, role, isLoading } = useUserRole();
  
  useEffect(() => {
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

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <Router>
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
                    <BuyerRoute>
                      <Marketplace />
                    </BuyerRoute>
                  } 
                />
                <Route path="/my-leads" element={<MyLeads />} />
                <Route path="/purchases" element={<Purchases />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/about" element={<About />} />
                <Route path="/upload-leads" element={<UploadLeads />} />
                <Route path="/buyer-guide" element={<BuyerGuide />} />
                <Route path="/seller-guide" element={<SellerGuide />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </UserRoleProvider>
          </TooltipProvider>
        </Router>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

export default App;
