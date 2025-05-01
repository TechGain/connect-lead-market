
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/use-user-role';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileSkeleton from '@/components/profile/ProfileSkeleton';
import ProfileErrorDisplay from '@/components/profile/ProfileErrorDisplay';
import ProfileContent from '@/components/profile/ProfileContent';
import { useProfileData } from '@/hooks/use-profile-data';

const Profile = () => {
  const navigate = useNavigate();
  const { isLoggedIn, role } = useUserRole();
  const { profileData, isLoading, error } = useProfileData();
  
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <ProfileHeader error={error} />
        
        {isLoading ? (
          <ProfileSkeleton />
        ) : error ? (
          <ProfileErrorDisplay error={error} />
        ) : (
          <ProfileContent profileData={profileData} role={role} />
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
