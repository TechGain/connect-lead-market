
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client'; 
import { toast } from 'sonner';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [userRole, setUserRole] = useState<'seller' | 'buyer' | null>(null);

  useEffect(() => {
    // Check current auth state
    const checkUser = async () => {
      setIsLoadingUser(true);
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          
          // Fetch the user's profile to get the role
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          if (error) {
            console.error('Error fetching user role:', error);
            console.log('Raw error response:', error.message, error.details, error.hint);
            throw error;
          }
          
          console.log("User role from profile:", data?.role);
          setUserRole(data?.role as 'seller' | 'buyer' | null);
        } else {
          setUser(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error fetching auth user:', error);
        setUser(null);
        setUserRole(null);
      } finally {
        setIsLoadingUser(false);
      }
    };
    
    checkUser();
    
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        
        // Fetch the user's profile to get the role
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          if (error) {
            console.error('Error fetching user role on auth state change:', error);
            console.log('Raw error data:', error.message, error.details, error.hint);
            // We'll still display the error but not throw it to prevent breaking the auth flow
            toast.error('Failed to load user profile. Please try logging out and back in.');
          } else {
            console.log("User role from profile on auth change:", data?.role);
            setUserRole(data?.role as 'seller' | 'buyer' | null);
          }
        } catch (fetchError) {
          console.error('Error in profile fetch during auth state change:', fetchError);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserRole(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

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
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*') // Select all columns to debug what's actually in the profile
          .eq('id', data.user.id)
          .single();
        
        if (profileError) {
          console.error('Error fetching profile after login:', profileError);
          console.log('Raw profile error:', profileError.message, profileError.details, profileError.hint);
        } else {
          console.log("Complete profile data after login:", profileData);
          console.log("Setting user role after login:", profileData?.role);
          setUserRole(profileData?.role as 'seller' | 'buyer' | null);
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
      setIsLoadingUser(true);
      
      // Sign up the user
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
      
      if (data.user) {
        console.log("User created successfully, creating profile:", data.user.id);
        
        // Create a profile for the user with their role
        const { error: profileError, data: profileData } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            full_name: fullName,
            role,
            company: company || null,
            rating: role === 'seller' ? 5 : null, // Default rating for sellers
          })
          .select()
          .single();
        
        if (profileError) {
          console.error("Profile creation error:", profileError);
          console.error("Profile creation details:", {
            userId: data.user.id,
            fullName,
            role,
            company
          });
          throw profileError;
        }
        
        console.log("Profile created successfully with role:", role, "Profile data:", profileData);
        
        // Explicitly set the role in state after successful registration
        setUserRole(role);
        setUser(data.user);
        setIsLoadingUser(false);
        
        return data;
      } else {
        console.error("No user data returned after signup");
        throw new Error("Registration failed - no user data returned");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      setIsLoadingUser(false);
      // Provide more specific error messages based on the error
      if (error.message?.includes('email')) {
        toast.error('This email address is already registered');
      } else if (error.message?.includes('password')) {
        toast.error('Password does not meet requirements');
      } else {
        toast.error(error.message || 'Failed to create account');
      }
      return null;
    }
  };

  const logout = async () => {
    try {
      console.log("Attempting to sign out");
      
      // Clear state immediately without waiting for auth state change
      setUser(null);
      setUserRole(null);
      console.log("User state cleared");
      
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
    user,
    isLoggedIn: !!user,
    isLoadingUser,
    role: userRole,
    login,
    register,
    logout,
  };
}
