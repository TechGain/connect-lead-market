
import { useState, useEffect } from 'react';
import { useUserRole } from '@/hooks/use-user-role';
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
  const { isLoggedIn, role, user, isLoading: authLoading } = useUserRole();
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
  const [retryCount, setRetryCount] = useState(0);
  
  useEffect(() => {
    console.log("useProfileData effect running - Auth state:", { 
      isLoggedIn, 
      role, 
      userId: user?.id,
      authLoading,
      retryCount
    });
    
    // Don't try to fetch data while auth is still loading
    if (authLoading) {
      console.log("Auth still loading, waiting before fetching profile data");
      return;
    }
    
    if (!isLoggedIn) {
      console.error("User not logged in, can't fetch profile");
      setError("Not authenticated");
      setIsLoading(false);
      return;
    }
    
    // Fetch real profile data
    const fetchProfileData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("Fetching profile data for user:", user?.id);
        
        if (!user) {
          throw new Error("User not found");
        }
        
        // Get profile data from Supabase
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error("Error fetching profile:", error);
          throw error;
        }
        
        console.log("Profile data retrieved:", profile);
        
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
          
          if (!leadsError) {
            totalLeads = count || 0;
          }
        }

        // Log the exact role information we're getting
        console.log("Role information:", { 
          profileRole: profile?.role,
          contextRole: role,
          profileObject: profile 
        });
        
        // Update profile data state
        setProfileData({
          name: profile?.full_name || 'User',
          email: user.email || '',
          company: profile?.company || 'Not specified',
          rating: profile?.rating || 4.7,
          joinedDate,
          avatar: undefined,
          totalLeads
        });
      } catch (error: any) {
        console.error("Failed to load profile data:", error);
        setError(error.message || "Failed to load profile data");
        
        // If we've tried a few times and still can't get the data, show a more helpful message
        if (retryCount > 2) {
          toast.error("There seems to be an issue with your profile. Please try logging out and back in.");
        } else {
          toast.error("Failed to load profile data");
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user?.id) {
      fetchProfileData();
    } else {
      // If no user ID, but we're logged in according to the context
      // This is a strange state, so we should retry a few times
      setIsLoading(false);
      if (isLoggedIn && !user?.id && retryCount < 3) {
        console.log("User is logged in but no user ID available, retrying soon...");
        const timer = setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 1000); // Wait 1 second before retrying
        
        return () => clearTimeout(timer);
      } else {
        setError("No user ID available");
      }
    }
  }, [isLoggedIn, user, role, retryCount, authLoading]);

  return { profileData, isLoading, error };
};
