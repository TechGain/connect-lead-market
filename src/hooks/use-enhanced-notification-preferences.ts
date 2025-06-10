
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NotificationPreferences {
  email_notifications_enabled: boolean;
  preferred_lead_types: string[];
  preferred_locations: string[];
}

export const useEnhancedNotificationPreferences = (userId?: string) => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications_enabled: true,
    preferred_lead_types: [],
    preferred_locations: []
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('Fetching notification preferences for user:', userId);
        
        const { data, error } = await supabase
          .from('user_notification_preferences')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching notification preferences:', error);
          return;
        }

        if (data) {
          console.log('Found existing preferences:', data);
          setPreferences({
            email_notifications_enabled: data.email_notifications_enabled,
            preferred_lead_types: data.preferred_lead_types || [],
            preferred_locations: data.preferred_locations || []
          });
        } else {
          console.log('No preferences found, creating default preferences');
          await createDefaultPreferences();
        }
      } catch (error) {
        console.error('Exception fetching notification preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, [userId]);

  const createDefaultPreferences = async () => {
    if (!userId) return;

    try {
      console.log('Creating default preferences for user:', userId);
      
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .insert({
          user_id: userId,
          email_notifications_enabled: true,
          preferred_lead_types: [],
          preferred_locations: []
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating default preferences:', error);
        throw error;
      }

      console.log('Created default preferences:', data);
      
      setPreferences({
        email_notifications_enabled: data.email_notifications_enabled,
        preferred_lead_types: data.preferred_lead_types || [],
        preferred_locations: data.preferred_locations || []
      });
      
    } catch (error) {
      console.error('Exception creating default preferences:', error);
    }
  };

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!userId) {
      console.error('No userId provided for preferences update');
      return false;
    }

    try {
      setIsSaving(true);
      
      const updatedPreferences = { ...preferences, ...updates };
      console.log('Updating preferences for user:', userId, 'with data:', updatedPreferences);
      
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .upsert(
          {
            user_id: userId,
            email_notifications_enabled: updatedPreferences.email_notifications_enabled,
            preferred_lead_types: updatedPreferences.preferred_lead_types,
            preferred_locations: updatedPreferences.preferred_locations
          },
          {
            onConflict: 'user_id',
            ignoreDuplicates: false
          }
        )
        .select()
        .single();

      if (error) {
        console.error('Error updating notification preferences:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        toast.error(`Failed to update notification preferences: ${error.message}`);
        return false;
      }

      console.log('Successfully updated preferences:', data);
      setPreferences(updatedPreferences);
      toast.success('Notification preferences updated successfully');
      return true;
    } catch (error: any) {
      console.error('Exception updating notification preferences:', error);
      toast.error(`Failed to update notification preferences: ${error.message || 'Unknown error'}`);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updateEmailEnabled = async (enabled: boolean) => {
    console.log('Updating email enabled to:', enabled);
    return updatePreferences({ email_notifications_enabled: enabled });
  };

  const updateLeadTypes = async (leadTypes: string[]) => {
    console.log('Updating lead types to:', leadTypes);
    return updatePreferences({ preferred_lead_types: leadTypes });
  };

  const updateLocations = async (locations: string[]) => {
    console.log('Updating locations to:', locations);
    return updatePreferences({ preferred_locations: locations });
  };

  return {
    preferences,
    isLoading,
    isSaving,
    updateEmailEnabled,
    updateLeadTypes,
    updateLocations
  };
};
