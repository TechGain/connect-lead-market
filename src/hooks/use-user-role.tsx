
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  const [isForceRefreshing, setIsForceRefreshing] = useState(false);

  // Add direct database check for debugging purposes
  useEffect(() => {
    async function checkProfileInDatabase() {
      if (user?.id && !role && !isLoading && !hasAttemptedRefresh) {
        console.log("UserRoleProvider - Direct database check for user:", user.id);
        
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, role, full_name')
            .eq('id', user.id)
            .maybeSingle();
            
          if (error) {
            console.error("Direct database check error:", error);
          } else {
            console.log("Direct database check result:", data);
            if (!data) {
              console.warn("No profile found in direct database check");
            }
          }
        } catch (err) {
          console.error("Exception during direct database check:", err);
        }
      }
    }
    
    checkProfileInDatabase();
  }, [user?.id, role, isLoading, hasAttemptedRefresh]);

  // Add more detailed console logs to track role state
  useEffect(() => {
    console.log("UserRoleProvider state update:", { 
      role, 
      isLoggedIn, 
      userId: user?.id,
      retryCount,
      hasAttemptedRefresh,
      isLoading,
      isForceRefreshing
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
      }, 2000); // Increased delay to ensure DB propagation
    }
  }, [role, isLoggedIn, user?.id, isLoading, retryCount, hasAttemptedRefresh, refreshRole]);

  const refreshUserRole = () => {
    console.log("Manual role refresh requested");
    setIsForceRefreshing(true);
    setHasAttemptedRefresh(false); // Reset the flag to allow further attempts
    setRetryCount(0); // Reset retry count
    toast.info("Refreshing your profile...");
    
    // Force delay to ensure any ongoing processes complete
    setTimeout(() => {
      refreshRole();
      setIsForceRefreshing(false);
    }, 1000);
  };

  return (
    <UserRoleContext.Provider value={{ 
      isLoggedIn, 
      isLoading: isLoading || isForceRefreshing,
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
