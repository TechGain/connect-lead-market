import { useState, useEffect } from 'react';
import { useAuthActions } from './useAuthActions';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Session, User } from '@supabase/supabase-js';

/**
 * Hook for managing user authentication state and role
 */
export function useUserRole() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const supabase = useSupabaseClient();
  const authActions = useAuthActions();

  useEffect(() => {
    const getSession = async () => {
      try {
        setLoadingUser(true);
        const { data: { session } } = await supabase.auth.getSession();

        setSession(session);
        setUser(session?.user || null);
        setIsLoggedIn(!!session?.user);

        if (session?.user) {
          // Fetch the user's role from the profiles table
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      setIsLoggedIn(!!session?.user);
      
      if (session?.user) {
        // Fetch the user's role from the profiles table
        supabase
          .from('profiles')
          .select('role')
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
  }, [supabase]);

  const refreshRole = async () => {
    if (user?.id) {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
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
    register,
    logout,
    refreshRole
  };
}
