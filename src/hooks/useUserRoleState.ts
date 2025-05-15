
import { useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for managing user role state
 */
export function useUserRoleState() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Compute isAdmin based on role
  const isAdmin = role === 'admin';

  // Alias isLoading to loadingUser for consistency with other hooks
  const isLoading = loadingUser;

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      setIsLoggedIn(!!session?.user);
      
      if (session?.user) {
        // Fetch the user's role from the profiles table
        supabase
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
  }, []);

  const refreshRole = useCallback(async () => {
    if (user?.id) {
      try {
        const { data: profile, error } = await supabase
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
  }, [user]);

  return {
    user,
    isLoggedIn,
    session,
    role,
    loadingUser,
    isAdmin,
    isLoading,
    setIsLoggedIn,
    setUser,
    setSession,
    setRole,
    setLoadingUser,
    refreshRole
  };
}
