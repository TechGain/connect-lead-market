
import React, { useState, useEffect } from 'react';
import ProfileMainLayout from '@/components/profile/ProfileMainLayout';
import ProfileContainer from '@/components/profile/ProfileContainer';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';

const Profile = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const location = useLocation();
  
  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast.success("You're back online!");
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      toast.error("You're offline. Some features may be unavailable.");
    };
    
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial check on load
    if (!navigator.onLine) {
      setIsOffline(true);
      toast.warning("You appear to be offline. Using limited functionality.");
    }
    
    // Check for connection error param in URL
    const params = new URLSearchParams(location.search);
    if (params.get('connection_error') === 'true') {
      toast.error("Connection issues were detected. Using offline mode.");
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [location]);

  return (
    <ProfileMainLayout>
      <Helmet>
        <title>{isOffline ? "Offline Mode | " : ""}My Profile | Leads Platform</title>
      </Helmet>
      <ProfileContainer isOffline={isOffline} />
    </ProfileMainLayout>
  );
};

export default Profile;
