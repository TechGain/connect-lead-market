
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface ProfileErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  isOffline?: boolean;
}

const ProfileErrorDisplay = ({ error, onRetry, isOffline = false }: ProfileErrorDisplayProps) => {
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
    <div className={`p-6 border rounded-lg ${isOffline || isLimitedData ? 'bg-yellow-50' : 'bg-red-50'} text-center`}>
      <div className="flex justify-center mb-4">
        {isTimeout || isNetworkError || isOffline ? (
          <WifiOff size={32} className={isOffline ? "text-yellow-500" : "text-red-500"} />
        ) : isLimitedData ? (
          <Wifi size={32} className="text-yellow-500" />
        ) : (
          <AlertTriangle size={32} className={isLimitedData ? 'text-yellow-500' : 'text-red-500'} />
        )}
      </div>
      
      <h3 className={`text-xl font-medium ${isOffline || isLimitedData ? 'text-yellow-700' : 'text-red-700'} mb-2`}>
        {isOffline ? "Offline Mode" :
         isTimeout ? "Connection Timeout" : 
         isNetworkError ? "Network Connection Issue" :
         isLimitedData ? "Limited Profile Data" : 
         "Error Loading Profile"}
      </h3>
      
      <p className={`${isOffline || isLimitedData ? 'text-yellow-600' : 'text-red-600'} mb-4`}>
        {isOffline ? "You're currently offline. Please reconnect to access your full profile." : error}
      </p>
      
      {isTimeout && !isOffline && (
        <p className="text-sm text-red-500 mb-3">
          Your connection timed out. This might be due to a slow network or server issues.
        </p>
      )}
      
      {isNetworkError && !isOffline && (
        <p className="text-sm text-red-500 mb-3">
          Please check your internet connection and try again.
        </p>
      )}
      
      <div className="space-y-2">
        {isAuthError && !isOffline ? (
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
              onClick={isOffline ? () => window.location.reload() : onRetry}
              disabled={isOffline && !navigator.onLine}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> 
              {isOffline ? "Check Connection" : "Try Again"}
            </Button>
            <div className="text-sm text-gray-500 mt-2">
              {isOffline 
                ? "Your device appears to be offline. Please check your internet connection."
                : "If this problem persists, try refreshing the page or logging out and back in."
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileErrorDisplay;
