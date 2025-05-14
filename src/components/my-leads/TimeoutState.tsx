
import React from 'react';
import { Button } from '@/components/ui/button';

interface TimeoutStateProps {
  onRefresh: () => void;
}

const TimeoutState: React.FC<TimeoutStateProps> = ({ onRefresh }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <div className="bg-amber-100 p-6 rounded-lg border border-amber-200 max-w-md">
        <h2 className="text-xl font-bold mb-4">Taking longer than expected</h2>
        <p className="text-gray-700 mb-4">
          We're having trouble verifying your account. Please try refreshing or check your internet connection.
        </p>
        <Button onClick={onRefresh}>Refresh Now</Button>
      </div>
    </div>
  );
};

export default TimeoutState;
