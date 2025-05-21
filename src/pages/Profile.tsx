
import React from 'react';
import PageLayout from '@/components/PageLayout';
import { useProfileData } from '@/hooks/use-profile-data';
import { useUserRole } from '@/hooks/use-user-role';
import { Helmet } from 'react-helmet-async';
import ProfileContainer from '@/components/profile/ProfileContainer';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileContent from '@/components/profile/ProfileContent';
import ProfileInfoCard from '@/components/profile/ProfileInfoCard';
import ProfileSettingsCard from '@/components/profile/ProfileSettingsCard';
import NotificationPreferences from '@/components/profile/NotificationPreferences';
import ProfileMainLayout from '@/components/profile/ProfileMainLayout';

const Profile = () => {
  const { profileData, isLoading, error } = useProfileData();
  const { userId, role } = useUserRole();

  return (
    <PageLayout>
      <Helmet>
        <title>Your Profile | Leads Marketplace</title>
      </Helmet>

      <ProfileContainer>
        <ProfileHeader 
          fullName={profileData.name}
          email={profileData.email}
          company={profileData.company}
          joinedDate={profileData.joinedDate}
          isLoading={isLoading}
        />
        
        <ProfileContent isLoading={isLoading} error={error}>
          <ProfileMainLayout>
            <ProfileInfoCard 
              role={role || 'buyer'} 
              email={profileData.email}
              company={profileData.company}
              totalLeads={profileData.totalLeads}
              rating={profileData.rating}
              isLoading={isLoading}
            />
            
            <ProfileSettingsCard 
              role={role as 'seller' | 'buyer'} 
              disabled={isLoading}
            />
            
            <NotificationPreferences 
              userId={userId} 
              userPhone={profileData.phone}
              userEmail={profileData.email} 
            />
          </ProfileMainLayout>
        </ProfileContent>
      </ProfileContainer>
    </PageLayout>
  );
};

export default Profile;
