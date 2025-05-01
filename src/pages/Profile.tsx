
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
  
  // Log detailed debug information
  useEffect(() => {
    console.log("Profile page render - Auth state:", { 
      isLoggedIn, 
      role, 
      authLoading,
      profileDataLoading: profileLoading,
      hasError: !!error,
      errorMessage: error,
      userId: user?.id
    });
    
    // If user not logged in, redirect to login
    if (!authLoading && !isLoggedIn) {
      toast.error("You must be logged in to view this page");
      navigate('/login');
      return;
    }
  }, [isLoggedIn, role, navigate, authLoading, profileLoading, error, user?.id]);
  
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
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <ProfileHeader error={error} />
        
        {isLoading ? (
          <>
            <ProfileSkeleton />
            <p className="text-center text-gray-500 mt-4">Loading your profile...</p>
          </>
        ) : error ? (
          <ProfileErrorDisplay error={error} />
        ) : (
          <ProfileContent profileData={profileData} role={role} />
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
