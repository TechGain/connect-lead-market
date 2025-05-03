
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

  return {
    user,
    isLoggedIn: !!user,
    isLoadingUser,
    role: userRole,
    refreshRole,
  };
}
