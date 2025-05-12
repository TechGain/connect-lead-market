import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, User, MessageSquare, Upload, ShoppingBag, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserRole } from '@/hooks/use-user-role';
import { toast } from 'sonner';

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

  // In the renderNavItems function:
  const renderNavItems = () => <>
      <NavigationMenuItem>
        <Link to="/" className={navigationMenuTriggerStyle()}>
          Home
        </Link>
      </NavigationMenuItem>
      {isLoggedIn && (role === 'buyer' || isAdmin) && (
        <NavigationMenuItem>
          <Link to="/marketplace" className={navigationMenuTriggerStyle()}>
            <ShoppingBag className="mr-2 h-4 w-4 inline" />
            Marketplace
          </Link>
        </NavigationMenuItem>
      )}
      {isLoggedIn && (role === 'seller' || isAdmin) && (
        <NavigationMenuItem>
          <Link to="/my-leads" className={navigationMenuTriggerStyle()}>
            My Leads
          </Link>
        </NavigationMenuItem>
      )}
      {isLoggedIn && (role === 'seller' || isAdmin) && (
        <NavigationMenuItem>
          <Link to="/upload-leads" className={navigationMenuTriggerStyle()}>
            <Upload className="mr-2 h-4 w-4 inline" />
            Upload Lead
          </Link>
        </NavigationMenuItem>
      )}
      {isLoggedIn && role === 'buyer' && (
        <NavigationMenuItem>
          <Link to="/purchases" className={navigationMenuTriggerStyle()}>
            My Purchases
          </Link>
        </NavigationMenuItem>
      )}
      {isLoggedIn && isAdmin && (
        <NavigationMenuItem>
          <Link to="/admin/chats" className={navigationMenuTriggerStyle()}>
            <MessageSquare className="mr-2 h-4 w-4 inline" />
            Admin Dashboard
          </Link>
        </NavigationMenuItem>
      )}
    </>;

  // Make sure the mobile nav has the same role-based conditions:
  const renderMobileNavItems = () => <>
      <SheetClose asChild>
        <Link to="/" className="flex items-center py-2 px-3 rounded-md hover:bg-gray-100">
          Home
        </Link>
      </SheetClose>
      {isLoggedIn && (role === 'buyer' || isAdmin) && (
        <SheetClose asChild>
          <Link to="/marketplace" className="flex items-center py-2 px-3 rounded-md hover:bg-gray-100">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Marketplace
          </Link>
        </SheetClose>
      )}
      {isLoggedIn && (role === 'seller' || isAdmin) && (
        <SheetClose asChild>
          <Link to="/my-leads" className="flex items-center py-2 px-3 rounded-md hover:bg-gray-100">
            My Leads
          </Link>
        </SheetClose>
      )}
      {isLoggedIn && (role === 'seller' || isAdmin) && (
        <SheetClose asChild>
          <Link to="/upload-leads" className="flex items-center py-2 px-3 rounded-md hover:bg-gray-100">
            <Upload className="mr-2 h-4 w-4" />
            Upload Lead
          </Link>
        </SheetClose>
      )}
      {isLoggedIn && role === 'buyer' && (
        <SheetClose asChild>
          <Link to="/purchases" className="flex items-center py-2 px-3 rounded-md hover:bg-gray-100">
            My Purchases
          </Link>
        </SheetClose>
      )}
      {isLoggedIn && isAdmin && (
        <SheetClose asChild>
          <Link to="/admin/chats" className="flex items-center py-2 px-3 rounded-md hover:bg-gray-100">
            <MessageSquare className="mr-2 h-4 w-4" />
            Admin Dashboard
          </Link>
        </SheetClose>
      )}
      {isLoggedIn && isAdmin && (
        <SheetClose asChild>
          <Link to="/admin/leads" className="flex items-center py-2 px-3 rounded-md hover:bg-gray-100">
            <FileText className="mr-2 h-4 w-4" />
            All Leads
          </Link>
        </SheetClose>
      )}
      {isLoggedIn && (
        <SheetClose asChild>
          <Link to="/dashboard" className="flex items-center py-2 px-3 rounded-md hover:bg-gray-100">
            Dashboard
          </Link>
        </SheetClose>
      )}
      {isLoggedIn && (
        <SheetClose asChild>
          <Link to="/profile" className="flex items-center py-2 px-3 rounded-md hover:bg-gray-100">
            Profile
          </Link>
        </SheetClose>
      )}
      {isLoggedIn && (
        <div className="border-t border-gray-200 mt-2 pt-2">
          <SheetClose asChild>
            <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
              Logout
            </Button>
          </SheetClose>
        </div>
      )}
    </>;

  return <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">StayConnect
            </span>
          </Link>
          
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {renderNavItems()}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <div className="hidden md:flex">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={isAdmin ? "bg-purple-100 text-purple-800" : "bg-brand-100 text-brand-800"}>
                          {isAdmin ? 'A' : role === 'seller' ? 'S' : 'B'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">My Account</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {role || 'User'} Account
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/profile')}>
                      Profile
                    </DropdownMenuItem>
                    {role === 'seller' && (
                      <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/my-leads')}>
                        My Leads
                      </DropdownMenuItem>
                    )}
                    {role === 'buyer' && (
                      <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/purchases')}>
                        My Purchases
                      </DropdownMenuItem>
                    )}
                    {isAdmin && (
                      <>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/admin/chats')}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Chat Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/admin/leads')}>
                          <FileText className="mr-2 h-4 w-4" />
                          All Leads
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="flex flex-col gap-4 pt-10">
                  <div className="flex flex-col gap-3">
                    {renderMobileNavItems()}
                  </div>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" className="hidden md:flex">
                  Log In
                </Button>
              </Link>
              <Link to="/register">
                <Button className={cn("hidden md:flex", "bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600")}>
                  Register
                </Button>
              </Link>
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="flex flex-col gap-4 pt-10">
                  <div className="flex flex-col gap-3">
                    <SheetClose asChild>
                      <Link to="/" className="flex items-center py-2 px-3 rounded-md hover:bg-gray-100">
                        Home
                      </Link>
                    </SheetClose>
                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <SheetClose asChild>
                        <Link to="/login" className="flex items-center py-2 px-3 rounded-md hover:bg-gray-100">
                          Log In
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link to="/register" className="flex items-center py-2 px-3 rounded-md hover:bg-gray-100">
                          Register
                        </Link>
                      </SheetClose>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
      </div>
    </header>;
};

export default Header;
