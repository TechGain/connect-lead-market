
import React, { useState } from 'react';
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
  const { refreshUserRole } = useUserRole();

  const handleFix = async () => {
    if (isFixing || isFixed || !userId) return;
    
    setIsFixing(true);
    toast.info(`Setting your role to ${desiredRole}...`);
    
    try {
      // Clear any mock leads if switching roles
      if (desiredRole === 'buyer') {
        // If switching to buyer, we might want to remove any seller-related data
        console.log("Switching to buyer role");
      }
      
      // Direct database update to fix the role
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          role: desiredRole,
          full_name: 'User', // Providing a default value for required fields
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      
      if (error) {
        console.error("Error fixing role:", error);
        toast.error("Failed to update your role. Please try again.");
        return;
      }
      
      console.log(`Role directly updated to ${desiredRole} for user:`, userId);
      
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
