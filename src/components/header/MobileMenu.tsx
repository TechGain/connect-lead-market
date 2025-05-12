
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from 'lucide-react';
import { MobileNavItems } from './MobileNavItems';

type MobileMenuProps = {
  isLoggedIn: boolean;
  role: string | null;
  isAdmin: boolean;
  handleLogout: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
};

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isLoggedIn,
  role,
  isAdmin,
  handleLogout,
  isMobileMenuOpen,
  setIsMobileMenuOpen
}) => {
  return (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col gap-4 pt-10">
        <div className="flex flex-col gap-3">
          {isLoggedIn ? (
            <MobileNavItems 
              isLoggedIn={isLoggedIn}
              role={role}
              isAdmin={isAdmin}
              handleLogout={handleLogout}
            />
          ) : (
            <>
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
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
