
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useUserRole } from '@/hooks/use-user-role';
import { useProfileData } from '@/hooks/use-profile-data';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileSkeleton from '@/components/profile/ProfileSkeleton';
import ProfileErrorDisplay from '@/components/profile/ProfileErrorDisplay';
import ProfileContent from '@/components/profile/ProfileContent';

const ProfileContainer = () => {
  const navigate = useNavigate();
  const { isLoggedIn, role, isLoading: authLoading } = useUserRole();
  const { profileData, isLoading: profileLoading, error, refreshData } = useProfileData();
  
  // Debug log for tracking auth state
  useEffect(() => {
    console.log("ProfileContainer - Auth state:", { 
      isLoggedIn, 
      role, 
      authLoading,
      profileLoading,
      hasError: !!error
    });
  }, [isLoggedIn, role, authLoading, profileLoading, error]);
  
  // If user not logged in, redirect to login
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      toast.error("You must be logged in to view this page");
      navigate('/login');
    }
  }, [isLoggedIn, navigate, authLoading]);
  
  // Combined loading state
  const isLoading = authLoading || profileLoading;
  
  return (
    <>
      <ProfileHeader error={error} />
      
      {isLoading ? (
        <>
          <ProfileSkeleton />
          <p className="text-center text-gray-500 mt-4">Loading your profile...</p>
        </>
      ) : error ? (
        <ProfileErrorDisplay error={error} />
      ) : (
        <ProfileContent 
          profileData={profileData} 
          role={role}
        />
      )}
    </>
  );
};

export default ProfileContainer;
