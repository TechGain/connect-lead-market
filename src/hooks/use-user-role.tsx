
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { getUserRole, updateUserRole } from '@/utils/roleManager';
import { supabase } from '@/integrations/supabase/client';

interface UserRoleContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  role: 'seller' | 'buyer' | null;
  user: any;
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string, role: 'seller' | 'buyer', fullName: string, company?: string) => Promise<any>;
  logout: () => Promise<boolean>;
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

  // Direct database check for user role - this is the primary source of truth
  useEffect(() => {
    async function fetchAndUpdateRole() {
      if (user?.id) {
        console.log("UserRoleProvider - Directly fetching role from database:", user.id);
        
        try {
          // DIRECT DATABASE QUERY - Get role directly
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();
            
          if (error) {
            console.error("Error directly fetching role:", error);
            console.error("Error details:", error.message, error.code, error.details);
            return;
          }
          
          console.log("Direct role check result:", data?.role);
          
          if (data?.role) {
            // Normalize the role value
            const dbRole = String(data.role).toLowerCase();
            
            if (dbRole === 'seller' || dbRole === 'buyer') {
              // Only update if role is different to avoid unnecessary rerenders
              if (role !== dbRole) {
                console.log("Setting role from database check:", dbRole);
                setRole(dbRole as 'seller' | 'buyer');
                
                // Store in localStorage as backup
                try {
                  localStorage.setItem('user_role', dbRole);
                } catch (err) {
                  console.warn("Could not store role in localStorage", err);
                }
              }
            }
          } else if (authRole) {
            // If no role in database but we have one from auth, update the database
            console.log("No role in database but auth has role:", authRole);
            const success = await updateUserRole(user.id, authRole);
            if (success) {
              setRole(authRole);
              
              // Store in localStorage as backup
              try {
                localStorage.setItem('user_role', authRole);
              } catch (err) {
                console.warn("Could not store role in localStorage", err);
              }
            }
          } else {
            // Try to use cached role from localStorage as last resort
            try {
              const cachedRole = localStorage.getItem('user_role');
              if (cachedRole === 'seller' || cachedRole === 'buyer') {
                console.log("Using cached role from localStorage:", cachedRole);
                setRole(cachedRole as 'seller' | 'buyer');
                
                // Try to update database with cached role
                const success = await updateUserRole(user.id, cachedRole as 'seller' | 'buyer');
                if (!success) {
                  console.warn("Could not update database with cached role");
                }
              }
            } catch (err) {
              console.warn("Could not retrieve cached role", err);
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
    if (!isLoading) {
      fetchAndUpdateRole();
    }
  }, [user?.id, isLoading, authRole, role]);

  const refreshUserRole = async () => {
    console.log("Manual role refresh requested");
    setIsForceRefreshing(true);
    toast.info("Refreshing your profile...");
    
    try {
      // First refresh the auth role
      refreshRole();
      
      // Then directly check the database
      if (user?.id) {
        // DIRECT DATABASE QUERY - Get role directly
        const { data, error } = await supabase
          .from('profiles')
          .select('role, full_name, company, rating')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error("Error fetching role during refresh:", error);
          toast.error("Error refreshing your role");
          return;
        }
        
        if (data?.role) {
          const dbRole = String(data.role).toLowerCase();
          console.log("Database role during refresh:", dbRole);
          
          if (dbRole === 'seller' || dbRole === 'buyer') {
            setRole(dbRole as 'seller' | 'buyer');
            
            // Update localStorage
            try {
              localStorage.setItem('user_role', dbRole);
            } catch (err) {
              console.warn("Could not store role in localStorage", err);
            }
            
            toast.success(`Your profile has been refreshed: ${dbRole}`);
          } else {
            toast.warning(`Invalid role found: ${dbRole}`);
          }
        } else if (authRole) {
          // If no role in database but we have one from auth, update the database
          console.log("No role in database but auth has role during refresh:", authRole);
          const success = await updateUserRole(user.id, authRole);
          if (success) {
            setRole(authRole);
            
            // Update localStorage
            try {
              localStorage.setItem('user_role', authRole);
            } catch (err) {
              console.warn("Could not store role in localStorage", err);
            }
            
            toast.success(`Your profile has been updated with role: ${authRole}`);
          } else {
            toast.error("Failed to update your role");
          }
        } else {
          toast.warning("No role found in your profile");
        }
      }
    } catch (err) {
      console.error("Error during role refresh:", err);
      toast.error("An error occurred while refreshing your role");
    } finally {
      setIsForceRefreshing(false);
    }
  };

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

  // Wrapper for logout to ensure proper state reset
  const handleLogout = async (): Promise<boolean> => {
    console.log("UserRoleProvider: handling logout");
    
    // Clear role state before calling the auth logout
    setRole(null);
    
    const success = await logout();
    
    // Double-check that state is cleared
    if (success) {
      setRole(null);
    }
    
    return success;
  };

  const value = {
    isLoggedIn, 
    isLoading: isLoading || isForceRefreshing,
    role,
    user,
    login,
    register,
    logout: handleLogout, // Use our wrapped version
    refreshUserRole
  };

  return (
    <UserRoleContext.Provider value={value}>
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
