
import React from 'react';
import { Card, CardHeader, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProfileBadge from '@/components/ProfileBadge';
import { toast } from 'sonner';

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
  role: 'seller' | 'buyer'; // Keep it strict here since we're defaulting to 'buyer' in ProfileContent
}

const ProfileInfoCard = ({ profileData, role }: ProfileInfoCardProps) => {
  // Role is now guaranteed to be either 'seller' or 'buyer'
  
  return (
    <Card className="lg:col-span-1">
      <CardHeader className="flex flex-col items-center text-center">
        <ProfileBadge
          name={profileData.name}
          rating={profileData.rating}
          avatar={profileData.avatar}
          role={role}
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
            <p>{profileData.company}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Account Type</p>
            <p className="capitalize">{role || 'Loading...'}</p>
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
