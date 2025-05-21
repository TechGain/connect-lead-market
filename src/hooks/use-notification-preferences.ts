
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useNotificationPreferences = (userId?: string) => {
  const [smsEnabled, setSmsEnabled] = useState<boolean>(false);
  const [emailEnabled, setEmailEnabled] = useState<boolean>(true);
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
          .from('profiles')
          .select('sms_notifications_enabled, email_notifications_enabled')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching notification preferences:', error);
          return;
        }

        if (data) {
          setSmsEnabled(data.sms_notifications_enabled || false);
          setEmailEnabled(data.email_notifications_enabled || false);
        }
      } catch (error) {
        console.error('Exception fetching notification preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, [userId]);

  const updateSmsPreference = async (enabled: boolean) => {
    if (!userId) return;

    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({ sms_notifications_enabled: enabled })
        .eq('id', userId);

      if (error) {
        console.error('Error updating SMS notification preference:', error);
        toast.error('Failed to update notification preferences');
        return false;
      }

      setSmsEnabled(enabled);
      toast.success(`SMS notifications ${enabled ? 'enabled' : 'disabled'}`);
      return true;
    } catch (error) {
      console.error('Exception updating SMS notification preference:', error);
      toast.error('Failed to update notification preferences');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updateEmailPreference = async (enabled: boolean) => {
    if (!userId) return;

    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({ email_notifications_enabled: enabled })
        .eq('id', userId);

      if (error) {
        console.error('Error updating email notification preference:', error);
        toast.error('Failed to update notification preferences');
        return false;
      }

      setEmailEnabled(enabled);
      toast.success(`Email notifications ${enabled ? 'enabled' : 'disabled'}`);
      return true;
    } catch (error) {
      console.error('Exception updating email notification preference:', error);
      toast.error('Failed to update notification preferences');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    smsEnabled,
    emailEnabled,
    isLoading,
    isSaving,
    updateSmsPreference,
    updateEmailPreference
  };
};
