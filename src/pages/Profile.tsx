
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

const Profile = () => {
  const navigate = useNavigate();
  const { isLoggedIn, role, isLoading: authLoading, user } = useUserRole();
  const { profileData, isLoading: profileLoading, error } = useProfileData();
  const [hasAttemptedReload, setHasAttemptedReload] = useState(false);
  const [forceRender, setForceRender] = useState(0); // Used to force re-renders
  
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
      forceRender
    });
    
    // Force a timeout to proceed even if authentication is taking too long
    const timer = setTimeout(() => {
      if (authLoading && !hasAttemptedReload) {
        console.log("Auth is taking too long, forcing re-render");
        setForceRender(prev => prev + 1);
      }
    }, 3000); // 3 seconds timeout
    
    // If user not logged in, redirect to login
    if (!authLoading && !isLoggedIn) {
      toast.error("You must be logged in to view this page");
      navigate('/login');
      return () => clearTimeout(timer);
    }
    
    return () => clearTimeout(timer);
  }, [isLoggedIn, role, navigate, authLoading, profileLoading, error, user?.id, forceRender, hasAttemptedReload]);
  
  // If we have role issues, attempt one reload
  useEffect(() => {
    if (!authLoading && isLoggedIn && role === null && !hasAttemptedReload) {
      console.log("Profile detected missing role, attempting to refresh...");
      setHasAttemptedReload(true);
      toast.info("Your account role couldn't be determined. Refreshing the page...");
      
      // Wait a moment to ensure all state is settled
      const timer = setTimeout(() => {
        window.location.reload();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, role, authLoading, hasAttemptedReload]);

  // Combined loading state
  const isLoading = authLoading || profileLoading;
  
  // If we're logged in but still don't have a role after reload attempt,
  // let's render the profile anyway with a default role
  const shouldProceedAnyway = isLoggedIn && role === null && hasAttemptedReload;
  
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
          <ProfileErrorDisplay error={error} />
        ) : (
          <ProfileContent 
            profileData={profileData} 
            role={role || 'buyer'} // Fallback to 'buyer' if role is null
          />
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
