
import React, { useState, useEffect, useContext, createContext } from 'react';
import { useAuthActions } from './useAuthActions';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

// Define the context type
type UserRoleContextType = {
  user: User | null;
  isLoggedIn: boolean;
  session: Session | null;
  role: string | null;
  loadingUser: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>; // Add login method
  register: (
    email: string, 
    password: string,
    role: 'seller' | 'buyer',
    fullName: string,
    company?: string,
    phone?: string
  ) => Promise<any>;
  logout: () => Promise<void>;
  refreshRole: () => Promise<void>;
  refreshUserRole: () => Promise<void>; // Alias for refreshRole for backward compatibility
};

// Create the context with a default value
const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

/**
 * Provider component that wraps the app and makes auth object available to any
 * child component that calls useUserRole().
 */
export function UserRoleProvider({ children }: { children: React.ReactNode }) {
  const userRole = useProvideUserRole();
  
  return (
    <UserRoleContext.Provider value={userRole}>
      {children}
    </UserRoleContext.Provider>
  );
}

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

/**
 * Hook for managing user authentication state and role
 */
function useProvideUserRole() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const supabaseClient = supabase;
  const authActions = useAuthActions();

  // Compute isAdmin based on role
  const isAdmin = role === 'admin';

  // Alias isLoading to loadingUser for consistency with other hooks
  const isLoading = loadingUser;

  useEffect(() => {
    const getSession = async () => {
      try {
        setLoadingUser(true);
        const { data: { session } } = await supabaseClient.auth.getSession();

        setSession(session);
        setUser(session?.user || null);
        setIsLoggedIn(!!session?.user);

        if (session?.user) {
          // Fetch the user's role from the profiles table
          const { data: profile, error } = await supabaseClient
            .from('profiles')
            .select('role, phone')
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.error("Error fetching user role:", error);
            setRole(null); // Set role to null in case of an error
          } else {
            setRole(profile?.role || null);
          }
        } else {
          setRole(null); // No user, so no role
        }
      } catch (error) {
        console.error("Error in getSession:", error);
        setIsLoggedIn(false);
        setUser(null);
        setRole(null);
      } finally {
        setLoadingUser(false);
      }
    };

    getSession();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      setIsLoggedIn(!!session?.user);
      
      if (session?.user) {
        // Fetch the user's role from the profiles table
        supabaseClient
          .from('profiles')
          .select('role, phone')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile, error }) => {
            if (error) {
              console.error("Error fetching user role:", error);
              setRole(null);
            } else {
              setRole(profile?.role || null);
            }
          });
      } else {
        setRole(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabaseClient]);

  const refreshRole = async () => {
    if (user?.id) {
      try {
        const { data: profile, error } = await supabaseClient
          .from('profiles')
          .select('role, phone')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("Error refreshing user role:", error);
          setRole(null);
        } else {
          setRole(profile?.role || null);
        }
      } catch (error) {
        console.error("Error refreshing role:", error);
        setRole(null);
      }
    } else {
      setRole(null);
    }
  };

  // Create an alias for refreshRole for backward compatibility
  const refreshUserRole = refreshRole;

  // Add login method using authActions
  const login = async (email: string, password: string) => {
    try {
      setLoadingUser(true);
      const result = await authActions.login(email, password);
      
      if (result?.session) {
        setIsLoggedIn(true);
        setSession(result.session);
        setUser(result.user);
        
        // Fetch role after login
        if (result.user?.id) {
          const { data: profile, error } = await supabaseClient
            .from('profiles')
            .select('role, phone')
            .eq('id', result.user.id)
            .single();
          
          if (!error && profile) {
            setRole(profile.role);
          }
        }
        
        return result;
      }
      
      return null;
    } catch (error) {
      console.error("Login failed:", error);
      return null;
    } finally {
      setLoadingUser(false);
    }
  };

  const register = async (
    email: string, 
    password: string,
    role: 'seller' | 'buyer',
    fullName: string,
    company?: string,
    phone?: string
  ) => {
    // If the user is already signed in, log them out first
    if (session) {
      await authActions.logout();
      // Small delay to ensure logout completes
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    try {
      setLoadingUser(true);
      const result = await authActions.register(email, password, role, fullName, company, phone);
      
      if (result?.session) {
        setIsLoggedIn(true);
        setSession(result.session);
        setUser(result.user);
        setRole(role); // Use the role explicitly passed to this function
        
        console.log("Registration completed, user is now logged in with role:", role);
        return result;
      } else {
        console.error("Registration completed but no session was returned");
        return null;
      }
    } catch (error: any) {
      console.error("Registration failed:", error.message);
      return null;
    } finally {
      setLoadingUser(false);
    }
  };

  const logout = async () => {
    try {
      setLoadingUser(true);
      await authActions.logout();
      setIsLoggedIn(false);
      setUser(null);
      setRole(null);
      setSession(null);
    } finally {
      setLoadingUser(false);
    }
  };

  return {
    user,
    isLoggedIn,
    session,
    role,
    loadingUser,
    isAdmin,
    isLoading,
    login,
    register,
    logout,
    refreshRole,
    refreshUserRole
  };
}
