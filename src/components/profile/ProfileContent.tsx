
import React, { useEffect, useState } from 'react';
import ProfileInfoCard from './ProfileInfoCard';
import ProfileSettingsCard from './ProfileSettingsCard';
import { toast } from 'sonner';
import { useUserRole } from '@/hooks/use-user-role';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { ensureUserProfile, getUserRole } from '@/utils/roleManager';

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
  
  // Log to help debug role issues
  console.log("ProfileContent rendered with role:", contextRole);
  
  // Direct fetch of role from database on component mount
  useEffect(() => {
    const fetchDirectRole = async () => {
      if (user?.id) {
        console.log("Directly fetching role from database for user:", user.id);
        const dbRole = await getUserRole(user.id);
        console.log("Direct database role check result:", dbRole);
        
        if (dbRole && dbRole !== localRole) {
          console.log("Setting local role to database value:", dbRole);
          setLocalRole(dbRole);
          if (contextRole !== dbRole) {
            toast.info(`Your role was detected as ${dbRole}. Context will be refreshed.`);
            refreshUserRole();
          }
        }
      }
    };
    
    fetchDirectRole();
  }, [user?.id, contextRole, localRole, refreshUserRole]);
  
  // If role is null, let's add a more detailed warning and try to fix it
  useEffect(() => {
    const fixRole = async () => {
      if (contextRole === null && user?.id && !isFixingRole) {
        console.warn("Warning: Profile content rendering with null role. User may need to refresh.");
        toast.warning("Your account role could not be determined. Attempting to fix...");
        
        setIsFixingRole(true);
        
        try {
          // First try to get role directly from database
          const dbRole = await getUserRole(user.id);
          console.log("Direct role check result:", dbRole);
          
          if (dbRole) {
            setLocalRole(dbRole);
            refreshUserRole();
            toast.success(`Role found: ${dbRole}. Profile refreshed.`);
          } else {
            // If no role found, try to create/ensure profile
            console.log("No role found, ensuring profile exists...");
            const role = await ensureUserProfile(user.id);
            
            if (role) {
              setLocalRole(role);
              refreshUserRole();
              toast.success(`Profile fixed with role: ${role}`);
            } else {
              toast.error("Could not fix your profile. Please try logging out and back in.");
            }
          }
        } catch (error) {
          console.error("Error fixing role:", error);
          toast.error("Error fixing profile. Please try again.");
        } finally {
          setIsFixingRole(false);
        }
      }
    };
    
    fixRole();
  }, [contextRole, user?.id, isFixingRole, refreshUserRole]);

  // Use local role first, fallback to context role, then default to 'buyer'
  const displayRole = localRole || contextRole || 'buyer';

  const handleManualFix = async () => {
    if (user?.id) {
      setIsFixingRole(true);
      toast.info("Attempting to fix your profile...");
      
      try {
        // Get role from metadata if available
        const metadataRole = user.user_metadata?.role;
        const roleToUse = (metadataRole === 'seller' || metadataRole === 'buyer') 
          ? metadataRole 
          : 'buyer'; // Default to buyer if no valid metadata role
        
        console.log("Manually fixing profile with role:", roleToUse);
        const success = await ensureUserProfile(user.id, roleToUse as 'seller' | 'buyer');
        
        if (success) {
          setLocalRole(roleToUse as 'seller' | 'buyer');
          refreshUserRole();
          toast.success(`Profile fixed with role: ${roleToUse}`);
        } else {
          toast.error("Could not fix your profile. Please try logging out and back in.");
        }
      } catch (error) {
        console.error("Error in manual fix:", error);
        toast.error("Error fixing profile. Please try again.");
      } finally {
        setIsFixingRole(false);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <ProfileInfoCard profileData={profileData} role={displayRole as 'seller' | 'buyer'} />
      <ProfileSettingsCard role={displayRole as 'seller' | 'buyer'} />
      
      {(contextRole === null || localRole !== contextRole) && (
        <div className="lg:col-span-3 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-yellow-700 mb-1 font-medium">Account Role Issue Detected</p>
              <p className="text-yellow-600 text-sm">
                Your account role is {contextRole === null ? 'not set' : 'inconsistent'}. 
                Currently displaying as: <span className="font-medium">{displayRole}</span>
              </p>
            </div>
            <Button 
              onClick={handleManualFix} 
              disabled={isFixingRole}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <RefreshCw className={`h-4 w-4 ${isFixingRole ? 'animate-spin' : ''}`} />
              {isFixingRole ? 'Fixing...' : 'Fix My Profile'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileContent;
