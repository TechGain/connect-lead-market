
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useNotificationPreferences } from '@/hooks/use-notification-preferences';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPhoneToE164 } from '@/utils/format-helpers';

interface NotificationPreferencesProps {
  userId?: string;
  userPhone?: string | null;
}

export const NotificationPreferences = ({ userId, userPhone }: NotificationPreferencesProps) => {
  const { smsEnabled, isLoading, isSaving, updateSmsPreference } = useNotificationPreferences(userId);
  
  const handleSmsToggle = async (checked: boolean) => {
    await updateSmsPreference(checked);
  };

  // Format phone number for display
  const formattedPhone = userPhone ? formatPhoneToE164(userPhone) : null;
  const displayPhone = formattedPhone || userPhone;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Manage how you receive notifications about new leads and marketplace activity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center space-x-4">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-6 w-[50px]" />
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="sms-notifications" className="font-medium">
                SMS Lead Notifications
              </Label>
              <p className="text-sm text-gray-500">
                Receive text messages when new leads are posted
              </p>
              {!displayPhone && (
                <p className="text-sm text-amber-600">
                  Add a phone number to your profile to enable SMS notifications
                </p>
              )}
              {displayPhone && (
                <p className="text-sm text-gray-500">
                  Notifications will be sent to: {displayPhone}
                </p>
              )}
            </div>
            <Switch
              id="sms-notifications"
              checked={smsEnabled}
              onCheckedChange={handleSmsToggle}
              disabled={isSaving || !displayPhone}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationPreferences;
