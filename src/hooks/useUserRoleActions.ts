
import { useState } from 'react';
import { useAuthActions } from '@/hooks/useAuthActions';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for user role related actions
 */
export function useUserRoleActions() {
  const [loadingAction, setLoadingAction] = useState(false);
  const authActions = useAuthActions();

  // Add login method using authActions
  const login = async (email: string, password: string) => {
    try {
      setLoadingAction(true);
      const result = await authActions.login(email, password);
      
      if (result?.session) {
        const role = await fetchUserRole(result.user?.id);
        return { ...result, role };
      }
      
      return null;
    } catch (error) {
      console.error("Login failed:", error);
      return null;
    } finally {
      setLoadingAction(false);
    }
  };

  const register = async (
    email: string, 
    password: string,
    role: 'seller' | 'buyer',
    fullName: string,
    company?: string,
    phone?: string,
    referralSource?: string
  ) => {
    try {
      setLoadingAction(true);
      const result = await authActions.register(email, password, role, fullName, company, phone, referralSource);
      
      if (result?.session) {
        console.log("Registration completed, user is now logged in with role:", role);
        return { ...result, role };
      } else {
        console.error("Registration completed but no session was returned");
        return null;
      }
    } catch (error: any) {
      console.error("Registration failed:", error.message);
      return null;
    } finally {
      setLoadingAction(false);
    }
  };

  const logout = async () => {
    try {
      setLoadingAction(true);
      await authActions.logout();
    } finally {
      setLoadingAction(false);
    }
  };

  const fetchUserRole = async (userId?: string) => {
    if (!userId) return null;
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching user role:", error);
        return null;
      }
      
      return profile?.role || null;
    } catch (error) {
      console.error("Error in fetchUserRole:", error);
      return null;
    }
  };

  return {
    login,
    register,
    logout,
    isLoading: loadingAction
  };
}
