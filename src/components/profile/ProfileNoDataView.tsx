
import React from 'react';
import ProfileHeader from './ProfileHeader';

interface ProfileNoDataViewProps {
  onRetry: () => void;
}

const ProfileNoDataView = ({ onRetry }: ProfileNoDataViewProps) => {
  return (
    <>
      <ProfileHeader error={null} />
      <div className="text-center py-8 border rounded-lg bg-yellow-50">
        <p className="text-yellow-800 mb-4">No profile data available.</p>
        <button 
          onClick={onRetry}
          className="px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700"
        >
          Refresh
        </button>
      </div>
    </>
  );
};

export default ProfileNoDataView;
