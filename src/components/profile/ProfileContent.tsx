
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
  // Make sure we have valid data - provide defaults as needed
  const safeProfileData = {
    name: profileData?.name || 'User',
    email: profileData?.email || 'No email available',
    company: profileData?.company || 'Not specified',
    role: profileData?.role || 'buyer',
    rating: profileData?.rating || 4.5,
    joinedDate: profileData?.joinedDate || 'Unknown',
    totalLeads: profileData?.totalLeads || 0
  };
  
  // Convert role string to expected type, with safe default
  const normalizedRole = safeProfileData.role?.toLowerCase() === 'seller' ? 'seller' : 'buyer';
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <ProfileInfoCard 
        profileData={{
          ...safeProfileData,
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
