
import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-12">
      <Loader2 className="h-8 w-8 animate-spin mr-2" />
      <p>Loading your purchases...</p>
    </div>
  );
};

export default LoadingState;
