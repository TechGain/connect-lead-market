
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ProfileErrorDisplayProps {
  error: string;
  onRetry?: () => void;
}

const ProfileErrorDisplay = ({ error, onRetry }: ProfileErrorDisplayProps) => {
  const navigate = useNavigate();
  
  const isAuthError = error?.toLowerCase().includes('auth') || 
                      error?.toLowerCase().includes('log') || 
                      error?.toLowerCase().includes('not authenticated');

  return (
    <div className="p-6 border rounded-lg bg-red-50 text-center">
      <h3 className="text-xl font-medium text-red-700 mb-2">Error Loading Profile</h3>
      <p className="text-red-600 mb-4">{error}</p>
      
      {isAuthError ? (
        <div className="space-x-4">
          <Button onClick={() => navigate('/login')}>Go to Login</Button>
          <Button variant="outline" onClick={onRetry}>Try Again</Button>
        </div>
      ) : (
        <Button onClick={onRetry}>Try Again</Button>
      )}
    </div>
  );
};

export default ProfileErrorDisplay;
