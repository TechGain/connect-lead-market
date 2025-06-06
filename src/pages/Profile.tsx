
import React from 'react';
import PageLayout from '@/components/PageLayout';
import { useUserRole } from '@/hooks/use-user-role';
import { Helmet } from 'react-helmet-async';
import { useSimpleProfile } from '@/hooks/use-simple-profile';
import ProfileContent from '@/components/profile/ProfileContent';
import ProfileLoadingState from '@/components/profile/ProfileLoadingState';
import ProfileErrorDisplay from '@/components/profile/ProfileErrorDisplay';

const Profile = () => {
  const { user, role, isLoggedIn } = useUserRole();
  const { profileData, isLoading, error, refreshProfile } = useSimpleProfile();

  console.log("Profile page - Current state:", { 
    isLoggedIn, 
    role, 
    hasProfileData: !!profileData,
    isLoading,
    hasError: !!error,
    userId: user?.id
  });

  // Show loading state
  if (isLoading) {
    return (
      <PageLayout>
        <Helmet>
          <title>Your Profile | Leads Marketplace</title>
        </Helmet>
        <ProfileLoadingState />
      </PageLayout>
    );
  }

  // Show error state with retry option
  if (error && !profileData) {
    return (
      <PageLayout>
        <Helmet>
          <title>Your Profile | Leads Marketplace</title>
        </Helmet>
        <ProfileErrorDisplay 
          error={error} 
          onRetry={refreshProfile} 
        />
      </PageLayout>
    );
  }

  // Show profile content (either real data or fallback)
  return (
    <PageLayout>
      <Helmet>
        <title>Your Profile | Leads Marketplace</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-gray-600">Manage your account settings and information</p>
        </div>
        
        {profileData && (
          <ProfileContent 
            profileData={profileData}
            userData={user}
            refreshProfile={refreshProfile}
            role={profileData.role as 'seller' | 'buyer'}
            userEmail={user?.email}
          />
        )}
      </div>
    </PageLayout>
  );
};

export default Profile;
