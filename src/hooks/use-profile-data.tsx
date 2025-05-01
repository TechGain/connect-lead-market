
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
  
  // Simplified direct fetch function
  const fetchProfileData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("useProfileData: Fetching profile data directly");
      
      // Get current session
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData?.session?.user) {
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
        .single();
      
      if (profileError) {
        console.error("useProfileData: Error fetching profile:", profileError);
        setError("Failed to load profile data");
        return;
      }
      
      console.log("useProfileData: Profile data retrieved:", profile);
      
      // Format registration date
      const registrationDate = new Date(user.created_at);
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
        
        if (!leadsError && count !== null) {
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
    } catch (err) {
      console.error("useProfileData: Exception in profile data fetch:", err);
      setError("An error occurred while loading your profile");
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // Public method for manual refresh
  const refreshData = useCallback(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  return { profileData, isLoading, error, refreshData };
};
