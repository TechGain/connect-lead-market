
import React from 'react';
import ProfileHeader from './ProfileHeader';
import ProfileContent from './ProfileContent';

interface ProfileFallbackViewProps {
  profileData: any;
  userData: any;
  onRetry: () => void;
  error: string | null;
}

const ProfileFallbackView = ({ profileData, userData, onRetry, error }: ProfileFallbackViewProps) => {
  return (
    <>
      <ProfileHeader error={error} />
      <ProfileContent
        profileData={profileData}
        userData={userData}
        refreshProfile={onRetry}
      />
    </>
  );
};

export default ProfileFallbackView;
