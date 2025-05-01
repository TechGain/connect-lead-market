
import React, { useEffect, useState, useCallback } from 'react';
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
  const [loadAttempts, setLoadAttempts] = useState(0);
  
  // Function to fetch profile data with error handling and retries
  const fetchProfileData = useCallback(async () => {
    try {
      console.log("ProfileContainer: Starting profile data fetch (attempt", loadAttempts + 1, ")");
      setIsLoading(true);
      setError(null);
      
      // Get current session - with clear error handling
      const { data: sessionData, error: sessionError } = await Promise.race([
        supabase.auth.getSession(),
        new Promise<{data: null, error: { message: string }}>(
          (_, reject) => setTimeout(() => reject({ data: null, error: { message: "Session fetch timeout" }}), 5000)
        )
      ]) as any;
      
      if (sessionError) {
        console.error("ProfileContainer: Session error:", sessionError);
        setError("Session error: " + sessionError.message);
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
      const { data: profile, error: profileError } = await Promise.race([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle(),
        new Promise<{data: null, error: { message: string }}>(
          (_, reject) => setTimeout(() => reject({ data: null, error: { message: "Profile fetch timeout" }}), 5000)
        )
      ]) as any;
      
      if (profileError) {
        console.error("ProfileContainer: Error fetching profile:", profileError);
        // Create a minimal profile so we can still render something
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
        setError("Profile data issue: " + profileError.message);
        setIsLoading(false);
        return;
      }
      
      console.log("ProfileContainer: Profile data retrieved:", profile);
      
      // Create simplified profile data object with defaults if no profile found
      if (!profile) {
        console.warn("ProfileContainer: No profile found for user:", user.id);
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
          try {
            const { count, error: leadsError } = await supabase
              .from('leads')
              .select('*', { count: 'exact', head: true })
              .eq('seller_id', user.id);
            
            if (!leadsError && count !== null) {
              totalLeads = count;
            }
          } catch (err) {
            console.warn("Error fetching leads count:", err);
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
      
      // Clear error and reset attempts
      setError(null);
      setLoadAttempts(0);
    } catch (err: any) {
      console.error("ProfileContainer: Exception in profile data fetch:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
      setLoadAttempts(prev => prev + 1);
      
      // Create minimum profile data as fallback
      if (userData && !profileData) {
        setProfileData({
          name: userData.email?.split('@')[0] || 'User',
          email: userData.email || '',
          company: 'Not specified',
          role: 'buyer',
          rating: 4.7,
          joinedDate: 'Unknown',
          totalLeads: 0
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate, loadAttempts, userData]);
  
  // Fetch profile data on component mount with retry
  useEffect(() => {
    fetchProfileData();
    
    // Set up automatic retry mechanism
    const retryTimer = setTimeout(() => {
      if (isLoading || error) {
        console.log("ProfileContainer: Automatic retry after timeout");
        fetchProfileData();
      }
    }, 3000); // Retry after 3 seconds if still loading or error
    
    return () => clearTimeout(retryTimer);
  }, [fetchProfileData]);
  
  // Handle retry button click
  const handleRetry = () => {
    toast.info("Retrying profile data fetch...");
    setLoadAttempts(prev => prev + 1);
    fetchProfileData();
  };

  // Return early with minimal UI if still retrying initial load
  if (loadAttempts > 2 && isLoading && !profileData) {
    return (
      <>
        <ProfileHeader error={error} />
        <div className="p-6 border rounded-lg bg-yellow-50 text-center">
          <h3 className="text-xl font-medium text-yellow-700 mb-2">Loading Your Profile</h3>
          <p className="text-yellow-600 mb-4">We're having trouble loading your profile. Please wait a moment...</p>
          <button 
            onClick={handleRetry}
            className="px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700"
          >
            Refresh Now
          </button>
        </div>
      </>
    );
  }
  
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
