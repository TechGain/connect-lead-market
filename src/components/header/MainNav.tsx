
import React from 'react';
import { Link } from 'react-router-dom';
import { NavigationMenu, NavigationMenuList } from "@/components/ui/navigation-menu";
import { NavItems } from './NavItems';

type MainNavProps = {
  isLoggedIn: boolean;
  role: string | null;
  isAdmin: boolean;
};

export const MainNav: React.FC<MainNavProps> = ({ isLoggedIn, role, isAdmin }) => {
  return (
    <div className="flex items-center gap-6 md:gap-10">
      <Link to="/" className="flex items-center space-x-2">
        <span className="font-bold text-xl bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
          StayConnect
        </span>
      </Link>
      
      <NavigationMenu className="hidden md:flex">
        <NavigationMenuList>
          <NavItems isLoggedIn={isLoggedIn} role={role} isAdmin={isAdmin} />
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};
