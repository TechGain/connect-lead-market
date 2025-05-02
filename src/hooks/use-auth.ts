
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client'; 
import { toast } from 'sonner';
import { getUserRole } from '@/utils/roleManager';
import { Database } from '@/integrations/supabase/types';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [userRole, setUserRole] = useState<'seller' | 'buyer' | null>(null);

  // Function to refresh user role with enhanced error handling
  const refreshRole = useCallback(async () => {
    if (!user?.id) {
      console.log("Cannot refresh role - no user ID available");
      return;
    }
    
    console.log("Refreshing role for user:", user.id);
    
    try {
      // Force a delay to ensure any database updates have time to propagate
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // DIRECT DATABASE QUERY - Get the role directly from the database
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
        
      if (profileError) {
        console.error("Error directly fetching profile:", profileError);
      } else if (profileData && profileData.role) {
        // Normalize the role value
        const normalizedRole = String(profileData.role).toLowerCase();
        
        if (normalizedRole === 'seller' || normalizedRole === 'buyer') {
          console.log("Role directly fetched from database:", normalizedRole);
          setUserRole(normalizedRole as 'seller' | 'buyer');
        } else {
          console.warn("Invalid role found in database:", normalizedRole);
        }
      } else {
        console.warn("No profile found in database for user:", user.id);
        
        // Fallback to metadata
        if (user.user_metadata?.role) {
          const metadataRole = user.user_metadata.role;
          console.log("Falling back to metadata role:", metadataRole);
          
          if (metadataRole === 'seller' || metadataRole === 'buyer') {
            setUserRole(metadataRole);
            
            // Try to create profile with metadata role
            try {
              const profileData: Database['public']['Tables']['profiles']['Insert'] = {
                id: user.id,
                role: metadataRole as 'seller' | 'buyer',
                full_name: user.user_metadata?.full_name || 'User',
              };

              const { error: createError } = await supabase
                .from('profiles')
                .upsert(profileData, { onConflict: 'id' });
                
              if (createError) {
                console.error("Error creating profile from metadata:", createError);
              } else {
                console.log("Profile created from metadata with role:", metadataRole);
              }
            } catch (err) {
              console.error("Error creating profile from metadata:", err);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in refreshRole:", error);
    } finally {
      setIsLoadingUser(false);
    }
  }, [user]);

  useEffect(() => {
    // Clear any session data on page load/refresh
    const clearSessionOnPageLoad = () => {
      console.log("Page loaded/refreshed - clearing session data");
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
    };

    // Execute immediately on first load
    clearSessionOnPageLoad();

    // Check current auth state
    const checkUser = async () => {
      setIsLoadingUser(true);
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          
          // Fetch the user's role
          console.log("Fetching initial role for user:", session.user.id);
          const role = await getUserRole(session.user.id);
          console.log("Initial role fetch result:", role, "for user:", session.user.id);
          setUserRole(role);
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
        
        // Fetch the user's role
        const role = await getUserRole(session.user.id);
        console.log("Auth state change role fetch:", role);
        setUserRole(role);
        
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
        setUser(data.user);
        
        // DIRECT DATABASE QUERY - Get role directly after login
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();
          
        if (profileError) {
          console.error("Error fetching profile after login:", profileError);
        } else if (profileData && profileData.role) {
          const normalizedRole = String(profileData.role).toLowerCase();
          
          if (normalizedRole === 'seller' || normalizedRole === 'buyer') {
            console.log("Role fetched after login:", normalizedRole);
            setUserRole(normalizedRole as 'seller' | 'buyer');
          }
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
      
      // Explicitly set the role in state after successful registration
      setUserRole(role);
      setUser(data.user);
      
      // CRITICAL: Create a profile with the role IMMEDIATELY after signup
      if (data.user?.id) {
        try {
          console.log("Creating profile for new user with role:", role);
          
          const profileData: Database['public']['Tables']['profiles']['Insert'] = {
            id: data.user.id,
            role: role,
            full_name: fullName,
            company: company || null,
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
      
      setIsLoadingUser(false);
      
      // Add a log to confirm state was set
      console.log("Registration complete - UserRole state set to:", role);
      
      return data;
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
      
      // Clear all auth-related storage
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
      
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
    refreshRole,
  };
}
