
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
  // Convert role string to expected type
  const normalizedRole = profileData.role?.toLowerCase() === 'seller' ? 'seller' : 'buyer';
  
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
