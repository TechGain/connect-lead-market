
import React from 'react';
import ProfileHeader from './ProfileHeader';
import ProfileContent from './ProfileContent';
import { ProfileData } from '@/hooks/use-simple-profile';

interface ProfileFallbackViewProps {
  profileData: ProfileData;
  userData?: any;
  onRetry: () => void;
  error: string | null;
  isOffline?: boolean;
}

const ProfileFallbackView = ({ 
  profileData, 
  userData, 
  onRetry, 
  error,
  isOffline = false
}: ProfileFallbackViewProps) => {
  return (
    <>
      <ProfileHeader error={error} isOffline={isOffline} />
      <ProfileContent
        profileData={profileData}
        userData={userData}
        refreshProfile={onRetry}
        isOffline={isOffline}
      />
    </>
  );
};

export default ProfileFallbackView;
