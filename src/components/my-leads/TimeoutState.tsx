
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';

interface TimeoutStateProps {
  onRefresh: () => void;
}

const TimeoutState = ({ onRefresh }: TimeoutStateProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg font-medium mb-2">Permission Check Timed Out</p>
        <p className="text-sm text-gray-500 mb-6 max-w-md text-center">
          We couldn't determine your account role. You can try manually refreshing or continue to My Leads.
        </p>
        <div className="flex gap-4">
          <Button onClick={onRefresh} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => navigate('/my-leads?tab=leads')}>
            Continue Anyway
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TimeoutState;
