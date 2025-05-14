import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NavigationMenuItem, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { MessageSquare, Upload, ShoppingBag, FileText } from 'lucide-react';

type NavItemsProps = {
  isLoggedIn: boolean;
  role: string | null;
  isAdmin: boolean;
};

export const NavItems: React.FC<NavItemsProps> = ({ isLoggedIn, role, isAdmin }) => {
  const navigate = useNavigate();
  
  const handleUploadLeadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Navigate directly without changing URL structure
    navigate('/my-leads?tab=upload', { 
      replace: true,
      state: { preventTabChange: false } 
    });
  };
  
  return (
    <>
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
          <button 
            className={navigationMenuTriggerStyle()}
            onClick={handleUploadLeadClick}
            type="button"
          >
            <Upload className="mr-2 h-4 w-4 inline" />
            Upload Lead
          </button>
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
