
import React from 'react';
import ProfileHeader from './ProfileHeader';
import ProfileContent from './ProfileContent';

interface ProfileData {
  name: string;
  email: string;
  company: string;
  role: 'seller' | 'buyer';
  rating: number;
  joinedDate: string;
  totalLeads: number;
}

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
  // Ensure the role is properly typed
  const safeRole = profileData.role === 'seller' ? 'seller' : 'buyer';
  
  return (
    <>
      <ProfileHeader error={error} isOffline={isOffline} />
      <ProfileContent
        profileData={profileData}
        userData={userData}
        refreshProfile={onRetry}
        isOffline={isOffline}
        role={safeRole}
      />
    </>
  );
};

export default ProfileFallbackView;
