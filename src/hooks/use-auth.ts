
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client'; 
import { toast } from 'sonner';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [userRole, setUserRole] = useState<'seller' | 'buyer' | null>(null);

  // Function to fetch user role from profiles table with additional debug logging
  const fetchUserRole = useCallback(async (userId: string) => {
    try {
      console.log("Fetching role for user:", userId);
      
      // First, directly check if this user exists in the profiles table at all
      const { count: profileCount, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('id', userId);
        
      if (countError) {
        console.error('Error checking profile existence:', countError);
        return null;
      }
      
      console.log(`Profile existence check: ${profileCount} profile(s) found for user ${userId}`);
      
      if (profileCount === 0) {
        console.log("No profile found at all for user. Will need to create one.");
        return null;
      }
      
      // Get the role with explicit column selection
      const { data, error } = await supabase
        .from('profiles')
        .select('role') 
        .eq('id', userId)
        .maybeSingle(); 
      
      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      } 
      
      console.log("Profile data retrieved:", data);
      
      // Check if role exists and normalize it
      if (data && data.role) {
        // Normalize to lowercase and validate
        const roleValue = String(data.role).toLowerCase();
        console.log("Normalized role value:", roleValue);
        
        // Validate that the role is either 'seller' or 'buyer' only
        if (roleValue === 'seller' || roleValue === 'buyer') {
          return roleValue as 'seller' | 'buyer';
        } else {
          console.warn(`Invalid role value detected: "${data.role}". Must be "seller" or "buyer".`);
          return null;
        }
      }
      
      console.warn("Missing role value detected");
      return null;
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      return null;
    }
  }, []);

  // Function to refresh user role with enhanced error handling
  const refreshRole = useCallback(async () => {
    if (!user?.id) {
      console.log("Cannot refresh role - no user ID available");
      return;
    }
    
    console.log("Refreshing role for user:", user.id);
    setIsLoadingUser(true);
    
    try {
      // Force a delay to ensure any database updates have time to propagate
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const role = await fetchUserRole(user.id);
      console.log("Role refresh result:", role);
      
      if (role) {
        console.log("Role refreshed successfully:", role);
        setUserRole(role);
      } else {
        console.warn("Failed to refresh role or role not found");
        
        // If role not found, check if profile exists and fix it
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', user.id)
          .maybeSingle();
          
        if (profile) {
          console.log("Profile exists but role is invalid or missing. Repairing profile...");
          
          // Get role from user metadata if available, otherwise default to buyer
          let defaultRole = 'buyer';
          if (user.user_metadata && user.user_metadata.role) {
            const metadataRole = String(user.user_metadata.role).toLowerCase();
            if (metadataRole === 'seller' || metadataRole === 'buyer') {
              defaultRole = metadataRole;
            }
          }
          
          // Update existing profile with valid role
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              role: defaultRole,
              updated_at: new Date().toISOString() 
            })
            .eq('id', user.id);
            
          if (updateError) {
            console.error("Error updating profile role:", updateError);
          } else {
            console.log("Profile updated with role:", defaultRole);
            setUserRole(defaultRole as 'seller' | 'buyer');
          }
        } else {
          console.log("No profile found. Creating new profile...");
          
          // Get name from metadata or use email as fallback
          const fullName = user.user_metadata?.full_name || 
                          user.email?.split('@')[0] || 
                          'User';
                          
          // Get role from metadata if available, otherwise default to buyer
          let defaultRole = 'buyer';
          if (user.user_metadata && user.user_metadata.role) {
            const metadataRole = String(user.user_metadata.role).toLowerCase();
            if (metadataRole === 'seller' || metadataRole === 'buyer') {
              defaultRole = metadataRole;
            }
          }
          
          // Create new profile with explicit role
          const { error: createError } = await supabase
            .from('profiles')
            .insert({ 
              id: user.id, 
              role: defaultRole,
              full_name: fullName,
              created_at: new Date().toISOString()
            });
          
          if (createError) {
            console.error("Error creating profile:", createError);
          } else {
            console.log("New profile created with role:", defaultRole);
            setUserRole(defaultRole as 'seller' | 'buyer');
          }
        }
      }
    } catch (error) {
      console.error("Error in refreshRole:", error);
    } finally {
      setIsLoadingUser(false);
    }
  }, [user?.id, fetchUserRole]);

  useEffect(() => {
    // Check current auth state
    const checkUser = async () => {
      setIsLoadingUser(true);
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          
          // Fetch the user's role with better logging
          console.log("Fetching initial role for user:", session.user.id);
          const role = await fetchUserRole(session.user.id);
          console.log("Initial role fetch result:", role, "for user:", session.user.id);
          
          if (role) {
            setUserRole(role);
          } else {
            // Try to create/fix profile if no valid role found
            console.log("No valid role found during initialization. Attempting to repair profile...");
            await refreshRole();
          }
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
        const role = await fetchUserRole(session.user.id);
        console.log("Auth state change role fetch:", role);
        
        if (role) {
          setUserRole(role);
        } else {
          // Try to create/fix profile if no valid role found on sign-in
          console.log("No valid role found after auth state change. Attempting to repair profile...");
          await refreshRole();
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserRole(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchUserRole, refreshRole]);

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
        const role = await fetchUserRole(data.user.id);
        if (role) {
          setUserRole(role);
          console.log("Role set after login:", role);
        } else {
          // Try to create/fix profile if no valid role found on login
          console.log("No valid role found after login. Attempting to repair profile...");
          
          // Set user first so refreshRole can access it
          setUser(data.user);
          
          // Short delay to ensure user is set before refreshing role
          setTimeout(async () => {
            await refreshRole();
          }, 500);
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
      
      if (data.user) {
        console.log("User created successfully, creating profile:", data.user.id);
        
        // Explicitly normalize role to lowercase
        const normalizedRole = role.toLowerCase() as 'seller' | 'buyer';
        console.log("Creating profile with normalized role:", normalizedRole);
        
        // First check if profile already exists to prevent duplicates
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();
          
        if (existingProfile) {
          console.log("Profile already exists, updating instead:", existingProfile);
          // Update existing profile
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              full_name: fullName,
              role: normalizedRole,
              company: company || null,
              rating: normalizedRole === 'seller' ? 5 : null,
              updated_at: new Date().toISOString()
            })
            .eq('id', data.user.id);
            
          if (updateError) {
            console.error("Profile update error:", updateError);
            throw updateError;
          }
          
          // Verify the update was successful
          const { data: verifyProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .maybeSingle();
            
          console.log("Profile update verification:", verifyProfile);
        } else {
          // Create new profile with explicit role
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              full_name: fullName,
              role: normalizedRole, 
              company: company || null,
              rating: normalizedRole === 'seller' ? 5 : null,
              created_at: new Date().toISOString() 
            });
          
          if (profileError) {
            console.error("Profile creation error:", profileError);
            console.error("Profile creation details:", {
              userId: data.user.id,
              fullName,
              role: normalizedRole,
              company
            });
            throw profileError;
          }
          
          // Verify the insert was successful
          const { data: verifyProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .maybeSingle();
            
          console.log("Profile creation verification:", verifyProfile);
        }
        
        // Explicitly set the role in state after successful registration
        setUserRole(normalizedRole);
        setUser(data.user);
        setIsLoadingUser(false);
        
        // Add a log to confirm state was set
        console.log("Registration complete - UserRole state set to:", normalizedRole);
        
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
    refreshRole,
  };
}
