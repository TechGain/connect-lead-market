import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { getUserRole, ensureUserProfile } from '@/utils/roleManager';

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
    role: authRole,
    login,
    register,
    logout,
    refreshRole
  } = useAuth();

  const [role, setRole] = useState<'seller' | 'buyer' | null>(authRole);
  const [isForceRefreshing, setIsForceRefreshing] = useState(false);

  // Direct database check for user role
  useEffect(() => {
    async function fetchAndUpdateRole() {
      if (user?.id) {
        console.log("UserRoleProvider - Directly fetching role from database:", user.id);
        
        try {
          const directRole = await getUserRole(user.id);
          console.log("Direct role check result:", directRole);
          
          if (directRole) {
            // Only update if role is different to avoid unnecessary rerenders
            if (role !== directRole) {
              console.log("Setting role from database check:", directRole);
              setRole(directRole);
            }
          } else {
            console.log("No role found in database, attempting to fix...");
            
            // Try to get role from user metadata
            const metadataRole = user.user_metadata?.role;
            const defaultRole = (metadataRole === 'seller' || metadataRole === 'buyer')
              ? metadataRole as 'seller' | 'buyer'
              : 'buyer'; // Default to buyer
            
            const fixedRole = await ensureUserProfile(
              user.id, 
              defaultRole,
              user.user_metadata?.full_name || user.email?.split('@')[0]
            );
            
            if (fixedRole) {
              console.log("Role fixed in database:", fixedRole);
              setRole(fixedRole);
            } else {
              console.error("Failed to fix role in database");
              // Keep using the auth role or default to null
              setRole(authRole);
            }
          }
        } catch (err) {
          console.error("Exception during direct database check:", err);
        }
      } else if (!user) {
        // If no user, reset the role
        setRole(null);
      }
    }
    
    // Wait until auth loading is done before checking role
    if (!isLoading && (user?.id || !user)) {
      fetchAndUpdateRole();
    }
  }, [user?.id, isLoading, authRole]);

  // Add more detailed console logs to track role state
  useEffect(() => {
    console.log("UserRoleProvider state update:", { 
      authRole,
      role,
      isLoggedIn, 
      userId: user?.id,
      isLoading,
      isForceRefreshing
    });
  }, [authRole, role, isLoggedIn, user?.id, isLoading, isForceRefreshing]);

  const refreshUserRole = async () => {
    console.log("Manual role refresh requested");
    setIsForceRefreshing(true);
    toast.info("Refreshing your profile...");
    
    try {
      // First try to refresh the auth role
      refreshRole();
      
      // Then directly check the database
      if (user?.id) {
        const directRole = await getUserRole(user.id);
        console.log("Direct role check on refresh:", directRole);
        
        if (directRole) {
          setRole(directRole);
        } else {
          console.warn("No role found during refresh");
          
          // Try to create/fix profile if no role found
          const metadataRole = user.user_metadata?.role;
          const defaultRole = (metadataRole === 'seller' || metadataRole === 'buyer')
            ? metadataRole as 'seller' | 'buyer'
            : 'buyer';
          
          const fixedRole = await ensureUserProfile(
            user.id,
            defaultRole,
            user.user_metadata?.full_name || user.email?.split('@')[0]
          );
          
          if (fixedRole) {
            setRole(fixedRole);
            toast.success(`Profile fixed with role: ${fixedRole}`);
          } else {
            toast.error("Could not fix your profile. Please try logging out and back in.");
          }
        }
      }
    } catch (err) {
      console.error("Error during role refresh:", err);
    } finally {
      setIsForceRefreshing(false);
    }
  };

  return (
    <UserRoleContext.Provider value={{ 
      isLoggedIn, 
      isLoading: isLoading || isForceRefreshing,
      // Use our directly managed role state instead of authRole
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
