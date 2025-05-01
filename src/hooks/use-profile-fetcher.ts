
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000;

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loadAttempts, setLoadAttempts] = useState(0);

  // Function to fetch profile data with improved error handling
  const fetchProfileData = useCallback(async () => {
    try {
      console.log("ProfileFetcher: Starting profile data fetch (attempt", loadAttempts + 1, ")");
      setIsLoading(true);
      setError(null);
      
      // First check if we already have a user from context
      if (userData?.id) {
        console.log("ProfileFetcher: Using cached user:", userData.id);
      } else {
        // If not, get current session with a timeout
        const sessionPromise = supabase.auth.getSession();
        
        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject({ error: { message: "Session fetch timeout" }}), 3000);
        });
        
        // Race the session fetch against the timeout
        const { data: sessionData, error: sessionError } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;
        
        if (sessionError) {
          console.error("ProfileFetcher: Session error:", sessionError);
          
          // If we've tried too many times, use cached user data if available
          if (loadAttempts >= MAX_RETRY_ATTEMPTS && userData) {
            console.log("ProfileFetcher: Using cached user data after multiple failures");
            // Continue with cached data, but show a warning
            toast.warning("Using cached profile data. Some information may be outdated.");
          } else {
            setError("Session error: " + sessionError.message);
            setIsLoading(false);
            return;
          }
        } else if (!sessionData?.session?.user) {
          console.log("ProfileFetcher: No authenticated user found");
          setError("You must be logged in to view this page");
          toast.error("Please log in to view your profile");
          navigate('/login');
          setIsLoading(false);
          return;
        } else {
          const user = sessionData.session.user;
          console.log("ProfileFetcher: User found:", user.id);
          setUserData(user);
        }
      }
      
      // We should have userData by now, either from context, session, or cache
      if (!userData && !userData) {
        setError("Unable to authenticate. Please try logging in again.");
        setIsLoading(false);
        return;
      }
      
      const userId = userData?.id;
      
      if (!userId) {
        setError("User ID not found. Please try logging in again.");
        setIsLoading(false);
        return;
      }
      
      // Get profile from profiles table with timeout
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      const profileTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject({ error: { message: "Profile fetch timeout" }}), 3000);
      });
      
      const { data: profile, error: profileError } = await Promise.race([
        profilePromise,
        profileTimeoutPromise
      ]) as any;
      
      // Create a minimal profile if fetch fails or no profile exists
      if (profileError || !profile) {
        console.warn("ProfileFetcher: Error or no profile found:", profileError || "No profile");
        
        // Create a minimal profile data object
        setProfileData({
          name: (userData?.user_metadata?.full_name || userData?.email?.split('@')[0] || 'User'),
          email: userData?.email || 'No email available',
          company: 'Not specified',
          role: 'buyer', // Default role
          rating: 4.7,
          joinedDate: new Date(userData?.created_at || Date.now()).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
          }),
          totalLeads: 0
        });
        
        if (profileError) {
          // Show warning but don't block the UI
          toast.warning("Could not retrieve full profile. Showing limited information.");
          console.error("ProfileFetcher: Error fetching profile:", profileError);
        }
      } else {
        // Format registration date
        const registrationDate = new Date(userData?.created_at || Date.now());
        const joinedDate = registrationDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        });
        
        // Count leads if user is a seller (with timeout protection)
        let totalLeads = 0;
        if (profile?.role?.toLowerCase() === 'seller') {
          try {
            const leadsPromise = supabase
              .from('leads')
              .select('*', { count: 'exact', head: true })
              .eq('seller_id', userId);
            
            const leadsTimeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject({ error: { message: "Leads count timeout" }}), 2000);
            });
            
            const { count, error: leadsError } = await Promise.race([
              leadsPromise,
              leadsTimeoutPromise
            ]) as any;
            
            if (!leadsError && count !== null) {
              totalLeads = count;
            }
          } catch (err) {
            console.warn("Error fetching leads count:", err);
            // Don't fail the whole profile for leads count errors
          }
        }
        
        // Set complete profile data
        setProfileData({
          name: profile?.full_name || (userData?.email?.split('@')[0] || 'User'),
          email: userData?.email || '',
          company: profile?.company || 'Not specified',
          role: profile?.role?.toLowerCase() || 'buyer',
          rating: profile?.rating || 4.7,
          joinedDate,
          totalLeads
        });
      }
      
      // Clear error and reset attempts on success
      setError(null);
      setLoadAttempts(0);
    } catch (err: any) {
      console.error("ProfileFetcher: Exception in profile data fetch:", err);
      
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
          toast.warning("Using limited profile data. Try refreshing later.");
        } else {
          setError(err.message || "Failed to load profile after multiple attempts");
        }
      } else {
        setError(err.message || "An unexpected error occurred. Please try again.");
        setLoadAttempts(prev => prev + 1);
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate, loadAttempts, userData]);

  // Handle retry button click
  const handleRetry = useCallback(() => {
    toast.info("Retrying profile data fetch...");
    setError(null);
    setLoadAttempts(0); // Reset attempt counter on manual retry
    fetchProfileData();
  }, [fetchProfileData]);

  return {
    isLoading,
    error,
    userData,
    profileData,
    fetchProfileData,
    handleRetry
  };
};
