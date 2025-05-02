
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];

/**
 * Directly ensures that a profile exists with the correct role for a given user
 */
export async function ensureUserProfile(userId: string, role?: 'seller' | 'buyer', fullName?: string): Promise<'seller' | 'buyer' | null> {
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
      
      // If the role is valid, return it
      if (existingProfile.role === 'seller' || existingProfile.role === 'buyer') {
        console.log('Valid role found:', existingProfile.role);
        return existingProfile.role;
      }
      
      // If role is invalid and we have a provided role, update it
      if (role) {
        const updateData = {
          role,
          updated_at: new Date().toISOString()
        };
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
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
    const defaultRole = role || 'buyer';
    
    const profileData: ProfileInsert = {
      id: userId,
      role: defaultRole,
      full_name: fullName || 'User',
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
export async function getUserRole(userId: string): Promise<'seller' | 'buyer' | null> {
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
    if (normalizedRole === 'seller' || normalizedRole === 'buyer') {
      return normalizedRole as 'seller' | 'buyer';
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
 */
export async function updateUserRole(userId: string, role: 'seller' | 'buyer'): Promise<boolean> {
  try {
    console.log('Updating user role for', userId, 'to', role);
    
    // Check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking profile existence:', checkError);
      return false;
    }
    
    if (existingProfile) {
      // Update existing profile
      const updateData = { 
        role,
        updated_at: new Date().toISOString()
      };
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);
      
      if (updateError) {
        console.error('Error updating profile role:', updateError);
        return false;
      }
      
      console.log('Profile role successfully updated to:', role);
      return true;
    } else {
      // Create new profile if it doesn't exist
      const profileData: ProfileInsert = {
        id: userId,
        role,
        full_name: 'User', // Default name, should be updated later
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
