
import React from 'react';
import ProfileMainLayout from '@/components/profile/ProfileMainLayout';
import ProfileContainer from '@/components/profile/ProfileContainer';
import { Helmet } from 'react-helmet';

const Profile = () => {
  return (
    <ProfileMainLayout>
      <Helmet>
        <title>My Profile | Leads Platform</title>
      </Helmet>
      <ProfileContainer />
    </ProfileMainLayout>
  );
};

export default Profile;
