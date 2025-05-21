
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
  userEmail?: string | null;
}

export const NotificationPreferences = ({ userId, userPhone, userEmail }: NotificationPreferencesProps) => {
  const { 
    smsEnabled, 
    emailEnabled, 
    isLoading, 
    isSaving, 
    updateSmsPreference, 
    updateEmailPreference 
  } = useNotificationPreferences(userId);
  
  const handleSmsToggle = async (checked: boolean) => {
    await updateSmsPreference(checked);
  };

  const handleEmailToggle = async (checked: boolean) => {
    await updateEmailPreference(checked);
  };

  // Format phone number for display - ensure it's properly formatted for E.164
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
      <CardContent className="space-y-6">
        {isLoading ? (
          <>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-6 w-[50px]" />
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-6 w-[50px]" />
            </div>
          </>
        ) : (
          <>
            {/* SMS Notifications */}
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
            
            {/* Email Notifications */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="email-notifications" className="font-medium">
                  Email Lead Notifications
                </Label>
                <p className="text-sm text-gray-500">
                  Receive email alerts when new leads are available
                </p>
                {!userEmail && (
                  <p className="text-sm text-amber-600">
                    Add an email address to your profile to enable email notifications
                  </p>
                )}
                {userEmail && (
                  <p className="text-sm text-gray-500">
                    Notifications will be sent to: {userEmail}
                  </p>
                )}
              </div>
              <Switch
                id="email-notifications"
                checked={emailEnabled}
                onCheckedChange={handleEmailToggle}
                disabled={isSaving || !userEmail}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationPreferences;
