
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ProfileSettingsCardProps {
  role: 'seller' | 'buyer' | null;
}

const ProfileSettingsCard = ({ role }: ProfileSettingsCardProps) => {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>
          Manage your account preferences and settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border rounded-md p-4">
          <h3 className="font-medium mb-2">Notification Settings</h3>
          <p className="text-sm text-gray-600 mb-4">
            Configure how you receive notifications
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => toast.info("Notification settings coming soon")}
          >
            Configure
          </Button>
        </div>
        
        <div className="border rounded-md p-4">
          <h3 className="font-medium mb-2">Password & Security</h3>
          <p className="text-sm text-gray-600 mb-4">
            Update your password and security settings
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => toast.info("Security settings coming soon")}
          >
            Manage
          </Button>
        </div>
        
        <div className="border rounded-md p-4">
          <h3 className="font-medium mb-2">Payment Methods</h3>
          <p className="text-sm text-gray-600 mb-4">
            {role === 'buyer' ? 'Add or update your payment methods' : 'Set up how you receive payments'}
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => toast.info("Payment settings coming soon")}
          >
            Manage
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSettingsCard;
