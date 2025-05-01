
import React from 'react';
import ProfileSkeleton from './ProfileSkeleton';
import ProfileHeader from './ProfileHeader';
import { Loader2 } from 'lucide-react';

const ProfileLoadingState = () => {
  return (
    <>
      <ProfileHeader error={null} />
      <ProfileSkeleton />
      <div className="text-center mt-4">
        <div className="inline-flex items-center gap-2 text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p>Loading your profile...</p>
        </div>
        <p className="text-xs text-gray-400 mt-1">This may take a few moments</p>
      </div>
    </>
  );
};

export default ProfileLoadingState;
