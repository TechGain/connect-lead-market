
import React from 'react';
import { Button } from '@/components/ui/button';

interface LoadingStateProps {
  onRefresh: () => void;
}

const LoadingState: React.FC<LoadingStateProps> = ({ onRefresh }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
      <h2 className="text-2xl font-bold mb-2">Loading Your Leads...</h2>
      <p className="text-gray-600 mb-4">Please wait while we verify your account...</p>
      <Button onClick={onRefresh} variant="outline">Refresh</Button>
    </div>
  );
};

export default LoadingState;
