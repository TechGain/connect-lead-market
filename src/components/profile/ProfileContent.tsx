
import React, { useEffect } from 'react';
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
  // Make sure we have valid data with strict fallback values
  const safeProfileData = {
    name: profileData?.name || 'User',
    email: profileData?.email || 'No email available',
    company: profileData?.company || 'Not specified',
    role: profileData?.role || 'buyer',
    rating: Number(profileData?.rating || 4.5),
    joinedDate: profileData?.joinedDate || 'Unknown',
    totalLeads: Number(profileData?.totalLeads || 0)
  };
  
  // Convert role string to expected type, with safe default
  const normalizedRole = (safeProfileData.role?.toLowerCase() === 'seller') ? 'seller' : 'buyer';
  
  // Handle refresh with visual feedback
  const handleRefresh = () => {
    refreshProfile();
    toast.info("Refreshing profile data...");
  };
  
  // Auto-retry once if using limited data
  useEffect(() => {
    if (profileData && !profileData.company && profileData.name) {
      // We have some data but it might be incomplete - quietly try to refresh once
      const timer = setTimeout(() => {
        console.log("ProfileContent: Detected limited data, auto-refreshing...");
        refreshProfile();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [profileData, refreshProfile]);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <ProfileInfoCard 
        profileData={{
          ...safeProfileData,
          avatar: undefined // No avatar support yet
        }} 
        role={normalizedRole}
        onRefresh={handleRefresh}
      />
      <ProfileSettingsCard role={normalizedRole} />
    </div>
  );
};

export default ProfileContent;
