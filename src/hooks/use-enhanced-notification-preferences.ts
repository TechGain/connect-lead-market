
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
          setPreferences({
            email_notifications_enabled: data.email_notifications_enabled,
            preferred_lead_types: data.preferred_lead_types || [],
            preferred_locations: data.preferred_locations || []
          });
        } else {
          // Create default preferences if none exist
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
      const { error } = await supabase
        .from('user_notification_preferences')
        .insert({
          user_id: userId,
          email_notifications_enabled: true,
          preferred_lead_types: [],
          preferred_locations: []
        });

      if (error) {
        console.error('Error creating default preferences:', error);
      }
    } catch (error) {
      console.error('Exception creating default preferences:', error);
    }
  };

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!userId) return false;

    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          ...updates
        });

      if (error) {
        console.error('Error updating notification preferences:', error);
        toast.error('Failed to update notification preferences');
        return false;
      }

      setPreferences(prev => ({ ...prev, ...updates }));
      toast.success('Notification preferences updated successfully');
      return true;
    } catch (error) {
      console.error('Exception updating notification preferences:', error);
      toast.error('Failed to update notification preferences');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updateEmailEnabled = async (enabled: boolean) => {
    return updatePreferences({ email_notifications_enabled: enabled });
  };

  const updateLeadTypes = async (leadTypes: string[]) => {
    return updatePreferences({ preferred_lead_types: leadTypes });
  };

  const updateLocations = async (locations: string[]) => {
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
