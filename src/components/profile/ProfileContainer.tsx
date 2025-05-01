
import React from 'react';
import { useUserRole } from '@/hooks/use-user-role';
import ProfileLoadingState from './ProfileLoadingState';
import ProfileErrorDisplay from './ProfileErrorDisplay';
import ProfileFallbackView from './ProfileFallbackView';
import ProfileNoDataView from './ProfileNoDataView';
import { useSimpleProfile } from '@/hooks/use-simple-profile';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, WifiOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfileContainerProps {
  isOffline?: boolean;
}

const ProfileContainer = ({ isOffline = false }: ProfileContainerProps) => {
  const { isLoggedIn } = useUserRole();
  const { 
    isLoading, 
    error, 
    profileData, 
    refreshProfile
  } = useSimpleProfile(isOffline);
  
  // Show skeleton during initial load, but only if we're not in offline mode
  if (isLoading && !profileData && !isOffline) {
    return <ProfileLoadingState />;
  }
  
  // Show error state with retry option
  if (error && !profileData) {
    return (
      <ProfileErrorDisplay 
        error={error} 
        onRetry={refreshProfile} 
        isOffline={isOffline}
      />
    );
  }
  
  // Show content with whatever data we have
  if (profileData) {
    // Show connection issue warning if needed but still display profile
    return (
      <>
        {isOffline && (
          <Alert className="mb-6 bg-yellow-50 border-yellow-200">
            <AlertTitle className="text-yellow-800 flex items-center gap-2">
              <WifiOff className="h-4 w-4" /> Offline Mode
            </AlertTitle>
            <AlertDescription className="text-yellow-700">
              <p className="mb-2">
                You're currently offline. Your profile shows cached data and some features may be unavailable.
              </p>
            </AlertDescription>
          </Alert>
        )}
        <ProfileFallbackView 
          profileData={profileData}
          userData={null} // Not needed with the new approach
          onRetry={refreshProfile}
          error={error}
          isOffline={isOffline}
        />
      </>
    );
  }
  
  // Fallback for no data state
  return (
    <ProfileNoDataView onRetry={refreshProfile} isOffline={isOffline} />
  );
};

export default ProfileContainer;
