
import React from 'react';
import { Button } from '@/components/ui/button';

interface RoleErrorStateProps {
  onRefresh: () => void;
}

const RoleErrorState: React.FC<RoleErrorStateProps> = ({ onRefresh }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <div className="bg-red-100 p-6 rounded-lg border border-red-200 max-w-md">
        <h2 className="text-xl font-bold mb-4">Account Error</h2>
        <p className="text-gray-700 mb-4">
          We couldn't determine your user role. You may not have the correct permissions to view this page.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={onRefresh}>Refresh Access</Button>
        </div>
      </div>
    </div>
  );
};

export default RoleErrorState;
