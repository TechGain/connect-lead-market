
import React from 'react';
import ProfileInfoCard from './ProfileInfoCard';
import ProfileSettingsCard from './ProfileSettingsCard';
import { toast } from 'sonner';

interface ProfileContentProps {
  profileData: {
    name: string;
    email: string;
    company: string;
    rating: number;
    joinedDate: string;
    avatar: string | undefined;
    totalLeads: number;
  };
  role: 'seller' | 'buyer' | null;
}

const ProfileContent = ({ profileData, role }: ProfileContentProps) => {
  // Log to help debug role issues
  console.log("ProfileContent rendered with role:", role);
  
  // If role is null, let's add a more detailed warning but still render the component
  React.useEffect(() => {
    if (role === null) {
      console.warn("Warning: Profile content rendering with null role. User may need to refresh.");
      toast.warning("Your account role could not be determined. Please try refreshing the page.");
    }
  }, [role]);

  // Default to a safe role for display purposes if null
  const displayRole = role || 'user';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <ProfileInfoCard profileData={profileData} role={displayRole} />
      <ProfileSettingsCard role={displayRole} />
    </div>
  );
};

export default ProfileContent;
