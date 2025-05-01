
import React, { useEffect } from 'react';
import { useUserRole } from '@/hooks/use-user-role';
import ProfileLoadingState from './ProfileLoadingState';
import ProfileErrorDisplay from './ProfileErrorDisplay';
import ProfileFallbackView from './ProfileFallbackView';
import ProfileNoDataView from './ProfileNoDataView';
import { useProfileFetcher } from '@/hooks/use-profile-fetcher';

const ProfileContainer = () => {
  const { isLoggedIn, user: contextUser } = useUserRole();
  const { 
    isLoading, 
    error, 
    userData, 
    profileData, 
    fetchProfileData, 
    handleRetry 
  } = useProfileFetcher();
  
  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);
  
  // Show skeleton during initial load
  if (isLoading && !profileData) {
    return <ProfileLoadingState />;
  }
  
  // Show error state with retry option
  if (error && !profileData) {
    return (
      <ProfileErrorDisplay error={error} onRetry={handleRetry} />
    );
  }
  
  // Show content with whatever data we have
  if (profileData) {
    return (
      <ProfileFallbackView 
        profileData={profileData}
        userData={userData}
        onRetry={handleRetry}
        error={error}
      />
    );
  }
  
  // Fallback for no data state
  return (
    <ProfileNoDataView onRetry={handleRetry} />
  );
};

export default ProfileContainer;
