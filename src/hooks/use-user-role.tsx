
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserRoleContextType {
  role: 'seller' | 'buyer' | null;
  isLoggedIn: boolean;
  login: (role: 'seller' | 'buyer') => void;
  logout: () => void;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export const UserRoleProvider = ({ children }: { children: ReactNode }) => {
  // In a real app, we would check localStorage or a session cookie on initial load
  const [role, setRole] = useState<'seller' | 'buyer' | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = (selectedRole: 'seller' | 'buyer') => {
    setRole(selectedRole);
    setIsLoggedIn(true);
    // In a real app, we would store this in localStorage or a cookie
  };

  const logout = () => {
    setRole(null);
    setIsLoggedIn(false);
    // In a real app, we would clear localStorage or cookies
  };

  return (
    <UserRoleContext.Provider value={{ role, isLoggedIn, login, logout }}>
      {children}
    </UserRoleContext.Provider>
  );
};

export const useUserRole = () => {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error('useUserRole must be used within a UserRoleProvider');
  }
  return context;
};
