
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client'; 
import { toast } from 'sonner';
import { getUserRole } from '@/utils/roleManager';

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
      } else if (profileData?.role) {
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
              // Define profile data according to the expected schema type
              const profileData = {
                id: user.id,
                full_name: user.user_metadata?.full_name || 'User',
                role: metadataRole as 'seller' | 'buyer'
              };
              
              const { error: createError } = await supabase
                .from('profiles')
                .upsert(profileData);
                
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
    // Check current auth state
    const checkUser = async () => {
      setIsLoadingUser(true);
      try {
        console.log("Initial auth check - getting session");
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log("Session found for user:", session.user.id);
          setUser(session.user);
          
          // Fetch the user's role
          console.log("Fetching initial role for user:", session.user.id);
          const role = await getUserRole(session.user.id);
          console.log("Initial role fetch result:", role, "for user:", session.user.id);
          setUserRole(role);
        } else {
          console.log("No session found");
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
        } else if (profileData?.role) {
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
      
      // First clear any cached user state
      setUser(null);
      setUserRole(null);
      
      // Then perform the actual signout
      const { error } = await supabase.auth.signOut({
        scope: 'global'  // Ensure we sign out from all tabs/windows
      });
      
      if (error) {
        console.error("Logout error:", error);
        toast.error(error.message || 'Failed to sign out');
        return false;
      }
      
      console.log("Sign out successful");
      
      // Clear only profile-related cache, but not the auth token
      // as it will be cleared by Supabase's signOut method
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('profile_') || key === 'user_role') {
          localStorage.removeItem(key);
        }
      });
      
      // Don't force a page reload as this can interrupt the auth flow
      // Let the onAuthStateChange event handle the UI update
      
      toast.success('Signed out successfully');
      return true;
    } catch (error: any) {
      console.error("Error during logout:", error);
      toast.error(error.message || 'Failed to sign out');
      return false;
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
