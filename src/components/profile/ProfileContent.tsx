
import React, { useEffect, useState } from 'react';
import ProfileInfoCard from './ProfileInfoCard';
import ProfileSettingsCard from './ProfileSettingsCard';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProfileContentProps {
  profileData: {
    name: string;
    email: string;
    company: string;
    rating: number;
    joinedDate: string;
    avatar: string | undefined;
    totalLeads: number;
  };
  role: 'seller' | 'buyer' | null;
}

const ProfileContent = ({ profileData, role: contextRole }: ProfileContentProps) => {
  const [actualDatabaseRole, setActualDatabaseRole] = useState<'seller' | 'buyer' | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Direct fetch of role from database
  const fetchDatabaseRole = async () => {
    try {
      setIsRefreshing(true);
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user?.id) {
        console.log("ProfileContent: No user session found");
        setIsRefreshing(false);
        return;
      }
      
      console.log("ProfileContent: Directly fetching role from database for user:", session.session.user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.session.user.id)
        .maybeSingle();
      
      if (error) {
        console.error("ProfileContent: Error fetching role from database:", error);
        console.error("ProfileContent: Error details:", error.message, error.code, error.details);
        setIsRefreshing(false);
        return;
      }
      
      if (data?.role) {
        const dbRole = String(data.role).toLowerCase();
        console.log("ProfileContent: Direct database role found:", dbRole);
        
        if (dbRole === 'seller' || dbRole === 'buyer') {
          setActualDatabaseRole(dbRole as 'seller' | 'buyer');
        }
      }
    } catch (err) {
      console.error("ProfileContent: Exception fetching role from database:", err);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Fetch role on mount
  useEffect(() => {
    fetchDatabaseRole();
  }, []);

  // Handle refresh action
  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast.info("Refreshing your profile...");
    
    try {
      await fetchDatabaseRole();
      toast.success("Profile refreshed");
    } catch (err) {
      console.error("Error refreshing profile:", err);
      toast.error("Failed to refresh profile");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Final role to display - prioritize direct database query result
  const displayRole = actualDatabaseRole || contextRole || 'buyer'; // Default to 'buyer' if no role found
  console.log("ProfileContent: Final display role:", displayRole);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <ProfileInfoCard profileData={profileData} role={displayRole} />
      <ProfileSettingsCard role={displayRole} />
      
      <div className="lg:col-span-3 mt-4">
        <div className="flex justify-center">
          <Button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Profile'}
          </Button>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
            <p>Database role: {actualDatabaseRole || 'Not found'}</p>
            <p>Context role: {contextRole || 'None'}</p>
            <p>Display role: {displayRole}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileContent;
