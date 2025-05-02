
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUserRole } from '@/hooks/use-user-role';

interface ProfileRoleFixButtonProps {
  userId: string;
  desiredRole: 'seller' | 'buyer';
}

const ProfileRoleFixButton = ({ userId, desiredRole }: ProfileRoleFixButtonProps) => {
  const [isFixing, setIsFixing] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const [shouldShow, setShouldShow] = useState(true);
  const { refreshUserRole } = useUserRole();

  // Check if user already has a role
  useEffect(() => {
    async function checkExistingRole() {
      if (!userId) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .maybeSingle();
          
        if (error) {
          console.error("Error checking profile:", error);
          return;
        }
        
        // If user already has any role, don't show the button
        if (data?.role) {
          setShouldShow(false);
          if (data.role === desiredRole) {
            setIsFixed(true);
          }
        }
      } catch (err) {
        console.error("Error checking role:", err);
      }
    }
    
    checkExistingRole();
  }, [userId, desiredRole]);

  const handleFix = async () => {
    if (isFixing || isFixed || !userId) return;
    
    setIsFixing(true);
    toast.info(`Setting your role to ${desiredRole}...`);
    
    try {
      // Check if user has a profile first
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
      
      if (checkError) {
        console.error("Error checking profile:", checkError);
        toast.error("Failed to check your profile. Please try again.");
        return;
      }

      // If profile exists and role is already set, we can't change it due to trigger restrictions
      if (existingProfile?.role) {
        if (existingProfile.role === desiredRole) {
          console.log(`User already has role: ${desiredRole}`);
          setIsFixed(true);
          toast.success(`Your account is already set as a ${desiredRole}!`);
        } else {
          console.warn(`Cannot change role from ${existingProfile.role} to ${desiredRole} due to database restrictions`);
          toast.error(`Your role is already set to ${existingProfile.role} and cannot be changed.`);
        }
        setIsFixing(false);
        return;
      }
      
      // If no profile exists, create one
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          role: desiredRole,
          full_name: 'User' // Providing a default value for required fields
        });
      
      if (error) {
        console.error("Error fixing role:", error);
        toast.error("Failed to update your role. Please try again.");
        setIsFixing(false);
        return;
      }
      
      console.log(`Role set to ${desiredRole} for user:`, userId);
      
      // Verify the update was successful
      const { data: verifyData, error: verifyError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (verifyError) {
        console.error("Error verifying role update:", verifyError);
      } else if (verifyData?.role === desiredRole) {
        console.log("Role update verified successfully:", verifyData.role);
        setIsFixed(true);
        toast.success(`Your account is now set as a ${desiredRole}!`);
        
        // Force refresh of user role in context
        refreshUserRole();
      } else {
        console.warn("Role update verification failed. Expected:", desiredRole, "Got:", verifyData?.role);
        toast.error(`Unable to set your role to ${desiredRole}. Please contact support.`);
      }
    } catch (error) {
      console.error("Exception fixing role:", error);
      toast.error("An error occurred while updating your role");
    } finally {
      setIsFixing(false);
    }
  };
  
  // Don't render anything if button shouldn't be shown
  if (!shouldShow) {
    return null;
  }
  
  return (
    <Button 
      onClick={handleFix}
      disabled={isFixing || isFixed}
      className="mt-2"
      variant={isFixed ? "outline" : "default"}
      size="sm"
    >
      {isFixing ? (
        <>
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          Fixing...
        </>
      ) : isFixed ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          Role Updated
        </>
      ) : (
        <>
          <RefreshCw className="h-4 w-4 mr-2" />
          Set as {desiredRole.charAt(0).toUpperCase() + desiredRole.slice(1)}
        </>
      )}
    </Button>
  );
};

export default ProfileRoleFixButton;
