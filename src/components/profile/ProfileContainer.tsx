
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
  
  // Function to get profile data directly (without complex hooks)
  const fetchProfileData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // If offline, try to get from local storage
      if (isOffline) {
        const cachedData = localStorage.getItem('profile_data');
        if (cachedData) {
          setProfileData(JSON.parse(cachedData));
          setIsLoading(false);
          return;
        }
      }
      
      // If no user is available, try to get the session
      let userId = user?.id;
      if (!userId) {
        const { data } = await supabase.auth.getSession();
        userId = data?.session?.user?.id;
      }
      
      if (!userId) {
        throw new Error("No user authenticated. Please log in.");
      }
      
      // Directly fetch from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw new Error("Could not load profile data");
      }
      
      // Format profile data
      const formattedProfile = {
        name: profile.full_name || user?.user_metadata?.full_name || 'User',
        email: user?.email || '',
        company: profile.company || 'Not specified',
        role: (profile.role?.toLowerCase() === 'seller' ? 'seller' : 'buyer'),
        rating: profile.rating || 4.7,
        joinedDate: user?.created_at ? 
          new Date(user.created_at).toLocaleDateString('en-US', {year: 'numeric', month: 'long'}) : 
          'Unknown',
        totalLeads: 0 // We'll set this to 0 for simplicity
      };
      
      // Cache the profile data for offline use
      localStorage.setItem('profile_data', JSON.stringify(formattedProfile));
      
      setProfileData(formattedProfile);
    } catch (err: any) {
      console.error("Profile fetch error:", err);
      setError(err.message || "Failed to load profile");
      
      // Try to use cached data as fallback
      const cachedData = localStorage.getItem('profile_data');
      if (cachedData) {
        setProfileData(JSON.parse(cachedData));
        toast.warning("Using cached profile data");
      } else {
        // Use default data as last resort
        setProfileData({
          ...DEFAULT_PROFILE_DATA,
          name: user?.user_metadata?.full_name || 'User',
          email: user?.email || '',
          role: userRole || 'buyer'
        });
        toast.warning("Using limited profile data");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Simple refresh function
  const refreshProfile = () => {
    toast.info("Refreshing profile...");
    fetchProfileData();
  };
  
  // Fetch on mount
  useEffect(() => {
    fetchProfileData();
  }, [isOffline, user?.id]);
  
  // Show loading state during initial load
  if (isLoading && !profileData) {
    return <ProfileLoadingState />;
  }
  
  // Show error state with retry option if no fallback data is available
  if (error && !profileData) {
    return (
      <ProfileErrorDisplay 
        error={error} 
        onRetry={refreshProfile} 
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
          onRetry={refreshProfile}
          error={error}
          isOffline={isOffline}
        />
      </>
    );
  }
  
  // Fallback for no data state
  return (
    <ProfileNoDataView onRetry={refreshProfile} isOffline={isOffline} />
  );
};

export default ProfileContainer;
