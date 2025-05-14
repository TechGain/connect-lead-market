
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface RoleErrorStateProps {
  onRefresh: () => void;
}

const RoleErrorState = ({ onRefresh }: RoleErrorStateProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
        <p className="text-lg font-medium mb-2">Unable to Determine Role</p>
        <p className="text-sm text-gray-500 mb-6 max-w-md text-center">
          We were unable to determine your role. Please try logging out and logging back in. If the issue persists, contact support.
        </p>
        <Button onClick={onRefresh} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      <Footer />
    </div>
  );
};

export default RoleErrorState;
