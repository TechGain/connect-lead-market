
import React from 'react';
import ProfileHeader from './ProfileHeader';
import { Button } from '@/components/ui/button';
import { RefreshCw, Home, LogOut, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/use-user-role';

interface ProfileNoDataViewProps {
  onRetry: () => void;
  isOffline?: boolean;
}

const ProfileNoDataView = ({ onRetry, isOffline = false }: ProfileNoDataViewProps) => {
  const navigate = useNavigate();
  const { logout } = useUserRole();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  return (
    <>
      <ProfileHeader error={isOffline ? "Offline mode" : "Limited connectivity"} isOffline={isOffline} />
      <div className={`text-center py-8 border rounded-lg ${isOffline ? 'bg-orange-50' : 'bg-yellow-50'}`}>
        <div className="flex justify-center mb-4">
          <div className={`rounded-full ${isOffline ? 'bg-orange-100' : 'bg-yellow-100'} p-3`}>
            {isOffline ? (
              <WifiOff size={24} className="text-orange-800" />
            ) : (
              <RefreshCw size={24} className="text-yellow-800" />
            )}
          </div>
        </div>
        <h3 className={`text-xl font-medium ${isOffline ? 'text-orange-800' : 'text-yellow-800'} mb-2`}>
          {isOffline ? "You're Offline" : "Connection Issues"}
        </h3>
        <p className={`${isOffline ? 'text-orange-700' : 'text-yellow-700'} max-w-md mx-auto mb-6`}>
          {isOffline
            ? "We can't load your profile data because your device appears to be offline. Please check your internet connection."
            : "We're having trouble loading your profile data. This might be due to network connectivity issues or a temporary server problem."
          }
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button 
            onClick={isOffline ? () => window.location.reload() : onRetry}
            className={isOffline ? "bg-orange-600 hover:bg-orange-700" : "bg-brand-600 hover:bg-brand-700"}
            disabled={isOffline && !navigator.onLine}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> 
            {isOffline ? "Check Connection" : "Retry"}
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
          {!isOffline && (
            <Button 
              variant="ghost"
              onClick={handleLogout}
              className="text-gray-600"
            >
              <LogOut className="mr-2 h-4 w-4" /> Log Out & In
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfileNoDataView;
