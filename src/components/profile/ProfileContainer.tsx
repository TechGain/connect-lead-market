
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileSkeleton from '@/components/profile/ProfileSkeleton';
import ProfileErrorDisplay from '@/components/profile/ProfileErrorDisplay';
import ProfileContent from '@/components/profile/ProfileContent';

const ProfileContainer = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  
  // Direct fetch of both user session and profile data
  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("ProfileContainer: Fetching user session and profile data");
      
      // Get current session - WITHOUT a race condition timeout
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("ProfileContainer: Session error:", sessionError);
        setError("Authentication error: " + sessionError.message);
        setIsLoading(false);
        return;
      }
      
      if (!sessionData?.session?.user) {
        console.log("ProfileContainer: No authenticated user found");
        setError("You must be logged in to view this page");
        toast.error("You must be logged in to view this page");
        navigate('/login');
        setIsLoading(false);
        return;
      }
      
      const user = sessionData.session.user;
      console.log("ProfileContainer: User found:", user.id);
      setUserData(user);
      
      // Get profile from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profileError) {
        console.error("ProfileContainer: Error fetching profile:", profileError);
        setError("Failed to load profile data: " + profileError.message);
        setIsLoading(false);
        return;
      }
      
      console.log("ProfileContainer: Profile data retrieved:", profile);
      
      if (!profile) {
        console.warn("ProfileContainer: No profile found for user:", user.id);
        // Create simplified profile data object with defaults
        setProfileData({
          name: user.email?.split('@')[0] || 'User',
          email: user.email || '',
          company: 'Not specified',
          role: 'buyer', // Default role
          rating: 4.7,
          joinedDate: new Date(user.created_at || Date.now()).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
          }),
          totalLeads: 0
        });
      } else {
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
          
          if (!leadsError && count !== null) {
            totalLeads = count;
          }
        }
        
        // Set complete profile data
        setProfileData({
          name: profile?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          company: profile?.company || 'Not specified',
          role: profile?.role?.toLowerCase() || 'buyer',
          rating: profile?.rating || 4.7,
          joinedDate,
          totalLeads
        });
      }
    } catch (err: any) {
      console.error("ProfileContainer: Exception in profile data fetch:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfileData();
  }, [navigate]);
  
  // Handle retry button click
  const handleRetry = () => {
    toast.info("Retrying profile data fetch...");
    fetchProfileData();
  };
  
  return (
    <>
      <ProfileHeader error={error} />
      
      {isLoading ? (
        <>
          <ProfileSkeleton />
          <div className="text-center mt-4">
            <p className="text-gray-500 mb-2">Loading your profile...</p>
          </div>
        </>
      ) : error ? (
        <ProfileErrorDisplay error={error} onRetry={handleRetry} />
      ) : profileData ? (
        <ProfileContent 
          profileData={profileData} 
          userData={userData}
          refreshProfile={handleRetry}
        />
      ) : (
        <div className="text-center py-8">
          <p>No profile data available.</p>
          <button 
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700"
          >
            Refresh
          </button>
        </div>
      )}
    </>
  );
};

export default ProfileContainer;
