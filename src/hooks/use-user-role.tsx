
import React, { createContext, useContext } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface UserRoleContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  role: 'seller' | 'buyer' | null;
  user: any;
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string, role: 'seller' | 'buyer', fullName: string, company?: string) => Promise<any>;
  logout: () => Promise<void>;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export const UserRoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    user,
    isLoggedIn, 
    isLoadingUser: isLoading, 
    role,
    login,
    register,
    logout
  } = useAuth();

  return (
    <UserRoleContext.Provider value={{ 
      isLoggedIn, 
      isLoading,
      role,
      user,
      login,
      register,
      logout
    }}>
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
