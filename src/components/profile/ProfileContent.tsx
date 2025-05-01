
import React, { useEffect } from 'react';
import ProfileInfoCard from './ProfileInfoCard';
import ProfileSettingsCard from './ProfileSettingsCard';
import { toast } from 'sonner';
import { useUserRole } from '@/hooks/use-user-role';

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
  // Get refresh function from context
  const { refreshUserRole } = useUserRole();
  
  // Log to help debug role issues
  console.log("ProfileContent rendered with role:", role);
  
  // If role is null, let's add a more detailed warning and try to fix it
  useEffect(() => {
    if (role === null) {
      console.warn("Warning: Profile content rendering with null role. User may need to refresh.");
      toast.warning("Your account role could not be determined. Attempting to fix...");
      
      // Attempt to fix the role automatically
      setTimeout(() => {
        refreshUserRole();
      }, 1000);
    }
  }, [role, refreshUserRole]);

  // Default to a safe role for display purposes if null
  const displayRole = role || 'buyer';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <ProfileInfoCard profileData={profileData} role={displayRole as 'seller' | 'buyer'} />
      <ProfileSettingsCard role={displayRole as 'seller' | 'buyer'} />
      
      {role === null && (
        <div className="lg:col-span-3 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-center">
          <p className="text-yellow-700 mb-2">We're having trouble detecting your account role. Click the refresh button in the warning banner above to fix this issue.</p>
        </div>
      )}
    </div>
  );
};

export default ProfileContent;
