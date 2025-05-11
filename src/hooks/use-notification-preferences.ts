
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useNotificationPreferences(userId?: string) {
  const [smsEnabled, setSmsEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Load preferences when component mounts
  useEffect(() => {
    async function loadPreferences() {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('sms_notifications_enabled')
          .eq('id', userId)
          .single();
          
        if (error) {
          console.error('Error loading notification preferences:', error);
          return;
        }
        
        if (data) {
          setSmsEnabled(!!data.sms_notifications_enabled);
        }
      } catch (error) {
        console.error('Exception loading notification preferences:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadPreferences();
  }, [userId]);

  // Save preferences
  const updateSmsPreference = async (enabled: boolean) => {
    if (!userId) {
      toast.error('You must be logged in to update notification preferences');
      return false;
    }
    
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          sms_notifications_enabled: enabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
        
      if (error) {
        console.error('Error updating notification preferences:', error);
        toast.error('Failed to update notification preferences');
        return false;
      }
      
      setSmsEnabled(enabled);
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

  return {
    smsEnabled,
    isLoading,
    isSaving,
    updateSmsPreference
  };
}
