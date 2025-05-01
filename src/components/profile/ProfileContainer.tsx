
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useUserRole } from '@/hooks/use-user-role';
import { useProfileData } from '@/hooks/use-profile-data';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileSkeleton from '@/components/profile/ProfileSkeleton';
import ProfileErrorDisplay from '@/components/profile/ProfileErrorDisplay';
import ProfileContent from '@/components/profile/ProfileContent';

const ProfileContainer = () => {
  const navigate = useNavigate();
  const { isLoggedIn, role, isLoading: authLoading } = useUserRole();
  const { profileData, isLoading: profileLoading, error, refreshData } = useProfileData();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // Debug log for tracking auth state
  useEffect(() => {
    console.log("ProfileContainer - Auth state:", { 
      isLoggedIn, 
      role, 
      authLoading,
      profileLoading,
      hasError: !!error
    });
  }, [isLoggedIn, role, authLoading, profileLoading, error]);
  
  // If user not logged in, redirect to login
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      toast.error("You must be logged in to view this page");
      navigate('/login');
    }
  }, [isLoggedIn, navigate, authLoading]);
  
  // Set a timeout to prevent infinite loading state
  useEffect(() => {
    if (profileLoading) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
      }, 5000); // 5 second timeout
      
      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [profileLoading]);
  
  // Combined loading state
  const isLoading = authLoading || profileLoading;
  
  // Force retry if taking too long
  const handleForceRetry = () => {
    refreshData();
    toast.info("Retrying profile data fetch...");
  };
  
  return (
    <>
      <ProfileHeader error={error} />
      
      {isLoading ? (
        <>
          <ProfileSkeleton />
          <div className="text-center mt-4">
            <p className="text-gray-500 mb-2">Loading your profile...</p>
            
            {loadingTimeout && (
              <div className="mt-3">
                <p className="text-amber-600 text-sm mb-2">This is taking longer than expected.</p>
                <button 
                  onClick={handleForceRetry}
                  className="text-sm px-3 py-1 bg-brand-100 text-brand-700 rounded-md hover:bg-brand-200"
                >
                  Retry Now
                </button>
              </div>
            )}
          </div>
        </>
      ) : error ? (
        <ProfileErrorDisplay error={error} />
      ) : (
        <ProfileContent 
          profileData={profileData} 
          role={role}
        />
      )}
    </>
  );
};

export default ProfileContainer;
