
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/use-user-role';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProfileBadge from '@/components/ProfileBadge';

const Profile = () => {
  const navigate = useNavigate();
  const { isLoggedIn, role } = useUserRole();
  
  React.useEffect(() => {
    if (!isLoggedIn) {
      toast.error("You must be logged in to view your profile");
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);
  
  // Mock profile data - in a real app, this would come from an API
  const profileData = {
    name: role === 'seller' ? 'John Smith' : 'Jane Doe',
    email: role === 'seller' ? 'john@leadgenerator.com' : 'jane@contractor.com',
    company: role === 'seller' ? 'Lead Generator Inc.' : 'Quality Contracting LLC',
    rating: 4.7,
    joinedDate: 'January 2023',
    avatar: undefined,
    totalLeads: role === 'seller' ? 48 : undefined
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-gray-600">
            Manage your account information and settings
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-col items-center text-center">
              <ProfileBadge
                name={profileData.name}
                rating={profileData.rating}
                avatar={profileData.avatar}
                role={role as 'seller' | 'buyer'}
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
                  <p className="capitalize">{role}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button variant="outline" onClick={() => toast.info("Edit profile functionality coming soon")}>
                Edit Profile
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account preferences and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Notification Settings</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Configure how you receive notifications
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toast.info("Notification settings coming soon")}
                >
                  Configure
                </Button>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Password & Security</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Update your password and security settings
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toast.info("Security settings coming soon")}
                >
                  Manage
                </Button>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Payment Methods</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {role === 'buyer' ? 'Add or update your payment methods' : 'Set up how you receive payments'}
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toast.info("Payment settings coming soon")}
                >
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
