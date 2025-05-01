
import React from 'react';
import { useUserRole } from '@/hooks/use-user-role';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface ProfileHeaderProps {
  error: string | null;
}

const ProfileHeader = ({ error }: ProfileHeaderProps) => {
  const { isLoggedIn, role, user, refreshUserRole } = useUserRole();
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-gray-600">
            Manage your account information and settings
          </p>
        </div>
        
        {isLoggedIn && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshUserRole}
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
          {error && <p className="text-red-500">Error: {error}</p>}
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;
