
import React from 'react';
import { Button } from '@/components/ui/button';

interface ProfileErrorDisplayProps {
  error: string;
}

const ProfileErrorDisplay = ({ error }: ProfileErrorDisplayProps) => {
  return (
    <div className="p-6 border rounded-lg bg-red-50 text-center">
      <h3 className="text-xl font-medium text-red-700 mb-2">Error Loading Profile</h3>
      <p className="text-red-600 mb-4">{error}</p>
      <Button onClick={() => window.location.reload()}>Try Again</Button>
    </div>
  );
};

export default ProfileErrorDisplay;
