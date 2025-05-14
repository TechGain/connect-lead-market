
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MessageSquare, Upload, ShoppingBag, FileText } from 'lucide-react';

type MobileNavItemsProps = {
  isLoggedIn: boolean;
  role: string | null;
  isAdmin: boolean;
  handleLogout: () => void;
};

export const MobileNavItems: React.FC<MobileNavItemsProps> = ({ 
  isLoggedIn, 
  role, 
  isAdmin, 
  handleLogout 
}) => {
  const navigate = useNavigate();
  
  const handleUploadLeadClick = () => {
    // We need to setTimeout to allow the sheet to close first
    setTimeout(() => {
      navigate('/my-leads?tab=upload', { 
        replace: true,
        state: { preventRefresh: true } 
      });
    }, 10);
  };
  
  return (
    <>
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
          <Button 
            variant="ghost" 
            className="w-full justify-start p-0 m-0 h-auto font-normal"
            onClick={handleUploadLeadClick}
          >
            <span className="flex items-center py-2 px-3 rounded-md hover:bg-gray-100 w-full">
              <Upload className="mr-2 h-4 w-4" />
              Upload Lead
            </span>
          </Button>
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
    </>
  );
};
