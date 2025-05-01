
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/use-user-role';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileSkeleton from '@/components/profile/ProfileSkeleton';
import ProfileErrorDisplay from '@/components/profile/ProfileErrorDisplay';
import ProfileContent from '@/components/profile/ProfileContent';
import { useProfileData } from '@/hooks/use-profile-data';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ReloadIcon } from '@radix-ui/react-icons';

const Profile = () => {
  const navigate = useNavigate();
  const { isLoggedIn, role, isLoading: authLoading, user, refreshUserRole } = useUserRole();
  const { profileData, isLoading: profileLoading, error, refreshData } = useProfileData();
  const [hasAttemptedReload, setHasAttemptedReload] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // Log detailed debug information
  useEffect(() => {
    console.log("Profile page render - Auth state:", { 
      isLoggedIn, 
      role, 
      authLoading,
      profileDataLoading: profileLoading,
      hasError: !!error,
      errorMessage: error,
      userId: user?.id,
    });
    
    // Force a timeout to proceed even if authentication is taking too long
    const timer = setTimeout(() => {
      if ((authLoading || profileLoading) && !loadingTimeout) {
        console.log("Loading is taking too long, marking timeout");
        setLoadingTimeout(true);
      }
    }, 5000); // 5 seconds timeout
    
    return () => clearTimeout(timer);
  }, [isLoggedIn, role, authLoading, profileLoading, error, user?.id, loadingTimeout]);
  
  // If user not logged in, redirect to login
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      toast.error("You must be logged in to view this page");
      navigate('/login');
    }
  }, [isLoggedIn, navigate, authLoading]);
  
  const handleRefresh = () => {
    setHasAttemptedReload(true);
    refreshUserRole();
    if (refreshData) refreshData();
    toast.info("Refreshing profile data...");
  };

  // Combined loading state
  const isLoading = (authLoading || profileLoading) && !loadingTimeout;
  
  // If we're logged in but still don't have a role after reload attempt,
  // or loading takes too long, let's render the profile anyway with a default role
  const shouldProceedAnyway = (isLoggedIn && (role === null || loadingTimeout));
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <ProfileHeader error={error} />
        
        {isLoading && !shouldProceedAnyway ? (
          <>
            <ProfileSkeleton />
            <p className="text-center text-gray-500 mt-4">Loading your profile...</p>
          </>
        ) : error ? (
          <>
            <ProfileErrorDisplay error={error} />
            <div className="flex justify-center mt-4">
              <Button onClick={handleRefresh} className="flex items-center gap-2">
                <ReloadIcon className="h-4 w-4" />
                Refresh Profile
              </Button>
            </div>
          </>
        ) : (
          <>
            <ProfileContent 
              profileData={profileData} 
              role={role || 'buyer'} // Fallback to 'buyer' if role is null
            />
            
            {role === null && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-700 mb-2">Your account role couldn't be determined. Some features may be limited.</p>
                <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
                  <ReloadIcon className="h-4 w-4" />
                  Refresh Role Information
                </Button>
              </div>
            )}
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
