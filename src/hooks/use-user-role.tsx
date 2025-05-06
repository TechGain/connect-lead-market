import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { getUserRole, updateUserRole } from '@/utils/roleManager';
import { supabase } from '@/integrations/supabase/client';

interface UserRoleContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  role: 'seller' | 'buyer' | 'admin' | null;
  user: any;
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string, role: 'seller' | 'buyer', fullName: string, company?: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshUserRole: () => void;
  isAdmin: boolean;
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

  const [role, setRole] = useState<'seller' | 'buyer' | 'admin' | null>(authRole);
  const [isForceRefreshing, setIsForceRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Keep the role in sync with auth role
  useEffect(() => {
    if (authRole !== role) {
      console.log("UserRoleProvider - Auth role changed:", authRole);
      setRole(authRole);
      
      // Update admin state based on role
      setIsAdmin(authRole === 'admin');
    }
  }, [authRole, role]);

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
            return;
          }
          
          console.log("Direct role check result:", data?.role);
          
          if (data?.role) {
            // Normalize the role value
            const dbRole = String(data.role).toLowerCase();
            
            // Now also check for admin role
            if (dbRole === 'seller' || dbRole === 'buyer' || dbRole === 'admin') {
              // Only update if role is different to avoid unnecessary rerenders
              if (role !== dbRole) {
                console.log("Setting role from database check:", dbRole);
                setRole(dbRole as 'seller' | 'buyer' | 'admin');
                
                // Update admin state
                setIsAdmin(dbRole === 'admin');
              }
            }
          } else if (authRole && authRole !== 'admin') {
            // If no role in database but we have one from auth, update the database
            // NEVER update to admin role via code
            console.log("No role in database but auth has role:", authRole);
            if (authRole === 'seller' || authRole === 'buyer') {
              const success = await updateUserRole(user.id, authRole);
              if (success) {
                setRole(authRole);
              }
            }
          }
        } catch (err) {
          console.error("Exception during direct database check:", err);
        }
      } else if (!user) {
        // If no user, reset the role and admin status
        setRole(null);
        setIsAdmin(false);
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
          
          // Check for all valid roles including admin
          if (dbRole === 'seller' || dbRole === 'buyer' || dbRole === 'admin') {
            setRole(dbRole as 'seller' | 'buyer' | 'admin');
            setIsAdmin(dbRole === 'admin');
            toast.success(`Your profile has been refreshed: ${dbRole}`);
          } else {
            toast.warning(`Invalid role found: ${dbRole}`);
          }
        } else if (authRole && authRole !== 'admin') {
          // If no role in database but we have one from auth, update the database
          // But NEVER automatically set to admin
          console.log("No role in database but auth has role during refresh:", authRole);
          if (authRole === 'seller' || authRole === 'buyer') {
            const success = await updateUserRole(user.id, authRole);
            if (success) {
              setRole(authRole);
              setIsAdmin(false); // Ensure admin status is correct
              toast.success(`Your profile has been updated with role: ${authRole}`);
            } else {
              toast.error("Failed to update your role");
            }
          }
        } else {
          toast.warning("No valid role found in your profile");
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
      isAdmin,
      isLoggedIn, 
      userId: user?.id,
      isLoading,
      isForceRefreshing
    });
  }, [authRole, role, isAdmin, isLoggedIn, user?.id, isLoading, isForceRefreshing]);

  const value = {
    isLoggedIn, 
    isLoading: isLoading || isForceRefreshing,
    role,
    user,
    login,
    register,
    logout,
    refreshUserRole,
    isAdmin
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
