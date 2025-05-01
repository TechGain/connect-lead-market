
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
  role: 'seller' | 'buyer'; // This is the role from context, but we'll verify it directly
}

const ProfileInfoCard = ({ profileData, role: contextRole }: ProfileInfoCardProps) => {
  const [directRole, setDirectRole] = useState<'seller' | 'buyer' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the role directly from the database
  useEffect(() => {
    const fetchDirectRole = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (session?.session?.user?.id) {
          const userId = session.session.user.id;
          console.log("ProfileInfoCard: Directly fetching role for user:", userId);

          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();

          if (error) {
            console.error("Error fetching direct role:", error);
            return;
          }

          if (data && data.role) {
            const dbRole = data.role.toLowerCase();
            console.log("ProfileInfoCard: Direct database role:", dbRole);
            
            if (dbRole === 'seller' || dbRole === 'buyer') {
              setDirectRole(dbRole as 'seller' | 'buyer');
            }
          }
        }
      } catch (err) {
        console.error("Exception in direct role fetch:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDirectRole();
  }, []);

  // Use the directly fetched role if available, otherwise fall back to context role
  const displayRole = directRole || contextRole;
  
  return (
    <Card className="lg:col-span-1">
      <CardHeader className="flex flex-col items-center text-center">
        <ProfileBadge
          name={profileData.name}
          rating={profileData.rating}
          avatar={profileData.avatar}
          role={displayRole}
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
            <p>{profileData.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Company</p>
            <p>{profileData.company || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Account Type</p>
            {isLoading ? (
              <div className="h-5 w-20 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p className="capitalize font-medium text-brand-600">
                {displayRole}
                {directRole && contextRole && directRole !== contextRole && (
                  <span className="text-xs text-amber-600 ml-2">(refreshing...)</span>
                )}
              </p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="outline" onClick={() => toast.info("Edit profile functionality coming soon")}>
          Edit Profile
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProfileInfoCard;
