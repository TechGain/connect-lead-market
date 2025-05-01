
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/use-user-role';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProfileBadge from '@/components/ProfileBadge';
import { supabase } from '@/integrations/supabase/client';

const Profile = () => {
  const navigate = useNavigate();
  const { isLoggedIn, role, user } = useUserRole();
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    company: '',
    rating: 4.7,
    joinedDate: '',
    avatar: undefined,
    totalLeads: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    console.log("Profile page - Current auth state:", { isLoggedIn, role, userId: user?.id });
    
    if (!isLoggedIn) {
      toast.error("You must be logged in to view your profile");
      navigate('/login');
      return;
    }
    
    // Fetch real profile data
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching profile data for user:", user?.id);
        
        if (!user) {
          throw new Error("User not found");
        }
        
        // Get profile data from Supabase
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error("Error fetching profile:", error);
          throw error;
        }
        
        console.log("Profile data retrieved:", profile);
        
        // Format registration date
        const registrationDate = new Date(user.created_at);
        const joinedDate = registrationDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        });
        
        // Count leads if user is a seller
        let totalLeads = 0;
        if (profile?.role === 'seller') {
          const { count, error: leadsError } = await supabase
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .eq('seller_id', user.id);
          
          if (!leadsError) {
            totalLeads = count || 0;
          }
        }
        
        // Update profile data state
        setProfileData({
          name: profile?.full_name || 'User',
          email: user.email || '',
          company: profile?.company || 'Not specified',
          rating: profile?.rating || 4.7,
          joinedDate,
          avatar: undefined,
          totalLeads
        });
      } catch (error) {
        console.error("Failed to load profile data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user?.id) {
      fetchProfileData();
    }
  }, [isLoggedIn, navigate, user, role]);
  
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
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
          </div>
        ) : (
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
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
