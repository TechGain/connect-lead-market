
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import ProfileContent from './ProfileContent';
import NotificationPreferences from './NotificationPreferences';
import { formatPhoneToE164 } from '@/utils/format-helpers';

interface ProfileFallbackViewProps {
  profileData: any;
  userData: any;
  onRetry: () => void;
  error: string | null;
  isOffline?: boolean;
}

const ProfileFallbackView = ({ 
  profileData, 
  userData,
  onRetry, 
  error, 
  isOffline = false 
}: ProfileFallbackViewProps) => {
  // Use phone from either auth.users.phone or profile.phone, preferring the profile value
  const phoneNumber = profileData?.phone || userData?.phone;
  
  // Format the phone number for display purposes
  const formattedPhone = phoneNumber ? formatPhoneToE164(phoneNumber) : null;

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-amber-800">
                Warning: Using backup data
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                {error}. Showing limited information.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 bg-white"
                onClick={onRetry}
                disabled={isOffline}
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <ProfileContent 
        profileData={profileData}
        userData={userData}
        refreshProfile={onRetry}
        isOffline={isOffline}
        role={profileData.role || 'buyer'}
      />

      {userData?.id && !isOffline && (
        <div className="mt-6">
          <NotificationPreferences 
            userPhone={formattedPhone || phoneNumber} 
            userEmail={userData.email}
          />
        </div>
      )}
    </div>
  );
};

export default ProfileFallbackView;
