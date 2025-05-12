
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useUserRole } from '@/hooks/use-user-role';
import { MainNav } from './header/MainNav';
import { UserDropdown } from './header/UserDropdown';
import { MobileMenu } from './header/MobileMenu';
import { AuthButtons } from './header/AuthButtons';

const Header = () => {
  const navigate = useNavigate();
  const {
    role,
    isLoggedIn,
    logout,
    user,
    isLoading,
    refreshUserRole,
    isAdmin
  } = useUserRole();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Enhance logging for debugging
  useEffect(() => {
    console.log("Header component - Current auth state:", { 
      isLoggedIn, 
      role, 
      userId: user?.id,
      isLoading,
      isAdmin
    });
  }, [isLoggedIn, role, user, isLoading, isAdmin]);

  // Add effect to refresh role if logged in but no role detected
  useEffect(() => {
    if (isLoggedIn && !role && !isLoading) {
      console.log("Header detected logged in state but no role, refreshing...");
      refreshUserRole();
    }
  }, [isLoggedIn, role, isLoading, refreshUserRole]);

  const handleLogout = () => {
    console.log("User logging out. Role:", role, "isAdmin:", isAdmin);
    
    // Clean up localStorage first
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('auth') || key.includes('sb-')) {
        console.log("Clearing:", key);
        localStorage.removeItem(key);
      }
    });
    
    // Then call the logout function
    logout();
    // We don't need to navigate as the logout function already handles the redirect
  };

  const handleMarketplaceClick = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    
    if (role !== 'buyer' && !isAdmin) {
      toast.info("Only buyers can access the marketplace");
      return;
    }
    
    navigate('/marketplace');
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <MainNav
          isLoggedIn={isLoggedIn}
          role={role}
          isAdmin={isAdmin}
        />
        
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <div className="hidden md:flex">
                <UserDropdown
                  role={role}
                  isAdmin={isAdmin}
                  handleLogout={handleLogout}
                />
              </div>
              <MobileMenu 
                isLoggedIn={isLoggedIn}
                role={role}
                isAdmin={isAdmin}
                handleLogout={handleLogout}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
              />
            </>
          ) : (
            <div className="flex items-center gap-4">
              <AuthButtons />
              <MobileMenu 
                isLoggedIn={isLoggedIn}
                role={role}
                isAdmin={isAdmin}
                handleLogout={handleLogout}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
