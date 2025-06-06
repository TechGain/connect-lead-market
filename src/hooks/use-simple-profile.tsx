
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUserRole } from '@/hooks/use-user-role';

export interface ProfileData {
  name: string;
  email: string;
  company: string;
  role: 'seller' | 'buyer';
  rating: number;
  joinedDate: string;
  totalLeads: number;
  phone?: string | null;
}

export const useSimpleProfile = (isOffline = false) => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUserRole();
  
  // Direct profile fetch function
  const fetchProfileData = useCallback(async () => {
    if (isOffline) {
      // In offline mode, try to use cached data only
      try {
        const cachedUserStr = localStorage.getItem('cachedUser');
        const userId = user?.id || (cachedUserStr ? JSON.parse(cachedUserStr).id : null);
        
        if (userId) {
          const cachedProfileStr = localStorage.getItem(`profile_${userId}`);
          if (cachedProfileStr) {
            const cachedProfile = JSON.parse(cachedProfileStr);
            const cachedUser = user || (cachedUserStr ? JSON.parse(cachedUserStr) : null);
            
            const fallbackProfile: ProfileData = {
              name: cachedProfile?.full_name || cachedUser?.user_metadata?.full_name || 'User',
              email: cachedProfile?.email || cachedUser?.email || 'Email unavailable',
              company: cachedProfile?.company || 'Not specified',
              role: (cachedProfile?.role?.toLowerCase() === 'seller' ? 'seller' : 'buyer') as 'seller' | 'buyer',
              rating: cachedProfile?.rating || 4.7,
              joinedDate: cachedUser?.created_at ? 
                new Date(cachedUser.created_at).toLocaleDateString('en-US', {year: 'numeric', month: 'long'}) : 
                'Unknown',
              totalLeads: cachedProfile?.total_leads || 0,
              phone: cachedProfile?.phone || null
            };
            
            setProfileData(fallbackProfile);
          }
        }
        
        setIsLoading(false);
        return;
      } catch (err) {
        console.error('Error retrieving cached profile:', err);
        setError('Unable to retrieve cached profile data');
        setIsLoading(false);
        return;
      }
    }
    
    // If we're online, proceed with fetching fresh data
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("useSimpleProfile: Starting fetch for user:", user?.id);
      
      // Get user info first
      let currentUser = user;
      if (!currentUser?.id) {
        console.log("useSimpleProfile: No user in context, trying session");
        const { data: session } = await supabase.auth.getSession();
        currentUser = session?.session?.user;
        
        if (!currentUser?.id) {
          throw new Error('User not authenticated');
        }
        
        console.log("useSimpleProfile: Got user from session:", currentUser.id);
      }
      
      // Direct, simple fetch from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();
      
      if (profileError) {
        console.error('useSimpleProfile: Error fetching profile:', profileError);
        throw new Error(`Failed to fetch profile: ${profileError.message}`);
      }
      
      console.log("useSimpleProfile: Profile fetched successfully:", profile);
      
      // Cache profile for offline mode
      localStorage.setItem(`profile_${currentUser.id}`, JSON.stringify(profile));
      
      // Determine lead count based on role
      let totalLeads = 0;
      if (profile.role?.toLowerCase() === 'seller') {
        try {
          // Count leads for sellers
          const { count } = await supabase
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .eq('seller_id', currentUser.id);
          
          totalLeads = count || 0;
        } catch (err) {
          console.warn('useSimpleProfile: Error counting leads:', err);
        }
      } else if (profile.role?.toLowerCase() === 'buyer') {
        try {
          // Count purchased leads for buyers
          const { count } = await supabase
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .eq('buyer_id', currentUser.id)
            .eq('status', 'sold');
          
          totalLeads = count || 0;
        } catch (err) {
          console.warn('useSimpleProfile: Error counting leads:', err);
        }
      }
      
      const formattedProfile: ProfileData = {
        name: profile.full_name || currentUser?.user_metadata?.full_name || 'User',
        email: profile.email || currentUser.email || '',
        company: profile.company || 'Not specified',
        role: (profile.role?.toLowerCase() === 'seller' ? 'seller' : 'buyer') as 'seller' | 'buyer',
        rating: profile.rating || 4.7,
        joinedDate: new Date(currentUser.created_at || Date.now()).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long'
        }),
        totalLeads,
        phone: profile.phone || null
      };
      
      console.log("useSimpleProfile: Formatted profile:", formattedProfile);
      setProfileData(formattedProfile);
    } catch (err: any) {
      console.error('useSimpleProfile: Error in profile fetch:', err);
      setError(err.message || 'Failed to load profile data');
      
      // Try to get cached data as fallback
      try {
        const cachedUserStr = localStorage.getItem('cachedUser');
        const userId = user?.id || (cachedUserStr ? JSON.parse(cachedUserStr).id : null);
        
        if (userId) {
          const cachedProfileStr = localStorage.getItem(`profile_${userId}`);
          if (cachedProfileStr) {
            const cachedProfile = JSON.parse(cachedProfileStr);
            const cachedUser = user || (cachedUserStr ? JSON.parse(cachedUserStr) : null);
            
            console.log("useSimpleProfile: Using cached profile data");
            toast.warning('Using cached profile data due to connection issues');
            
            const fallbackProfile: ProfileData = {
              name: cachedProfile?.full_name || cachedUser?.user_metadata?.full_name || 'User',
              email: cachedProfile?.email || cachedUser?.email || 'Email unavailable',
              company: cachedProfile?.company || 'Not specified',
              role: (cachedProfile?.role?.toLowerCase() === 'seller' ? 'seller' : 'buyer') as 'seller' | 'buyer',
              rating: cachedProfile?.rating || 4.7,
              joinedDate: cachedUser?.created_at ? 
                new Date(cachedUser.created_at).toLocaleDateString('en-US', {year: 'numeric', month: 'long'}) : 
                'Unknown',
              totalLeads: cachedProfile?.total_leads || 0,
              phone: cachedProfile?.phone || null
            };
            
            setProfileData(fallbackProfile);
          }
        }
      } catch (cacheErr) {
        console.error('useSimpleProfile: Error retrieving cached profile:', cacheErr);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, isOffline]);
  
  // Manual refresh function
  const refreshProfile = useCallback(() => {
    console.log("useSimpleProfile: Manual refresh triggered");
    toast.info('Refreshing profile data...');
    fetchProfileData();
  }, [fetchProfileData]);
  
  // Fetch on mount
  useEffect(() => {
    console.log("useSimpleProfile: useEffect triggered, user:", user?.id);
    fetchProfileData();
  }, [fetchProfileData]);
  
  return {
    profileData,
    isLoading,
    error,
    refreshProfile
  };
};
