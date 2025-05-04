
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client'; 
import { getUserRole } from '@/utils/roleManager';

/**
 * Hook that manages authentication state
 */
export function useAuthState() {
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
    const fetchInitialSession = async () => {
      try {
        console.log("Fetching initial session...");
        
        // Get current session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error fetching session:", error);
          setUser(null);
          setUserRole(null);
          setIsLoadingUser(false);
          return;
        }
        
        if (data?.session) {
          console.log("Initial session found:", data.session.user.id);
          setUser(data.session.user);
          
          // Fetch role for user
          if (data.session.user.id) {
            console.log("Fetching role for user:", data.session.user.id);
            const role = await getUserRole(data.session.user.id);
            console.log("Initial user role:", role);
            setUserRole(role);
          }
        } else {
          console.log("No active session found");
          setUser(null);
          setUserRole(null);
        }
      } catch (err) {
        console.error("Error in initial session fetch:", err);
        setUser(null);
        setUserRole(null);
      } finally {
        setIsLoadingUser(false);
      }
    };
    
    // First set up the auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log("Auth event: User signed in:", session.user.id);
        setUser(session.user);
        
        // Handle role in a separate non-blocking call to avoid Supabase listener deadlocks
        setTimeout(async () => {
          try {
            const role = await getUserRole(session.user.id);
            console.log("Role fetched after sign in:", role);
            setUserRole(role);
          } catch (e) {
            console.error("Error fetching role after sign in:", e);
          }
        }, 0);
      } 
      else if (event === 'SIGNED_OUT') {
        console.log("Auth event: User signed out");
        setUser(null);
        setUserRole(null);
      }
      else if (event === 'TOKEN_REFRESHED' && session) {
        console.log("Auth event: Token refreshed, updating user");
        setUser(session.user);
      }
    });
    
    // Then check for existing session
    fetchInitialSession();

    return () => {
      console.log("Cleaning up auth listener");
      authListener.subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    isLoggedIn: !!user,
    isLoadingUser,
    role: userRole,
    refreshRole,
  };
}

