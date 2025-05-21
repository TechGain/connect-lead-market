
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ProfileData {
  name: string;
  email: string;
  company: string;
  rating: number;
  joinedDate: string;
  avatar: undefined;
  totalLeads: number;
}

export const useProfileData = () => {
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    company: '',
    rating: 4.7,
    joinedDate: '',
    avatar: undefined,
    totalLeads: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchAttempts, setFetchAttempts] = useState(0);
  
  // Improved fetch function with better timeout handling
  const fetchProfileData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("useProfileData: Fetching profile data (attempt", fetchAttempts + 1, ")");
      
      // Get current session with a higher timeout
      const sessionPromise = supabase.auth.getSession();
      const sessionTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Session fetch timeout")), 6000);
      });
      
      let user;
      try {
        const { data: sessionData, error: sessionError } = await Promise.race([
          sessionPromise,
          sessionTimeoutPromise
        ]) as any;
        
        if (sessionError) {
          console.error("useProfileData: Session error:", sessionError);
          throw new Error("Authentication error: " + sessionError.message);
        }
        
        if (!sessionData?.session?.user) {
          console.log("useProfileData: No authenticated user found");
          throw new Error("Not authenticated");
        }
        
        user = sessionData.session.user;
        console.log("useProfileData: Session user found:", user.id);
      } catch (sessionErr) {
        console.error("useProfileData: Session fetch failed:", sessionErr);
        // Continue with cached user data if available in localStorage
        const cachedUserString = localStorage.getItem('cachedUser');
        if (cachedUserString) {
          try {
            user = JSON.parse(cachedUserString);
            console.log("useProfileData: Using cached user data:", user.id);
          } catch (e) {
            console.error("useProfileData: Error parsing cached user:", e);
            throw new Error("Failed to get user session");
          }
        } else {
          throw new Error("Failed to get user session");
        }
      }
      
      // Cache user data for future use
      if (user?.id) {
        localStorage.setItem('cachedUser', JSON.stringify(user));
      }
      
      // Get profile from profiles table with increased timeout
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      const profileTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Profile fetch timeout")), 5000);
      });
      
      let profile;
      try {
        const { data: profileData, error: profileError } = await Promise.race([
          profilePromise,
          profileTimeoutPromise
        ]) as any;
        
        if (profileError) {
          console.error("useProfileData: Error fetching profile:", profileError);
          throw new Error("Failed to load profile data: " + profileError.message);
        }
        
        profile = profileData;
        console.log("useProfileData: Profile data retrieved:", profile);
      } catch (profileErr) {
        console.error("useProfileData: Profile fetch failed:", profileErr);
        // Check for cached profile data
        const cachedProfileString = localStorage.getItem(`profile_${user.id}`);
        if (cachedProfileString) {
          try {
            profile = JSON.parse(cachedProfileString);
            console.log("useProfileData: Using cached profile data");
          } catch (e) {
            console.error("useProfileData: Error parsing cached profile:", e);
          }
        }
      }
      
      // Format registration date
      const registrationDate = new Date(user.created_at || Date.now());
      const joinedDate = registrationDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
      
      // Count leads if user is a seller (with more graceful error handling)
      let totalLeads = 0;
      if (profile?.role?.toLowerCase() === 'seller') {
        try {
          const leadsPromise = supabase
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .eq('seller_id', user.id);
          
          const leadsTimeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Leads count timeout")), 3000);
          });
          
          const { count, error: leadsError } = await Promise.race([
            leadsPromise,
            leadsTimeoutPromise
          ]) as any;
          
          if (leadsError) {
            console.warn("useProfileData: Error counting leads:", leadsError);
          } else if (count !== null) {
            totalLeads = count;
          }
        } catch (err) {
          console.warn("useProfileData: Exception in leads count:", err);
        }
      }
      
      // Create profile data object with fallbacks from cached data
      // Now prioritizing profile.email when available, falling back to user.email
      const newProfileData = {
        name: profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        email: profile?.email || user.email || '',
        company: profile?.company || 'Not specified',
        rating: profile?.rating || 4.7,
        joinedDate,
        avatar: undefined,
        totalLeads
      };
      
      // Update profile data state
      setProfileData(newProfileData);
      
      // Cache the profile data for future use
      if (user?.id) {
        localStorage.setItem(`profile_${user.id}`, JSON.stringify({
          ...profile,
          // Add these fields to ensure we have them for fallback
          full_name: newProfileData.name,
          company: newProfileData.company,
          rating: newProfileData.rating,
          email: newProfileData.email // Include email in cached profile data
        }));
      }
      
      console.log("useProfileData: Profile data set successfully");
      setFetchAttempts(0); // Reset attempts counter on success
    } catch (err: any) {
      console.error("useProfileData: Exception in profile data fetch:", err);
      setError(err.message || "An error occurred while loading your profile");
      setFetchAttempts(prev => prev + 1);
      
      // If multiple attempts have failed, show toast
      if (fetchAttempts >= 2) {
        toast.error("Failed to load complete profile data. Showing limited information.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchAttempts]);
  
  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // Public method for manual refresh
  const refreshData = useCallback(() => {
    setFetchAttempts(0); // Reset attempts counter
    localStorage.removeItem(`profile_${JSON.parse(localStorage.getItem('cachedUser') || '{}')?.id}`);
    fetchProfileData();
  }, [fetchProfileData]);

  return { profileData, isLoading, error, refreshData };
};
