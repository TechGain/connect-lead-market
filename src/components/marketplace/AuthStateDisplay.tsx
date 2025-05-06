
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Loader2, RefreshCcw } from 'lucide-react';

interface AuthStateDisplayProps {
  isLoading: boolean;
  authError: string | null;
  isLoggedIn: boolean;
  role: string | null;
}

const AuthStateDisplay: React.FC<AuthStateDisplayProps> = ({
  isLoading,
  authError,
  isLoggedIn,
  role
}) => {
  const navigate = useNavigate();

  const handleRefreshPage = () => {
    // Clear any Supabase tokens first
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Then reload the page
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="mb-2 text-lg">Checking your account...</p>
          <p className="text-sm text-gray-500 mb-4">Please wait while we verify your credentials</p>
          <Button variant="outline" onClick={handleRefreshPage} className="flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" />
            Reset & Refresh
          </Button>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Authentication Error</h1>
        <p className="text-gray-600 mb-6">{authError}</p>
        <div className="space-x-4">
          <Button onClick={() => navigate('/')}>
            Return to Home
          </Button>
          <Button variant="outline" onClick={handleRefreshPage}>
            Reset & Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Access Restricted</h1>
        <p className="text-gray-600 mb-6">
          Please log in to access the marketplace.
        </p>
        <div className="space-y-4">
          <Button onClick={() => navigate('/login')}>
            Log In
          </Button>
          <div>
            <p className="text-sm text-gray-500 mb-2">Having trouble logging in?</p>
            <Button variant="outline" onClick={handleRefreshPage} className="flex items-center gap-2">
              <RefreshCcw className="h-4 w-4" />
              Reset & Refresh
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Allow both buyers and admins to access the marketplace
  if (role !== 'buyer' && role !== 'admin') {
    return (
      <div className="py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Access Restricted</h1>
        <p className="text-gray-600 mb-6">
          The marketplace is only available to buyers and admins. Your current role: {role || 'not set'}
        </p>
        <div className="space-y-4">
          <Button onClick={() => navigate('/')}>
            Return to Home
          </Button>
          <div>
            <p className="text-sm text-gray-500 mb-2">Role not showing correctly?</p>
            <Button variant="outline" onClick={handleRefreshPage} className="flex items-center gap-2">
              <RefreshCcw className="h-4 w-4" />
              Reset & Refresh
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthStateDisplay;
