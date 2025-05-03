
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook for authentication actions (login, register, logout)
 */
export function useAuthActions() {
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    try {
      console.log("Attempting login with:", { email });
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      return data;
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || 'Failed to sign in');
      return null;
    } finally {
      setIsLoading(false);
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
      console.log("Starting logout process");
      setIsLoading(true);
      
      // First, perform a complete sign-out
      const { error } = await supabase.auth.signOut({
        scope: 'global' // This ensures all devices/tabs are signed out
      });
      
      if (error) {
        console.error("Logout error:", error);
        throw error;
      }
      
      console.log("Supabase signOut completed successfully");
      
      // Force clear all auth-related localStorage items
      try {
        const authItems = ['supabase.auth.token', 'supabase.auth.refreshToken', 'sb-bfmxxuarnqmxqqnpxqjf-auth-token'];
        authItems.forEach(key => {
          console.log(`Clearing ${key} from localStorage`);
          localStorage.removeItem(key);
        });
        
        // Clear any other relevant items
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase') || 
              key.includes('auth') || 
              key.includes('user') || 
              key.includes('profile') || 
              key.includes('session')) {
            console.log(`Clearing additional item: ${key}`);
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        console.error("Error clearing localStorage:", e);
      }
      
      console.log("Logout successful, redirecting to home page");
      
      // Use a more forceful approach to redirect and clear state
      toast.success('Signed out successfully');
      
      // Use a small delay to ensure the toast is shown
      setTimeout(() => {
        // Force a complete page reload to clear any cached state
        window.location.href = '/';
        window.location.replace('/');
      }, 500);
      
    } catch (error: any) {
      console.error("Error during logout:", error);
      toast.error(error.message || 'Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    register,
    logout,
    isLoading
  };
}
