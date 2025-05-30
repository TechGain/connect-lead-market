
import React from 'react';
import { Card, CardHeader, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import ProfileBadge from '@/components/ProfileBadge';

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
  role: 'seller' | 'buyer';
  onRefresh?: () => void;
  isOffline?: boolean;
}

const ProfileInfoCard = ({ profileData, role, onRefresh, isOffline }: ProfileInfoCardProps) => {
  // Make sure we have valid data with strict defaults
  const safeData = {
    name: profileData?.name || 'User',
    email: profileData?.email || 'No email provided',
    company: profileData?.company || 'Not specified',
    rating: typeof profileData?.rating === 'number' ? profileData.rating : 4.5,
    joinedDate: profileData?.joinedDate || 'Unknown',
    avatar: profileData?.avatar,
    totalLeads: typeof profileData?.totalLeads === 'number' ? profileData.totalLeads : 0
  };

  // Determine if we're displaying limited data
  const isLimitedData = !profileData?.company || profileData.company === 'Not specified';
  
  console.log("ProfileInfoCard rendering with:", {
    name: safeData.name,
    company: safeData.company,
    role,
    isLimitedData,
    isOffline
  });

  return (
    <Card className="lg:col-span-1">
      <CardHeader className="flex flex-col items-center text-center">
        <ProfileBadge
          name={safeData.name}
          rating={safeData.rating}
          avatar={safeData.avatar}
          role={role}
          totalLeads={safeData.totalLeads}
        />
        <CardDescription className="mt-2">
          Member since {safeData.joinedDate}
        </CardDescription>
        {isLimitedData && (
          <div className="bg-yellow-50 text-yellow-700 text-xs px-2 py-1 rounded-md mt-2">
            Limited profile data. Refresh to load complete data.
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="break-words">{safeData.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Company</p>
            <p>{safeData.company}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Account Type</p>
            <p className="capitalize font-medium text-brand-600">{role}</p>
          </div>
        </div>
      </CardContent>
      {onRefresh && (
        <CardFooter className="flex justify-center">
          <Button 
            variant={isLimitedData ? "default" : "outline"} 
            onClick={onRefresh}
            disabled={isOffline}
            className={`flex items-center gap-2 ${isLimitedData ? "bg-brand-600 hover:bg-brand-700" : ""}`}
          >
            <RefreshCw size={16} className={isLimitedData ? "" : ""} />
            {isLimitedData ? "Load Complete Profile" : "Refresh Profile"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ProfileInfoCard;
