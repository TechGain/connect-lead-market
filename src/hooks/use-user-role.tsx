
import React, { createContext, useContext, useEffect, useState } from 'react';
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

  const [retryCount, setRetryCount] = useState(0);
  const [hasAttemptedRefresh, setHasAttemptedRefresh] = useState(false);

  // Add more detailed console logs to track role state
  useEffect(() => {
    console.log("UserRoleProvider role updated:", { 
      role, 
      isLoggedIn, 
      userId: user?.id,
      retryCount,
      hasAttemptedRefresh
    });

    // If logged in but no role after initial load, try to refresh once
    if (isLoggedIn && !role && !isLoading && retryCount < 3) {
      console.log("User logged in but no role detected. Attempt:", retryCount + 1);
      setRetryCount(prev => prev + 1);
      
      // If we've retried a few times and still no role, suggest a page refresh
      if (retryCount >= 2 && !hasAttemptedRefresh) {
        console.log("Multiple retries failed. Attempting page refresh...");
        setHasAttemptedRefresh(true);
        
        // Add a small delay before refreshing
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    }
  }, [role, isLoggedIn, user?.id, isLoading, retryCount, hasAttemptedRefresh]);

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
