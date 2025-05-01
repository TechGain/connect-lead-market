
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
  
  // Simplified direct fetch function with better error handling
  const fetchProfileData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("useProfileData: Fetching profile data directly (attempt", fetchAttempts + 1, ")");
      
      // Get current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("useProfileData: Session error:", sessionError);
        setError("Authentication error: " + sessionError.message);
        return;
      }
      
      if (!sessionData?.session?.user) {
        console.log("useProfileData: No authenticated user found");
        setError("Not authenticated");
        return;
      }
      
      const user = sessionData.session.user;
      console.log("useProfileData: Session user found:", user.id);
      
      // Get profile from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle(); // Using maybeSingle instead of single to avoid errors
      
      if (profileError) {
        console.error("useProfileData: Error fetching profile:", profileError);
        setError("Failed to load profile data: " + profileError.message);
        return;
      }
      
      console.log("useProfileData: Profile data retrieved:", profile);
      
      if (!profile) {
        console.warn("useProfileData: No profile found for user:", user.id);
        // Create a simplified profile if none exists
        setProfileData({
          name: user.email?.split('@')[0] || 'User',
          email: user.email || '',
          company: 'Not specified',
          rating: 4.7,
          joinedDate: new Date(user.created_at || Date.now()).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
          }),
          avatar: undefined,
          totalLeads: 0
        });
        return;
      }
      
      // Format registration date
      const registrationDate = new Date(user.created_at || Date.now());
      const joinedDate = registrationDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
      
      // Count leads if user is a seller
      let totalLeads = 0;
      if (profile?.role?.toLowerCase() === 'seller') {
        const { count, error: leadsError } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', user.id);
        
        if (leadsError) {
          console.warn("useProfileData: Error counting leads:", leadsError);
        } else if (count !== null) {
          totalLeads = count;
        }
      }
      
      // Update profile data state
      setProfileData({
        name: profile?.full_name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        company: profile?.company || 'Not specified',
        rating: profile?.rating || 4.7,
        joinedDate,
        avatar: undefined,
        totalLeads
      });
      
      console.log("useProfileData: Profile data set successfully");
      setFetchAttempts(0); // Reset attempts counter on success
    } catch (err) {
      console.error("useProfileData: Exception in profile data fetch:", err);
      setError("An error occurred while loading your profile");
      setFetchAttempts(prev => prev + 1);
      
      // If multiple attempts have failed, show toast
      if (fetchAttempts >= 2) {
        toast.error("Failed to load profile data. Please try refreshing the page.");
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
    fetchProfileData();
  }, [fetchProfileData]);

  return { profileData, isLoading, error, refreshData };
};
