
import React, { useEffect, useState } from 'react';
import ProfileInfoCard from './ProfileInfoCard';
import ProfileSettingsCard from './ProfileSettingsCard';
import ProfileRoleFixButton from './ProfileRoleFixButton';
import { toast } from 'sonner';
import { useUserRole } from '@/hooks/use-user-role';
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
  // Get refresh function from context
  const { refreshUserRole, user } = useUserRole();
  const [localRole, setLocalRole] = useState<'seller' | 'buyer' | null>(contextRole);
  const [isFixingRole, setIsFixingRole] = useState(false);
  const [actualDatabaseRole, setActualDatabaseRole] = useState<string | null>(null);
  const [roleNeedsFixing, setRoleNeedsFixing] = useState(false);
  
  // Log to help debug role issues
  console.log("ProfileContent rendered with role:", contextRole);
  
  // Direct fetch of role from database on component mount
  useEffect(() => {
    const fetchDirectRole = async () => {
      if (user?.id) {
        try {
          console.log("Directly fetching role from database for user:", user.id);
          
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();
          
          if (error) {
            console.error("Error fetching role from database:", error);
            return;
          }
          
          console.log("Direct database role check result:", data?.role);
          setActualDatabaseRole(data?.role || null);
          
          if (data?.role) {
            const dbRole = String(data.role).toLowerCase();
            if (dbRole === 'seller' || dbRole === 'buyer') {
              console.log("Setting local role to database value:", dbRole);
              setLocalRole(dbRole as 'seller' | 'buyer');
              
              if (contextRole !== dbRole) {
                toast.info(`Your role was detected as ${dbRole}. Context will be refreshed.`);
                refreshUserRole();
              }
              
              // If we have a role in the database, we don't need fixing
              setRoleNeedsFixing(false);
            }
          } else {
            // If no role in database, we need fixing
            setRoleNeedsFixing(true);
          }
        } catch (err) {
          console.error("Exception fetching role from database:", err);
        }
      }
    };
    
    fetchDirectRole();
  }, [user?.id, contextRole, refreshUserRole]);

  const handleManualRefresh = async () => {
    if (!user?.id) return;
    
    setIsFixingRole(true);
    toast.info("Refreshing your role information...");
    
    try {
      // Direct database query to get current role
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching role during refresh:", error);
        toast.error("Error fetching your role information");
        return;
      }
      
      if (data?.role) {
        const dbRole = String(data.role).toLowerCase();
        console.log("Database role during refresh:", dbRole);
        
        if (dbRole === 'seller' || dbRole === 'buyer') {
          setLocalRole(dbRole as 'seller' | 'buyer');
          refreshUserRole();
          toast.success(`Your role has been refreshed: ${dbRole}`);
          setRoleNeedsFixing(false);
        } else {
          toast.warning("Invalid role found in database");
        }
      } else {
        toast.warning("No role found in your profile");
        setRoleNeedsFixing(true);
      }
    } catch (err) {
      console.error("Exception during manual refresh:", err);
      toast.error("An error occurred while refreshing your role");
    } finally {
      setIsFixingRole(false);
    }
  };

  // Use local role first, fallback to context role, then default to 'buyer'
  const displayRole = localRole || contextRole || 'buyer';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <ProfileInfoCard profileData={profileData} role={displayRole as 'seller' | 'buyer'} />
      <ProfileSettingsCard role={displayRole as 'seller' | 'buyer'} />
      
      {roleNeedsFixing && user?.id && (
        <div className="lg:col-span-3 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-yellow-700 mb-1 font-medium">Account Role Issue Detected</p>
              <p className="text-yellow-600 text-sm">
                Your account role is not properly set. Please choose a role below:
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleManualRefresh} 
                disabled={isFixingRole}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <RefreshCw className={`h-4 w-4 ${isFixingRole ? 'animate-spin' : ''}`} />
                {isFixingRole ? 'Refreshing...' : 'Refresh Role'}
              </Button>
              
              <div className="flex gap-2">
                <ProfileRoleFixButton userId={user.id} desiredRole="buyer" />
                <ProfileRoleFixButton userId={user.id} desiredRole="seller" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileContent;
