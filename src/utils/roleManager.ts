
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Directly ensures that a profile exists with the correct role for a given user
 */
export async function ensureUserProfile(userId: string, role?: 'seller' | 'buyer', fullName?: string): Promise<'seller' | 'buyer' | 'admin' | null> {
  try {
    console.log('ensureUserProfile called for userId:', userId, 'with role:', role);
    
    // First, check if the profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id, role, full_name')
      .eq('id', userId)
      .maybeSingle();
    
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error fetching profile:', fetchError);
      return null;
    }
    
    // If profile exists, check if role is valid
    if (existingProfile) {
      console.log('Existing profile found:', existingProfile);
      
      // Return admin role if it exists - but don't allow changing to it
      if (existingProfile.role === 'admin') {
        console.log('Admin role found');
        return 'admin';
      }
      
      // For non-admin roles, proceed as usual
      if (existingProfile.role === 'seller' || existingProfile.role === 'buyer') {
        console.log('Valid role found:', existingProfile.role);
        return existingProfile.role;
      }
      
      // If role is invalid and we have a provided role, update it
      // Only allow updating to seller or buyer
      if (role && (role === 'seller' || role === 'buyer')) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            role,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
        
        if (updateError) {
          console.error('Error updating profile role:', updateError);
          return null;
        }
        
        console.log('Profile role updated to:', role);
        return role;
      }
      
      return null;
    }
    
    // Profile doesn't exist, create it with mandatory fields
    // Default to buyer if no role provided, NEVER create admin through this function
    const defaultRole = role && (role === 'seller' || role === 'buyer') ? role : 'buyer';
    
    // Define profile data according to the expected schema
    const profileData = {
      id: userId,
      full_name: fullName || 'User',
      role: defaultRole
    };
    
    const { error: createError } = await supabase
      .from('profiles')
      .insert(profileData);
    
    if (createError) {
      console.error('Error creating profile:', createError);
      return null;
    }
    
    console.log('New profile created with role:', defaultRole);
    return defaultRole;
  } catch (error) {
    console.error('Exception in ensureUserProfile:', error);
    return null;
  }
}

/**
 * Gets the current user's role directly from the database
 */
export async function getUserRole(userId: string): Promise<'seller' | 'buyer' | 'admin' | null> {
  try {
    if (!userId) {
      console.warn('getUserRole called with no userId');
      return null;
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
    
    if (!data || !data.role) {
      console.warn('No role found for user:', userId);
      return null;
    }
    
    // Normalize and validate role
    const normalizedRole = String(data.role).toLowerCase();
    if (normalizedRole === 'seller' || normalizedRole === 'buyer' || normalizedRole === 'admin') {
      return normalizedRole as 'seller' | 'buyer' | 'admin';
    }
    
    console.warn('Invalid role found for user:', normalizedRole);
    return null;
  } catch (error) {
    console.error('Exception in getUserRole:', error);
    return null;
  }
}

/**
 * Directly updates a user's role in the database
 * IMPORTANT: This function can never set a user to admin role
 */
export async function updateUserRole(userId: string, role: 'seller' | 'buyer'): Promise<boolean> {
  try {
    // Validate role input to ensure we never allow setting admin role
    if (role !== 'seller' && role !== 'buyer') {
      console.error('Invalid role provided:', role);
      return false;
    }
    
    console.log('Updating user role for', userId, 'to', role);
    
    // Check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', userId)
      .maybeSingle();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking profile existence:', checkError);
      return false;
    }
    
    // If user is already admin, do not allow changing the role
    if (existingProfile?.role === 'admin') {
      console.warn('Attempted to change admin role to', role);
      return false;
    }
    
    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          role,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (updateError) {
        console.error('Error updating profile role:', updateError);
        return false;
      }
      
      console.log('Profile role successfully updated to:', role);
      return true;
    } else {
      // Create new profile if it doesn't exist
      // Define profile data according to the expected schema type
      const profileData = {
        id: userId,
        role,
        full_name: 'User' // Default name, should be updated later
      };
      
      const { error: createError } = await supabase
        .from('profiles')
        .insert(profileData);
      
      if (createError) {
        console.error('Error creating profile:', createError);
        return false;
      }
      
      console.log('New profile created with role:', role);
      return true;
    }
  } catch (error) {
    console.error('Exception in updateUserRole:', error);
    return false;
  }
}
