
import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/use-user-role';

const MAX_RETRY_ATTEMPTS = 3;
const SESSION_TIMEOUT = 5000; // 5 seconds
const PROFILE_TIMEOUT = 4000; // 4 seconds

interface ProfileData {
  name: string;
  email: string;
  company: string;
  role: string;
  rating: number;
  joinedDate: string;
  totalLeads: number;
}

export const useProfileFetcher = () => {
  const navigate = useNavigate();
  const { user: contextUser } = useUserRole();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(contextUser || null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [connectionIssue, setConnectionIssue] = useState(false);
  
  // Use refs to track the fetch state and prevent race conditions
  const isMountedRef = useRef(true);
  const isLoadingRef = useRef(true);
  
  // Function to fetch profile data with improved error handling
  const fetchProfileData = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    try {
      console.log("ProfileFetcher: Starting profile data fetch (attempt", loadAttempts + 1, ")");
      setIsLoading(true);
      isLoadingRef.current = true;
      setError(null);
      
      // Try to use the user from context first (most reliable source)
      let userToUse = contextUser || userData;
      
      // If we don't have a user yet, try to get one from the session
      if (!userToUse?.id) {
        try {
          // Set up an AbortController for the session fetch timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), SESSION_TIMEOUT);
          
          // Attempt to get the session with timeout
          const { data: sessionData, error: sessionError } = await Promise.race([
            supabase.auth.getSession(),
            new Promise<any>((_, reject) => 
              setTimeout(() => reject({ error: { message: "Session fetch timeout" }}), SESSION_TIMEOUT)
            )
          ]);
          
          clearTimeout(timeoutId);
          
          if (sessionError) {
            console.error("ProfileFetcher: Session error:", sessionError);
            throw sessionError;
          }
          
          if (!sessionData?.session?.user) {
            console.log("ProfileFetcher: No authenticated user found");
            throw new Error("Not authenticated");
          }
          
          userToUse = sessionData.session.user;
          setUserData(userToUse);
          console.log("ProfileFetcher: User found from session:", userToUse.id);
          
          // Try to store in localStorage for fallback
          try {
            localStorage.setItem('cachedUser', JSON.stringify(userToUse));
          } catch (e) {
            console.warn("ProfileFetcher: Could not cache user data");
          }
        } catch (sessionErr: any) {
          console.error("ProfileFetcher: Session fetch failed:", sessionErr);
          
          // Try to get user from localStorage as a last resort
          try {
            const cachedUserStr = localStorage.getItem('cachedUser');
            if (cachedUserStr) {
              userToUse = JSON.parse(cachedUserStr);
              setUserData(userToUse);
              console.log("ProfileFetcher: Using cached user:", userToUse.id);
              setConnectionIssue(true); // Indicate we're using fallback data
            } else {
              throw new Error("No user data available");
            }
          } catch (e) {
            console.error("ProfileFetcher: No user data available:", e);
            setConnectionIssue(true);
            throw new Error("Could not retrieve user information. Please try logging in again.");
          }
        }
      }
      
      if (!userToUse?.id) {
        throw new Error("User ID not found. Please try logging in again.");
      }
      
      // Get profile from profiles table with improved timeout handling
      try {
        console.log("ProfileFetcher: Attempting to fetch profile for user ID:", userToUse.id);
        
        // Create a promise for the profile query with AbortController for cancellation
        const profilePromise = supabase
          .from('profiles')
          .select('*')
          .eq('id', userToUse.id)
          .maybeSingle();
        
        // Create a timeout promise
        const timeoutPromise = new Promise<any>((_, reject) => 
          setTimeout(() => reject({ error: { message: "Profile fetch timeout" }}), PROFILE_TIMEOUT)
        );
        
        // Race the two promises
        const { data: profile, error: profileError } = await Promise.race([
          profilePromise,
          timeoutPromise
        ]);
        
        console.log("ProfileFetcher: Profile fetch complete:", profile);
        
        if (profileError) {
          console.warn("ProfileFetcher: Error fetching profile:", profileError);
          throw profileError;
        }
        
        // Format registration date
        const registrationDate = new Date(userToUse?.created_at || Date.now());
        const joinedDate = registrationDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        });
        
        // Count leads if user is a seller (with simplified logic to avoid additional timeouts)
        let totalLeads = 0;
        if (profile?.role?.toLowerCase() === 'seller') {
          try {
            // Create a promise for the leads count query
            const leadsPromise = supabase
              .from('leads')
              .select('*', { count: 'exact', head: true })
              .eq('seller_id', userToUse.id);
            
            // Create a timeout promise for leads count
            const leadsTimeoutPromise = new Promise<any>((_, reject) => 
              setTimeout(() => reject({ error: { message: "Leads count timeout" }}), 3000)
            );
            
            // Race the two promises
            const { count, error: leadsError } = await Promise.race([
              leadsPromise,
              leadsTimeoutPromise
            ]);
            
            if (leadsError) {
              console.warn("ProfileFetcher: Error counting leads:", leadsError);
            } else if (count !== null) {
              totalLeads = count;
            }
          } catch (err) {
            console.warn("ProfileFetcher: Error fetching leads count:", err);
            // Don't fail the whole profile for leads count errors
          }
        }
        
        // Store profile data in localStorage for fallback
        try {
          localStorage.setItem(`profile_${userToUse.id}`, JSON.stringify(profile));
        } catch (e) {
          console.warn("ProfileFetcher: Could not cache profile data");
        }
        
        // Set complete profile data
        const newProfileData = {
          name: profile?.full_name || (userToUse?.email?.split('@')[0] || 'User'),
          email: userToUse?.email || '',
          company: profile?.company || 'Not specified',
          role: profile?.role?.toLowerCase() || 'buyer',
          rating: profile?.rating || 4.7,
          joinedDate,
          totalLeads
        };
        
        if (!isMountedRef.current) return;
        setProfileData(newProfileData);
        setConnectionIssue(false); // Reset connection issue flag on success
        
      } catch (profileErr: any) {
        console.warn("ProfileFetcher: Profile fetch failed:", profileErr);
        setConnectionIssue(true);
        
        // Try to use cached profile data if available
        try {
          const cachedProfileStr = localStorage.getItem(`profile_${userToUse.id}`);
          if (cachedProfileStr) {
            const cachedProfile = JSON.parse(cachedProfileStr);
            
            // Build profile data from cache and user info
            const fallbackProfile = {
              name: cachedProfile?.full_name || userToUse?.user_metadata?.full_name || userToUse?.email?.split('@')[0] || 'User',
              email: userToUse?.email || 'No email available',
              company: cachedProfile?.company || 'Not specified',
              role: cachedProfile?.role?.toLowerCase() || 'buyer',
              rating: cachedProfile?.rating || 4.7,
              joinedDate: new Date(userToUse?.created_at || Date.now()).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long' 
              }),
              totalLeads: 0 // Can't reliably get leads count in fallback mode
            };
            
            if (!isMountedRef.current) return;
            setProfileData(fallbackProfile);
            setError("Using limited profile data due to connection issues.");
            toast.warning("Using cached profile data. Some features may be unavailable.");
          } else {
            throw new Error("No cached profile data available");
          }
        } catch (e) {
          console.error("ProfileFetcher: No cached profile data available:", e);
          
          // Create bare minimum profile as last resort
          if (userToUse) {
            const minimalProfile = {
              name: userToUse?.user_metadata?.full_name || userToUse?.email?.split('@')[0] || 'User',
              email: userToUse?.email || 'No email available',
              company: 'Not specified',
              role: 'buyer',
              rating: 4.7,
              joinedDate: 'Unknown',
              totalLeads: 0
            };
            
            if (!isMountedRef.current) return;
            setProfileData(minimalProfile);
            setError("Limited profile data available. Please try refreshing.");
            toast.warning("Using limited profile data. Try refreshing later.");
          } else {
            throw new Error("Could not create profile data. Missing user information.");
          }
        }
      }
      
      // Clear error and reset attempts on success
      setLoadAttempts(0);
    } catch (err: any) {
      console.error("ProfileFetcher: Exception in profile data fetch:", err);
      
      if (!isMountedRef.current) return;
      
      if (loadAttempts >= MAX_RETRY_ATTEMPTS) {
        // After multiple retries, show content with fallback data if we have userData
        if (userData) {
          const fallbackProfile = {
            name: userData?.user_metadata?.full_name || userData?.email?.split('@')[0] || 'User',
            email: userData?.email || 'No email available',
            company: 'Not specified',
            role: 'buyer',
            rating: 4.7,
            joinedDate: 'Unknown',
            totalLeads: 0
          };
          
          setProfileData(fallbackProfile);
          setError("Using limited profile data. Some features may be unavailable.");
          setConnectionIssue(true);
        } else {
          setError(err.message || "Failed to load profile after multiple attempts");
        }
      } else {
        setError(err.message || "An unexpected error occurred. Please try again.");
        setLoadAttempts(prev => prev + 1);
        
        // Auto-retry with increasing delay
        const retryDelay = Math.min(2000 * (loadAttempts + 1), 8000);
        setTimeout(() => {
          if (isMountedRef.current && isLoadingRef.current) {
            fetchProfileData();
          }
        }, retryDelay);
      }
    } finally {
      if (!isMountedRef.current) return;
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [navigate, loadAttempts, userData, contextUser]);

  // Handle retry button click
  const handleRetry = useCallback(() => {
    toast.info("Retrying profile data fetch...");
    setError(null);
    setLoadAttempts(0); // Reset attempt counter on manual retry
    
    // Clear cached data on manual retry to force fresh fetch
    try {
      if (userData?.id) {
        localStorage.removeItem(`profile_${userData.id}`);
      }
    } catch (e) {
      console.warn("Could not clear cached profile data");
    }
    
    fetchProfileData();
  }, [fetchProfileData, userData]);
  
  // Fetch on mount and cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    fetchProfileData();
    
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchProfileData]);

  return {
    isLoading,
    error,
    userData,
    profileData,
    fetchProfileData,
    handleRetry,
    connectionIssue
  };
};
