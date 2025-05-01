
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface UserRoleContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  role: 'seller' | 'buyer' | null;
  user: any;
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string, role: 'seller' | 'buyer', fullName: string, company?: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshUserRole: () => void;
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
    logout,
    refreshRole
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
      hasAttemptedRefresh,
      isLoading
    });

    // If logged in but no role after initial load, try to refresh the role
    if (isLoggedIn && !role && !isLoading && retryCount < 5 && !hasAttemptedRefresh) {
      console.log("User logged in but no role detected. Attempting to refresh role...");
      setRetryCount(prev => prev + 1);
      setHasAttemptedRefresh(true);
      
      // Add a small delay before trying to refresh the role
      setTimeout(() => {
        console.log("Executing delayed role refresh...");
        refreshRole();
      }, 1000);
    }
  }, [role, isLoggedIn, user?.id, isLoading, retryCount, hasAttemptedRefresh, refreshRole]);

  const refreshUserRole = () => {
    console.log("Manual role refresh requested");
    setHasAttemptedRefresh(false); // Reset the flag to allow further attempts
    setRetryCount(0); // Reset retry count
    toast.info("Refreshing your profile...");
    refreshRole();
  };

  return (
    <UserRoleContext.Provider value={{ 
      isLoggedIn, 
      isLoading,
      role,
      user,
      login,
      register,
      logout,
      refreshUserRole
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
