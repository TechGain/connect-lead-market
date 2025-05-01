
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
  const { isLoggedIn, role, user } = useUserRole();
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
  
  useEffect(() => {
    console.log("Profile page - Current auth state:", { isLoggedIn, role, userId: user?.id });
    
    if (!isLoggedIn) {
      toast.error("You must be logged in to view your profile");
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
        if (profile?.role === 'seller') {
          const { count, error: leadsError } = await supabase
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .eq('seller_id', user.id);
          
          if (!leadsError) {
            totalLeads = count || 0;
          }
        }

        // Let's log the exact role information we're getting
        console.log("Role from profile:", { 
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
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user?.id) {
      fetchProfileData();
    } else {
      setIsLoading(false);
      setError("No user ID available");
    }
  }, [isLoggedIn, user, role]);

  return { profileData, isLoading, error };
};
