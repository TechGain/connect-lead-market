
import React from 'react';
import { Link } from 'react-router-dom';
import { NavigationMenuItem, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { MessageSquare, Upload, ShoppingBag, FileText, BarChart3 } from 'lucide-react';

type NavItemsProps = {
  isLoggedIn: boolean;
  role: string | null;
  isAdmin: boolean;
};

export const NavItems: React.FC<NavItemsProps> = ({ isLoggedIn, role, isAdmin }) => {
  return (
    <>
      <NavigationMenuItem>
        <Link to="/" className={navigationMenuTriggerStyle()}>
          Home
        </Link>
      </NavigationMenuItem>
      
      {isLoggedIn && (
        <NavigationMenuItem>
          <Link to="/dashboard" className={navigationMenuTriggerStyle()}>
            <BarChart3 className="mr-2 h-4 w-4 inline" />
            Dashboard
          </Link>
        </NavigationMenuItem>
      )}
      
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
          <Link to="/my-leads?tab=upload" className={navigationMenuTriggerStyle()}>
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
      
      {isLoggedIn && isAdmin && (
        <NavigationMenuItem>
          <Link to="/admin/leads" className={navigationMenuTriggerStyle()}>
            <FileText className="mr-2 h-4 w-4 inline" />
            All Leads
          </Link>
        </NavigationMenuItem>
      )}
    </>
  );
};
