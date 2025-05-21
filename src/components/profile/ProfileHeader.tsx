
import React from 'react';
import { useUserRole } from '@/hooks/use-user-role';
import { Button } from '@/components/ui/button';
import { RefreshCw, WifiOff } from 'lucide-react';

interface ProfileHeaderProps {
  error: string | null;
  isOffline?: boolean;
}

const ProfileHeader = ({ error, isOffline = false }: ProfileHeaderProps) => {
  const { isLoggedIn, role, user, refreshRole } = useUserRole();
  
  // Detect connection issues from error message or offline status
  const hasConnectionIssue = isOffline || 
                            error?.toLowerCase().includes('connection') || 
                            error?.toLowerCase().includes('timeout') ||
                            error?.toLowerCase().includes('limited');
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            My Profile
            {isOffline && (
              <span className="ml-2 text-sm bg-yellow-100 text-yellow-800 py-1 px-2 rounded-full">
                Offline Mode
              </span>
            )}
          </h1>
          <p className="text-gray-600">
            Manage your account information and settings
            {hasConnectionIssue && (
              <span className="ml-2 inline-flex items-center text-yellow-600 text-sm">
                <WifiOff className="h-3 w-3 mr-1" /> 
                {isOffline ? "Offline mode active" : "Limited connectivity"}
              </span>
            )}
          </p>
        </div>
        
        {isLoggedIn && !isOffline && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshRole}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        )}
      </div>
      
      {/* Debug info - only visible in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
          <p>User ID: {user?.id || 'Not logged in'}</p>
          <p>Role from context: {role || 'None'}</p>
          <p>Logged in: {isLoggedIn ? 'Yes' : 'No'}</p>
          <p>Offline mode: {isOffline ? 'Yes' : 'No'}</p>
          {error && <p className="text-red-500">Error: {error}</p>}
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;
