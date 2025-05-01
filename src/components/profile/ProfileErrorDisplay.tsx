
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

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
                      error?.toLowerCase().includes('not authenticated');
  const isNetworkError = error?.toLowerCase().includes('network') ||
                         error?.toLowerCase().includes('failed to fetch');

  return (
    <div className="p-6 border rounded-lg bg-red-50 text-center">
      <h3 className="text-xl font-medium text-red-700 mb-2">
        {isTimeout ? "Connection Timeout" : "Error Loading Profile"}
      </h3>
      <p className="text-red-600 mb-4">{error}</p>
      
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
            <Button variant="outline" onClick={onRetry}>Try Again</Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Button className="w-full sm:w-auto" onClick={onRetry}>Try Again</Button>
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
