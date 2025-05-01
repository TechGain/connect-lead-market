
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/use-user-role';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileSkeleton from '@/components/profile/ProfileSkeleton';
import ProfileErrorDisplay from '@/components/profile/ProfileErrorDisplay';
import ProfileContent from '@/components/profile/ProfileContent';
import { useProfileData } from '@/hooks/use-profile-data';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Profile = () => {
  const navigate = useNavigate();
  const { isLoggedIn, role, isLoading: authLoading, user, refreshUserRole } = useUserRole();
  const { profileData, isLoading: profileLoading, error, refreshData } = useProfileData();
  const [hasAttemptedReload, setHasAttemptedReload] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [directDatabaseRole, setDirectDatabaseRole] = useState<'seller' | 'buyer' | null>(null);
  
  // Log detailed debug information
  useEffect(() => {
    console.log("Profile page render - Auth state:", { 
      isLoggedIn, 
      role, 
      authLoading,
      profileDataLoading: profileLoading,
      hasError: !!error,
      errorMessage: error,
      userId: user?.id,
      directDatabaseRole
    });
    
    // Force a timeout to proceed even if authentication is taking too long
    const timer = setTimeout(() => {
      if ((authLoading || profileLoading) && !loadingTimeout) {
        console.log("Loading is taking too long, marking timeout");
        setLoadingTimeout(true);
      }
    }, 8000); // Extended timeout to 8 seconds
    
    return () => clearTimeout(timer);
  }, [isLoggedIn, role, authLoading, profileLoading, error, user?.id, loadingTimeout, directDatabaseRole]);
  
  // Direct fetch of role from database if we're logged in
  useEffect(() => {
    const fetchDirectRole = async () => {
      if (!user?.id) return;
      
      try {
        console.log("Profile page: Directly fetching role from database for user:", user.id);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error("Error fetching role from database:", error);
          return;
        }
        
        console.log("Profile page: Direct database role check result:", data?.role);
        
        if (data?.role) {
          const dbRole = String(data.role).toLowerCase();
          if (dbRole === 'seller' || dbRole === 'buyer') {
            console.log("Profile page: Setting direct database role to:", dbRole);
            setDirectDatabaseRole(dbRole as 'seller' | 'buyer');
          }
        }
      } catch (err) {
        console.error("Exception in direct role fetch:", err);
      }
    };
    
    if (isLoggedIn && user?.id) {
      fetchDirectRole();
    }
  }, [isLoggedIn, user?.id]);
  
  // If user not logged in, redirect to login
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      toast.error("You must be logged in to view this page");
      navigate('/login');
    }
  }, [isLoggedIn, navigate, authLoading]);
  
  const handleRefresh = () => {
    setHasAttemptedReload(true);
    refreshUserRole();
    setTimeout(() => {
      if (refreshData) {
        refreshData();
      }
      // Force a direct database check after a short delay
      setTimeout(() => {
        const fetchRoleAgain = async () => {
          if (!user?.id) return;
          
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', user.id)
              .single();
            
            if (!error && data?.role) {
              const dbRole = String(data.role).toLowerCase();
              if (dbRole === 'seller' || dbRole === 'buyer') {
                setDirectDatabaseRole(dbRole as 'seller' | 'buyer');
                console.log("After refresh: Set direct database role to:", dbRole);
              }
            }
          } catch (err) {
            console.error("Error in post-refresh role check:", err);
          }
        };
        
        fetchRoleAgain();
      }, 500);
    }, 1000);
    toast.info("Refreshing profile data...");
  };

  // Combined loading state
  const isLoading = (authLoading || profileLoading) && !loadingTimeout;
  
  // If we're logged in but still don't have a role after reload attempt,
  // or loading takes too long, let's render the profile anyway with a default role
  const shouldProceedAnyway = (isLoggedIn && (role === null || loadingTimeout));
  
  // Use direct database role if available, otherwise fall back to context role
  const displayRole = directDatabaseRole || role;
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <ProfileHeader error={error} />
        
        {isLoading && !shouldProceedAnyway ? (
          <>
            <ProfileSkeleton />
            <p className="text-center text-gray-500 mt-4">Loading your profile...</p>
          </>
        ) : error ? (
          <>
            <ProfileErrorDisplay error={error} />
            <div className="flex justify-center mt-4">
              <Button onClick={handleRefresh} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh Profile
              </Button>
            </div>
          </>
        ) : (
          <>
            <ProfileContent 
              profileData={profileData} 
              role={displayRole}
            />
            
            {/* Add a dedicated refresh button for debugging */}
            <div className="flex justify-center mt-6">
              <Button 
                onClick={handleRefresh} 
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Profile Data
              </Button>
            </div>
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
