
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface ProfileErrorDisplayProps {
  error: string;
  onRetry?: () => void;
}

const ProfileErrorDisplay = ({ error, onRetry }: ProfileErrorDisplayProps) => {
  const navigate = useNavigate();
  
  // Detect common error patterns and provide specialized messaging
  const isTimeout = error?.toLowerCase().includes('timeout');
  const isAuthError = error?.toLowerCase().includes('auth') || 
                      error?.toLowerCase().includes('log') || 
                      error?.toLowerCase().includes('session') ||
                      error?.toLowerCase().includes('not authenticated');
  const isNetworkError = error?.toLowerCase().includes('network') ||
                         error?.toLowerCase().includes('failed to fetch') ||
                         error?.toLowerCase().includes('connection');
  const isLimitedData = error?.toLowerCase().includes('limited');

  return (
    <div className={`p-6 border rounded-lg ${isLimitedData ? 'bg-yellow-50' : 'bg-red-50'} text-center`}>
      <div className="flex justify-center mb-4">
        {isTimeout || isNetworkError ? (
          <WifiOff size={32} className="text-red-500" />
        ) : isLimitedData ? (
          <Wifi size={32} className="text-yellow-500" />
        ) : (
          <AlertTriangle size={32} className={isLimitedData ? 'text-yellow-500' : 'text-red-500'} />
        )}
      </div>
      
      <h3 className={`text-xl font-medium ${isLimitedData ? 'text-yellow-700' : 'text-red-700'} mb-2`}>
        {isTimeout ? "Connection Timeout" : 
         isNetworkError ? "Network Connection Issue" :
         isLimitedData ? "Limited Profile Data" : 
         "Error Loading Profile"}
      </h3>
      
      <p className={`${isLimitedData ? 'text-yellow-600' : 'text-red-600'} mb-4`}>{error}</p>
      
      {isTimeout && (
        <p className="text-sm text-red-500 mb-3">
          Your connection timed out. This might be due to a slow network or server issues.
        </p>
      )}
      
      {isNetworkError && (
        <p className="text-sm text-red-500 mb-3">
          Please check your internet connection and try again.
        </p>
      )}
      
      <div className="space-y-2">
        {isAuthError ? (
          <div className="space-x-4">
            <Button onClick={() => navigate('/login')}>Go to Login</Button>
            <Button variant="outline" onClick={onRetry}>
              <RefreshCw className="mr-2 h-4 w-4" /> Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Button 
              className="w-full sm:w-auto flex items-center justify-center" 
              onClick={onRetry}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Try Again
            </Button>
            <div className="text-sm text-gray-500 mt-2">
              If this problem persists, try refreshing the page or logging out and back in.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileErrorDisplay;
