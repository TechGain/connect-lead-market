
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface LoadingStateProps {
  onRefresh: () => void;
}

const LoadingState = ({ onRefresh }: LoadingStateProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="mb-2">Checking permissions...</p>
        <p className="text-sm text-gray-500 mb-4">
          If this takes too long, try refreshing the page
        </p>
        <Button variant="outline" onClick={onRefresh} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      <Footer />
    </div>
  );
};

export default LoadingState;
