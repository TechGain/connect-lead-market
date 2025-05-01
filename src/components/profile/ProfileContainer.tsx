
import React, { useState, useEffect } from 'react';
import { useUserRole } from '@/hooks/use-user-role';
import ProfileLoadingState from './ProfileLoadingState';
import ProfileErrorDisplay from './ProfileErrorDisplay';
import ProfileFallbackView from './ProfileFallbackView';
import ProfileNoDataView from './ProfileNoDataView';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { WifiOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProfileContainerProps {
  isOffline?: boolean;
}

// Define a minimal profile data shape for fallbacks
const DEFAULT_PROFILE_DATA = {
  name: 'User',
  email: '',
  company: 'Not specified',
  role: 'buyer',
  rating: 4.7,
  joinedDate: new Date().toLocaleDateString('en-US', {year: 'numeric', month: 'long'}),
  totalLeads: 0
};

const ProfileContainer = ({ isOffline = false }: ProfileContainerProps) => {
  const { user, isLoggedIn, role: userRole } = useUserRole();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  
  // Simple direct fetch function without complex hooks
  const fetchProfileData = async () => {
    console.log("Fetching profile data directly...");
    setIsLoading(true);
    setError(null);
    
    try {
      if (!user?.id) {
        console.log("No user ID available");
        throw new Error("Please sign in to view your profile");
      }
      
      console.log("Fetching profile for user ID:", user.id);
      
      // Directly fetch from profiles table with simple error handling
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error("Supabase query error:", error);
        throw new Error("Could not load profile");
      }
      
      if (!data) {
        console.log("No profile data found");
        throw new Error("No profile found");
      }
      
      console.log("Profile data retrieved:", data);
      
      // Format data in a simple way
      const formattedProfile = {
        name: data.full_name || user?.user_metadata?.full_name || 'User',
        email: user.email || '',
        company: data.company || 'Not specified',
        role: (data.role?.toLowerCase() === 'seller' ? 'seller' : 'buyer'),
        rating: data.rating || 4.7,
        joinedDate: new Date(user.created_at || Date.now()).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long'
        }),
        totalLeads: 0 // We'll default to 0 for simplicity
      };
      
      console.log("Formatted profile:", formattedProfile);
      
      // Cache for offline mode
      localStorage.setItem('profile_data', JSON.stringify(formattedProfile));
      
      setProfileData(formattedProfile);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setError(err.message || "Failed to load profile");
      
      // Try to use cached data as fallback
      try {
        const cachedData = localStorage.getItem('profile_data');
        if (cachedData) {
          console.log("Using cached profile data");
          setProfileData(JSON.parse(cachedData));
          toast.warning("Using cached profile data");
        } else {
          console.log("No cached data, using default");
          // Use minimal default data as last resort
          setProfileData({
            ...DEFAULT_PROFILE_DATA,
            name: user?.user_metadata?.full_name || 'User',
            email: user?.email || '',
            role: userRole || 'buyer'
          });
        }
      } catch (cacheErr) {
        console.error("Cache retrieval error:", cacheErr);
        // Absolute fallback
        setProfileData(DEFAULT_PROFILE_DATA);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Simple refresh function
  const handleRefresh = () => {
    toast.info("Refreshing profile...");
    fetchProfileData();
  };
  
  // Fetch on mount
  useEffect(() => {
    console.log("ProfileContainer mounted, fetching data...");
    fetchProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);
  
  console.log("Current profile render state:", { 
    isLoading, 
    hasError: !!error, 
    hasData: !!profileData,
    isOffline
  });
  
  // Show loading state during initial load
  if (isLoading && !profileData) {
    return <ProfileLoadingState />;
  }
  
  // Show error state with retry option if no fallback data is available
  if (error && !profileData) {
    return (
      <ProfileErrorDisplay 
        error={error} 
        onRetry={handleRefresh} 
        isOffline={isOffline}
      />
    );
  }
  
  // Show content with whatever data we have (either real or fallback)
  if (profileData) {
    return (
      <>
        {isOffline && (
          <Alert className="mb-6 bg-yellow-50 border-yellow-200">
            <AlertTitle className="text-yellow-800 flex items-center gap-2">
              <WifiOff className="h-4 w-4" /> Offline Mode
            </AlertTitle>
            <AlertDescription className="text-yellow-700">
              <p className="mb-2">
                You're currently offline. Your profile shows cached data and some features may be unavailable.
              </p>
            </AlertDescription>
          </Alert>
        )}
        <ProfileFallbackView 
          profileData={profileData}
          userData={user}
          onRetry={handleRefresh}
          error={error}
          isOffline={isOffline}
        />
      </>
    );
  }
  
  // Fallback for no data state
  return (
    <ProfileNoDataView onRetry={handleRefresh} isOffline={isOffline} />
  );
};

export default ProfileContainer;
