
import React from 'react';
import ProfileSkeleton from './ProfileSkeleton';
import ProfileHeader from './ProfileHeader';

const ProfileLoadingState = () => {
  return (
    <>
      <ProfileHeader error={null} />
      <ProfileSkeleton />
      <div className="text-center mt-4">
        <p className="text-gray-500 mb-2">Loading your profile...</p>
      </div>
    </>
  );
};

export default ProfileLoadingState;
