
import React from 'react';
import PageLayout from '@/components/PageLayout';
import { useProfileData } from '@/hooks/use-profile-data';
import { useUserRole } from '@/hooks/use-user-role';
import { Helmet } from 'react-helmet-async';
import ProfileContainer from '@/components/profile/ProfileContainer';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileContent from '@/components/profile/ProfileContent';

const Profile = () => {
  const { profileData, isLoading, error } = useProfileData();
  const { user, role } = useUserRole();

  return (
    <PageLayout>
      <Helmet>
        <title>Your Profile | Leads Marketplace</title>
      </Helmet>

      <ProfileContainer isOffline={false}>
        <ProfileHeader 
          error={error}
        />
        
        <ProfileContent 
          profileData={profileData}
          userData={user}
          refreshProfile={() => {}}
          role={role as 'seller' | 'buyer' || 'buyer'}
        />
      </ProfileContainer>
    </PageLayout>
  );
};

export default Profile;
