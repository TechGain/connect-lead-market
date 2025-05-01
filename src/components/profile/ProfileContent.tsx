
import React, { useEffect, useState } from 'react';
import ProfileInfoCard from './ProfileInfoCard';
import ProfileSettingsCard from './ProfileSettingsCard';
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
  const [isFixingRole, setIsFixingRole] = useState(false);
  const [actualDatabaseRole, setActualDatabaseRole] = useState<'seller' | 'buyer' | null>(null);
  const [roleNeedsFixing, setRoleNeedsFixing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Direct fetch of role from database on component mount
  useEffect(() => {
    const fetchDirectRole = async () => {
      if (user?.id) {
        try {
          setIsLoading(true);
          console.log("ProfileContent: Directly fetching role from database for user:", user.id);
          
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.error("ProfileContent: Error fetching role from database:", error);
            console.error("ProfileContent: Error details:", error.message, error.code, error.details);
            setRoleNeedsFixing(true);
            return;
          }
          
          console.log("ProfileContent: Direct database role check result:", data?.role);
          
          if (data?.role) {
            const dbRole = String(data.role).toLowerCase();
            console.log("ProfileContent: Role type and value:", typeof dbRole, dbRole);
            
            if (dbRole === 'seller' || dbRole === 'buyer') {
              // Role exists and is valid, we don't need fixing
              setActualDatabaseRole(dbRole as 'seller' | 'buyer');
              setRoleNeedsFixing(false);
            } else {
              // Invalid role value
              console.error("ProfileContent: Invalid role value:", dbRole);
              setRoleNeedsFixing(true);
            }
          } else {
            // If no role in database, we need fixing
            console.error("ProfileContent: No role data found in profile");
            setRoleNeedsFixing(true);
          }
        } catch (err) {
          console.error("ProfileContent: Exception fetching role from database:", err);
          setRoleNeedsFixing(true);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchDirectRole();
  }, [user?.id]);

  const handleManualRefresh = async () => {
    if (!user?.id) return;
    
    setIsFixingRole(true);
    toast.info("Refreshing your role information...");
    
    try {
      // Try to update the role in the database directly if needed
      if (roleNeedsFixing && contextRole) {
        console.log("ProfileContent: Manually updating role in database to:", contextRole);
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            role: contextRole,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
        
        if (updateError) {
          console.error("ProfileContent: Error updating role:", updateError);
          console.error("ProfileContent: Error details:", updateError.message, updateError.code, updateError.details);
          toast.error("Failed to update your role");
        } else {
          toast.success(`Role updated to ${contextRole}`);
          setActualDatabaseRole(contextRole);
          setRoleNeedsFixing(false);
        }
      }
      
      // Also refresh via context
      refreshUserRole();
      
      // Re-verify the role
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (!error && data?.role) {
        const dbRole = String(data.role).toLowerCase();
        
        if (dbRole === 'seller' || dbRole === 'buyer') {
          setActualDatabaseRole(dbRole as 'seller' | 'buyer');
          toast.success(`Profile refreshed - role: ${dbRole}`);
        }
      }
    } catch (err) {
      console.error("Error in manual refresh:", err);
      toast.error("An error occurred during refresh");
    } finally {
      setIsFixingRole(false);
    }
  };

  // Final role to display - prioritize direct database query result
  const displayRole = actualDatabaseRole || contextRole;
  console.log("ProfileContent: Final display role:", displayRole);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <ProfileInfoCard profileData={profileData} role={displayRole} />
      <ProfileSettingsCard role={displayRole as 'seller' | 'buyer'} />
      
      {/* Only show role refresh UI if we have a user ID and either loading or role needs fixing */}
      {user?.id && (isLoading || roleNeedsFixing) && (
        <div className="lg:col-span-3 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-yellow-700 mb-1 font-medium">Profile Information Issue</p>
              <p className="text-yellow-600 text-sm">
                {isLoading ? "Loading your profile information..." : "Your profile information needs to be refreshed."}
              </p>
            </div>
            <div>
              <Button 
                onClick={handleManualRefresh} 
                disabled={isFixingRole}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <RefreshCw className={`h-4 w-4 ${isFixingRole ? 'animate-spin' : ''}`} />
                {isFixingRole ? 'Refreshing...' : 'Refresh Profile'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileContent;
