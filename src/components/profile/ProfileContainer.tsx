
import React from 'react';
import { useUserRole } from '@/hooks/use-user-role';
import ProfileLoadingState from './ProfileLoadingState';
import ProfileErrorDisplay from './ProfileErrorDisplay';
import ProfileFallbackView from './ProfileFallbackView';
import ProfileNoDataView from './ProfileNoDataView';
import { useProfileFetcher } from '@/hooks/use-profile-fetcher';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, WifiOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfileContainerProps {
  isOffline?: boolean;
}

const ProfileContainer = ({ isOffline = false }: ProfileContainerProps) => {
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
  
  // If we're offline, prioritize showing cached data
  const showCachedMessage = isOffline || connectionIssue;
  
  // Show skeleton during initial load, but only if we're not in offline mode
  if (isLoading && !profileData && !isOffline) {
    return <ProfileLoadingState />;
  }
  
  // Show error state with retry option
  if (error && !profileData) {
    return (
      <ProfileErrorDisplay 
        error={error} 
        onRetry={handleRetry} 
        isOffline={isOffline}
      />
    );
  }
  
  // Show content with whatever data we have
  if (profileData) {
    // Show connection issue warning if needed but still display profile
    return (
      <>
        {showCachedMessage && (
          <Alert className="mb-6 bg-yellow-50 border-yellow-200">
            <AlertTitle className="text-yellow-800 flex items-center gap-2">
              <WifiOff className="h-4 w-4" /> {isOffline ? "Offline Mode" : "Connection Issues Detected"}
            </AlertTitle>
            <AlertDescription className="text-yellow-700">
              <p className="mb-2">
                {isOffline 
                  ? "You're currently offline. Your profile shows cached data and some features may be unavailable."
                  : "We're having trouble connecting to the database. Your profile may show limited information."
                }
              </p>
              {!isOffline && (
                <div className="mt-3 space-x-2">
                  <Button variant="outline" size="sm" onClick={handleRetry} className="bg-white">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry Connection
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-white" 
                    onClick={() => window.location.reload()}
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Reload Page
                  </Button>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
        <ProfileFallbackView 
          profileData={profileData}
          userData={userData}
          onRetry={handleRetry}
          error={error}
          isOffline={isOffline}
        />
      </>
    );
  }
  
  // Fallback for no data state
  return (
    <ProfileNoDataView onRetry={handleRetry} isOffline={isOffline} />
  );
};

export default ProfileContainer;
