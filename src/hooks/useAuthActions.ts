
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
    company?: string,
    phone?: string
  ) => {
    try {
      console.log("Registration starting with:", { email, role, fullName, company, phone });
      setIsLoading(true);
      
      // Validate role input before proceeding - ensure admin can't be set
      if (role !== 'seller' && role !== 'buyer') {
        throw new Error("Invalid role. Must be 'seller' or 'buyer'");
      }
      
      // Validate company input
      if (!company) {
        throw new Error("Company name is required");
      }
      
      // Validate phone input
      if (!phone) {
        throw new Error("Phone number is required");
      }
      
      // Sign up the user with role and company in metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
            company: company, // Store company in user metadata
            phone: phone // Store phone in user metadata
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
            company: company, // Ensure company is included in the profile
            phone: phone // Include phone in the profile
          };
          
          const { error: profileError } = await supabase
            .from('profiles')
            .insert(profileData);
            
          if (profileError) {
            console.error("Error creating profile during registration:", profileError);
          } else {
            console.log("Profile successfully created with role, company and phone:", { role, company, phone });
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
      
      // Thoroughly clean up all auth-related storage items first
      try {
        console.log("Clearing local storage auth items");
        const authItems = [
          'supabase.auth.token', 
          'supabase.auth.refreshToken', 
          'sb-bfmxxuarnqmxqqnpxqjf-auth-token',
          'supabase.auth.event',
          'supabase.auth.expires_at'
        ];
        
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
              key.includes('session') ||
              key.includes('sb-')) {
            console.log(`Clearing additional item: ${key}`);
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        console.error("Error clearing localStorage:", e);
      }
      
      // Only attempt the Supabase signOut after clearing storage
      try {
        console.log("Attempting Supabase signOut");
        await supabase.auth.signOut({
          scope: 'global' // This ensures all devices/tabs are signed out
        });
        console.log("Supabase signOut completed successfully");
      } catch (signOutError: any) {
        // Catch any signOut error but don't block - we'll continue with the page redirect
        console.error("Supabase signOut error:", signOutError);
        // Don't rethrow here - we want to continue with the page reload regardless
      }
      
      console.log("Logout successful, redirecting to home page");
      
      toast.success('Signed out successfully');
      
      // Use a small delay to ensure the toast is shown
      setTimeout(() => {
        // Force a complete page reload to clear any cached state
        window.location.href = '/';
      }, 500);
      
    } catch (error: any) {
      console.error("Error during logout:", error);
      toast.error(error.message || 'Failed to sign out');
      
      // Even if there was an error, try to force a reload as a fallback
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
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
