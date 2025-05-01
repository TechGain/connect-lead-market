
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProfileBadge from '@/components/ProfileBadge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ProfileInfoCardProps {
  profileData: {
    name: string;
    email: string;
    company: string;
    rating: number;
    joinedDate: string;
    avatar: string | undefined;
    totalLeads: number;
  };
  role: 'seller' | 'buyer' | null; // This is the role from context, but we'll verify it directly
}

const ProfileInfoCard = ({ profileData, role: contextRole }: ProfileInfoCardProps) => {
  const [directRole, setDirectRole] = useState<'seller' | 'buyer' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileInfo, setProfileInfo] = useState({
    name: '',
    email: '',
    company: '',
  });

  // Fetch complete profile data directly from Supabase
  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get current session
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData?.session?.user?.id) {
        setError("Not authenticated");
        return;
      }
      
      const userId = sessionData.session.user.id;
      const userEmail = sessionData.session.user.email || '';
      console.log("ProfileInfoCard: Fetching complete profile data for user:", userId);
      
      // Get user profile from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        setError("Could not fetch your profile");
        return;
      }
      
      console.log("ProfileInfoCard: Profile data fetched successfully:", profileData);
      
      if (profileData) {
        // Update role state if role is valid
        if (profileData.role) {
          const dbRole = profileData.role.toLowerCase();
          console.log("ProfileInfoCard: Role from database:", dbRole);
          
          if (dbRole === 'seller' || dbRole === 'buyer') {
            setDirectRole(dbRole as 'seller' | 'buyer');
          }
        }
        
        // Update profile info state
        setProfileInfo({
          name: profileData.full_name || 'User',
          email: userEmail,
          company: profileData.company || 'Not specified',
        });
      }
    } catch (err) {
      console.error("Exception in profile data fetch:", err);
      setError("Error loading your profile");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch profile data on mount
  useEffect(() => {
    fetchProfileData();
  }, []);
  
  return (
    <Card className="lg:col-span-1">
      <CardHeader className="flex flex-col items-center text-center">
        <ProfileBadge
          name={profileInfo.name || profileData.name}
          rating={profileData.rating}
          avatar={profileData.avatar}
          role={directRole || contextRole || 'buyer'}
          totalLeads={profileData.totalLeads}
        />
        <CardDescription className="mt-2">
          Member since {profileData.joinedDate}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p>{profileInfo.email || profileData.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Company</p>
            <p>{profileInfo.company || profileData.company || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Account Type</p>
            {isLoading ? (
              <div className="h-5 w-20 bg-gray-200 animate-pulse rounded"></div>
            ) : error ? (
              <div className="flex items-center gap-2">
                <p className="text-amber-600">{error}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs" 
                  onClick={() => fetchProfileData()}
                >
                  Retry
                </Button>
              </div>
            ) : directRole ? (
              <p className="capitalize font-medium text-brand-600">{directRole}</p>
            ) : (
              <p className="text-amber-600">Could not determine role</p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="outline" onClick={() => {
          fetchProfileData();
          toast.info("Refreshing profile data...");
        }}>
          Refresh Profile
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProfileInfoCard;
