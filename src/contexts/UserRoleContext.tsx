
import React, { createContext, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';

// Define the context type
export type UserRoleContextType = {
  user: User | null;
  isLoggedIn: boolean;
  session: Session | null;
  role: string | null;
  loadingUser: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (
    email: string, 
    password: string,
    role: 'seller' | 'buyer',
    fullName: string,
    company?: string,
    phone?: string,
    referralSource?: string
  ) => Promise<any>;
  logout: () => Promise<void>;
  refreshRole: () => Promise<void>;
  refreshUserRole: () => Promise<void>; // Alias for refreshRole for backward compatibility
};

// Create the context with a default value
export const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

/**
 * Hook for consuming the user role context
 */
export function useUserRole() {
  const context = useContext(UserRoleContext);
  
  if (context === undefined) {
    throw new Error("useUserRole must be used within a UserRoleProvider");
  }
  
  return context;
}
