
import React, { useEffect, useState } from 'react';
import ProfileInfoCard from './ProfileInfoCard';
import ProfileSettingsCard from './ProfileSettingsCard';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ProfileData {
  name: string;
  email: string;
  company: string;
  rating: number;
  joinedDate: string;
  totalLeads: number;
}

interface ProfileContentProps {
  profileData: ProfileData;
  userData?: any;
  refreshProfile: () => void;
  isOffline?: boolean;
  role: 'seller' | 'buyer';
}

const ProfileContent = ({ 
  profileData, 
  userData,
  refreshProfile, 
  isOffline = false,
  role
}: ProfileContentProps) => {
  const [leadCount, setLeadCount] = useState<number>(profileData.totalLeads || 0);
  
  useEffect(() => {
    const fetchLeadCount = async () => {
      if (isOffline || !userData?.id) return;
      
      try {
        let query;
        if (role === 'seller') {
          // Count leads sold by this seller (status = 'sold')
          query = supabase
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .eq('seller_id', userData.id)
            .eq('status', 'sold');
        } else {
          // Count leads purchased by this buyer
          query = supabase
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .eq('buyer_id', userData.id)
            .eq('status', 'sold');
        }
        
        const { count, error } = await query;
        
        if (error) {
          console.error("Error fetching lead count:", error);
          return;
        }
        
        if (count !== null) {
          setLeadCount(count);
        }
      } catch (err) {
        console.error("Exception in leads count fetch:", err);
      }
    };
    
    fetchLeadCount();
  }, [userData?.id, role, isOffline]);
  
  // Handle refresh with visual feedback
  const handleRefresh = () => {
    if (isOffline) {
      toast.warning("You're currently offline. Please check your connection first.");
      return;
    }
    
    refreshProfile();
    toast.info("Refreshing profile data...");
  };
  
  console.log("ProfileContent rendering with:", {
    name: profileData.name,
    company: profileData.company,
    role,
    isOffline,
    leadCount
  });
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <ProfileInfoCard 
        profileData={{
          ...profileData,
          avatar: undefined, // No avatar support yet
          totalLeads: leadCount // Use the fetched count
        }} 
        role={role}
        onRefresh={handleRefresh}
        isOffline={isOffline}
      />
      <ProfileSettingsCard 
        role={role} 
        disabled={isOffline}
      />
    </div>
  );
};

export default ProfileContent;
