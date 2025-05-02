
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
        
        // Store in localStorage as backup
        try {
          localStorage.setItem('user_role', existingProfile.role);
        } catch (err) {
          console.warn("Could not store role in localStorage", err);
        }
        
        return existingProfile.role;
      }
      
      // If role is invalid and we have a provided role, update it
      if (role) {
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
        
        // Store in localStorage as backup
        try {
          localStorage.setItem('user_role', role);
        } catch (err) {
          console.warn("Could not store role in localStorage", err);
        }
        
        return role;
      }
      
      return null;
    }
    
    // Profile doesn't exist, create it with mandatory fields
    const defaultRole = role || 'buyer';
    
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
    
    // Store in localStorage as backup
    try {
      localStorage.setItem('user_role', defaultRole);
    } catch (err) {
      console.warn("Could not store role in localStorage", err);
    }
    
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
    
    console.log('Getting user role for userId:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user role:', error);
      
      // Try to fallback to cached role
      try {
        const cachedRole = localStorage.getItem('user_role');
        if (cachedRole === 'seller' || cachedRole === 'buyer') {
          console.log("Fallback to cached role from localStorage:", cachedRole);
          return cachedRole as 'seller' | 'buyer';
        }
      } catch (err) {
        console.warn("Could not retrieve cached role", err);
      }
      
      return null;
    }
    
    if (!data || !data.role) {
      console.warn('No role found for user:', userId);
      
      // Try to fallback to cached role
      try {
        const cachedRole = localStorage.getItem('user_role');
        if (cachedRole === 'seller' || cachedRole === 'buyer') {
          console.log("Fallback to cached role from localStorage:", cachedRole);
          return cachedRole as 'seller' | 'buyer';
        }
      } catch (err) {
        console.warn("Could not retrieve cached role", err);
      }
      
      return null;
    }
    
    // Normalize and validate role
    const normalizedRole = String(data.role).toLowerCase();
    if (normalizedRole === 'seller' || normalizedRole === 'buyer') {
      // Store in localStorage as backup
      try {
        localStorage.setItem('user_role', normalizedRole);
      } catch (err) {
        console.warn("Could not store role in localStorage", err);
      }
      
      return normalizedRole as 'seller' | 'buyer';
    }
    
    console.warn('Invalid role found for user:', normalizedRole);
    return null;
  } catch (error) {
    console.error('Exception in getUserRole:', error);
    
    // Try to fallback to cached role
    try {
      const cachedRole = localStorage.getItem('user_role');
      if (cachedRole === 'seller' || cachedRole === 'buyer') {
        console.log("Exception fallback to cached role from localStorage:", cachedRole);
        return cachedRole as 'seller' | 'buyer';
      }
    } catch (err) {
      console.warn("Could not retrieve cached role", err);
    }
    
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
      
      // Store in localStorage as backup
      try {
        localStorage.setItem('user_role', role);
      } catch (err) {
        console.warn("Could not store role in localStorage", err);
      }
      
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
      
      // Store in localStorage as backup
      try {
        localStorage.setItem('user_role', role);
      } catch (err) {
        console.warn("Could not store role in localStorage", err);
      }
      
      return true;
    }
  } catch (error) {
    console.error('Exception in updateUserRole:', error);
    return false;
  }
}
