
import React from 'react';
import { useUserRole } from '@/hooks/use-user-role';

interface ProfileHeaderProps {
  error: string | null;
}

const ProfileHeader = ({ error }: ProfileHeaderProps) => {
  const { isLoggedIn, role, user } = useUserRole();
  
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold mb-2">My Profile</h1>
      <p className="text-gray-600">
        Manage your account information and settings
      </p>
      
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
