
import React from 'react';
import ProfileInfoCard from './ProfileInfoCard';
import ProfileSettingsCard from './ProfileSettingsCard';
import { toast } from 'sonner';

interface ProfileData {
  name: string;
  email: string;
  company: string;
  rating: number;
  joinedDate: string;
  totalLeads: number;
}

interface ProfileContentProps {
  profileData: ProfileData;
  userData?: any;
  refreshProfile: () => void;
  isOffline?: boolean;
  role: 'seller' | 'buyer';
}

const ProfileContent = ({ 
  profileData, 
  refreshProfile, 
  isOffline = false,
  role
}: ProfileContentProps) => {
  // Handle refresh with visual feedback
  const handleRefresh = () => {
    if (isOffline) {
      toast.warning("You're currently offline. Please check your connection first.");
      return;
    }
    
    refreshProfile();
    toast.info("Refreshing profile data...");
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <ProfileInfoCard 
        profileData={{
          ...profileData,
          avatar: undefined // No avatar support yet
        }} 
        role={role}
        onRefresh={handleRefresh}
        isOffline={isOffline}
      />
      <ProfileSettingsCard 
        role={role} 
        disabled={isOffline}
      />
    </div>
  );
};

export default ProfileContent;
