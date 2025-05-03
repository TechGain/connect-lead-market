
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getUserRole } from '@/utils/roleManager';

/**
 * Hook for authentication actions (login, register, logout)
 */
export function useAuthActions() {
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    try {
      console.log("Attempting login with:", { email });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // After successful login, explicitly fetch and set the role
      if (data.user) {
        // DIRECT DATABASE QUERY - Get role directly after login
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();
          
        if (profileError) {
          console.error("Error fetching profile after login:", profileError);
        }
      }
      
      return data;
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || 'Failed to sign in');
      return null;
    }
  };

  const register = async (
    email: string, 
    password: string, 
    role: 'seller' | 'buyer',
    fullName: string,
    company?: string
  ) => {
    try {
      console.log("Registration starting with:", { email, role, fullName, company });
      setIsLoading(true);
      
      // Validate role input before proceeding
      if (role !== 'seller' && role !== 'buyer') {
        throw new Error("Invalid role. Must be 'seller' or 'buyer'");
      }
      
      // Sign up the user with role in metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role // Store role in user metadata
          }
        }
      });
      
      if (error) {
        console.error("Signup error:", error);
        throw error;
      }
      
      // CRITICAL: Create a profile with the role IMMEDIATELY after signup
      if (data.user?.id) {
        try {
          console.log("Creating profile for new user with role:", role);
          
          // Define profile data according to the expected schema type
          const profileData = {
            id: data.user.id,
            full_name: fullName,
            role: role,
            company: company || null
          };
          
          const { error: profileError } = await supabase
            .from('profiles')
            .insert(profileData);
            
          if (profileError) {
            console.error("Error creating profile during registration:", profileError);
          } else {
            console.log("Profile successfully created with role:", role);
          }
        } catch (err) {
          console.error("Exception creating profile during registration:", err);
        }
      }
      
      // Add a log to confirm state was set
      console.log("Registration complete - UserRole state set to:", role);
      
      return data;
    } catch (error: any) {
      console.error("Registration error:", error);
      // Provide more specific error messages based on the error
      if (error.message?.includes('email')) {
        toast.error('This email address is already registered');
      } else if (error.message?.includes('password')) {
        toast.error('Password does not meet requirements');
      } else {
        toast.error(error.message || 'Failed to create account');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log("Attempting to sign out");
      
      // Then perform the actual signout
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error);
        throw error;
      }
      
      // Force a page reload to clear any cached state
      window.location.href = '/';
      
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error("Error during logout:", error);
      toast.error(error.message || 'Failed to sign out');
    }
  };

  return {
    login,
    register,
    logout,
    isLoading
  };
}
