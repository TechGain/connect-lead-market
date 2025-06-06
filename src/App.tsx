
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { navItems } from "./nav-items";
import { UserRoleProvider } from './providers/UserRoleProvider';
import { ScrollToTop } from './components/ScrollToTop';
import GoogleAnalytics from './components/analytics/GoogleAnalytics';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <UserRoleProvider>
          <Toaster />
          <BrowserRouter>
            <ScrollToTop />
            <GoogleAnalytics />
            <Routes>
              {navItems.map(({ to, page }) => (
                <Route key={to} path={to} element={page} />
              ))}
            </Routes>
          </BrowserRouter>
        </UserRoleProvider>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
