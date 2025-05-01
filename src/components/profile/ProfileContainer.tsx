
import React from 'react';
import { useUserRole } from '@/hooks/use-user-role';
import ProfileLoadingState from './ProfileLoadingState';
import ProfileErrorDisplay from './ProfileErrorDisplay';
import ProfileFallbackView from './ProfileFallbackView';
import ProfileNoDataView from './ProfileNoDataView';
import { useProfileFetcher } from '@/hooks/use-profile-fetcher';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProfileContainer = () => {
  const { isLoggedIn, user: contextUser } = useUserRole();
  const { 
    isLoading, 
    error, 
    userData, 
    profileData, 
    fetchProfileData, 
    handleRetry,
    connectionIssue
  } = useProfileFetcher();
  
  // Show skeleton during initial load
  if (isLoading && !profileData) {
    return <ProfileLoadingState />;
  }
  
  // Show error state with retry option
  if (error && !profileData) {
    return (
      <ProfileErrorDisplay error={error} onRetry={handleRetry} />
    );
  }
  
  // Show content with whatever data we have
  if (profileData) {
    // Show connection issue warning if needed but still display profile
    return (
      <>
        {connectionIssue && (
          <Alert className="mb-6 bg-yellow-50 border-yellow-200">
            <AlertTitle className="text-yellow-800 flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Connection Issues Detected
            </AlertTitle>
            <AlertDescription className="text-yellow-700">
              We're having trouble maintaining a stable connection. Your profile may show limited information.
              <div className="mt-2">
                <Button variant="outline" size="sm" onClick={handleRetry} className="bg-white">
                  Retry Connection
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        <ProfileFallbackView 
          profileData={profileData}
          userData={userData}
          onRetry={handleRetry}
          error={error}
        />
      </>
    );
  }
  
  // Fallback for no data state
  return (
    <ProfileNoDataView onRetry={handleRetry} />
  );
};

export default ProfileContainer;
