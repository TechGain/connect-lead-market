
import React from 'react';
import ProfileInfoCard from './ProfileInfoCard';
import ProfileSettingsCard from './ProfileSettingsCard';
import { toast } from 'sonner';

interface ProfileContentProps {
  profileData: {
    name: string;
    email: string;
    company: string;
    role: string;
    rating: number;
    joinedDate: string;
    totalLeads: number;
  };
  userData: any;
  refreshProfile: () => void;
}

const ProfileContent = ({ profileData, userData, refreshProfile }: ProfileContentProps) => {
  // Convert role string to expected type, with safe default
  const normalizedRole = profileData?.role?.toLowerCase() === 'seller' ? 'seller' : 'buyer';
  
  // Early return with error message if no profile data
  if (!profileData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Unable to load profile data.</p>
        <button
          onClick={refreshProfile}
          className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700"
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <ProfileInfoCard 
        profileData={{
          ...profileData,
          avatar: undefined // No avatar support yet
        }} 
        role={normalizedRole}
        onRefresh={() => {
          refreshProfile();
          toast.info("Refreshing profile data...");
        }}
      />
      <ProfileSettingsCard role={normalizedRole} />
    </div>
  );
};

export default ProfileContent;
