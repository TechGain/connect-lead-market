
import React from 'react';
import ProfileHeader from './ProfileHeader';
import { Button } from '@/components/ui/button';
import { RefreshCw, Home, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/use-user-role';

interface ProfileNoDataViewProps {
  onRetry: () => void;
}

const ProfileNoDataView = ({ onRetry }: ProfileNoDataViewProps) => {
  const navigate = useNavigate();
  const { logout } = useUserRole();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  return (
    <>
      <ProfileHeader error="Limited connectivity" />
      <div className="text-center py-8 border rounded-lg bg-yellow-50">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-yellow-100 p-3">
            <RefreshCw size={24} className="text-yellow-800" />
          </div>
        </div>
        <h3 className="text-xl font-medium text-yellow-800 mb-2">Connection Issues</h3>
        <p className="text-yellow-700 max-w-md mx-auto mb-6">
          We're having trouble loading your profile data. This might be due to network connectivity issues or a temporary server problem.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button 
            onClick={onRetry}
            className="bg-brand-600 hover:bg-brand-700"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Retry
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/')}
          >
            <Home className="mr-2 h-4 w-4" /> Go to Home
          </Button>
          <Button 
            variant="ghost"
            onClick={handleLogout}
            className="text-gray-600"
          >
            <LogOut className="mr-2 h-4 w-4" /> Log Out & In
          </Button>
        </div>
      </div>
    </>
  );
};

export default ProfileNoDataView;
