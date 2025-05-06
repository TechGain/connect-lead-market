
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { supabase } from '@/integrations/supabase/client';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';

interface ProfileSettingsCardProps {
  role: 'seller' | 'buyer';
  disabled?: boolean;
}

// Notification settings form type
type NotificationSettings = {
  emailNotifications: boolean;
  marketplaceUpdates: boolean;
  accountAlerts: boolean;
};

// Password form type
type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const ProfileSettingsCard = ({ role, disabled = false }: ProfileSettingsCardProps) => {
  // State for dialogs
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  
  // Forms
  const notificationForm = useForm<NotificationSettings>({
    defaultValues: {
      emailNotifications: true,
      marketplaceUpdates: true,
      accountAlerts: true,
    }
  });
  
  const passwordForm = useForm<PasswordForm>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  });
  
  // Handle notification settings submit
  const handleNotificationSubmit = (data: NotificationSettings) => {
    console.log('Notification settings saved:', data);
    toast.success('Notification preferences updated successfully');
    setNotificationDialogOpen(false);
  };
  
  // Handle password change submit
  const handlePasswordSubmit = async (data: PasswordForm) => {
    try {
      // Check if new passwords match
      if (data.newPassword !== data.confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }
      
      // Update password via Supabase
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });
      
      if (error) throw error;
      
      // Show success and reset form
      setPasswordSuccess(true);
      passwordForm.reset();
      
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast.error(error.message || 'Failed to update password');
    }
  };
  
  // Handle password success dialog close
  const handlePasswordSuccessClose = () => {
    setPasswordSuccess(false);
    setPasswordDialogOpen(false);
  };
  
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
            onClick={() => setNotificationDialogOpen(true)}
            disabled={disabled}
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
            onClick={() => setPasswordDialogOpen(true)}
            disabled={disabled}
          >
            Manage
          </Button>
        </div>
      </CardContent>
      
      {/* Notification Settings Dialog */}
      <Dialog open={notificationDialogOpen} onOpenChange={setNotificationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notification Preferences</DialogTitle>
            <DialogDescription>
              Choose how and when you want to be notified about platform activity.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...notificationForm}>
            <form onSubmit={notificationForm.handleSubmit(handleNotificationSubmit)} className="space-y-4 py-2">
              <FormField
                control={notificationForm.control}
                name="emailNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Email Notifications</FormLabel>
                      <FormDescription>Receive updates via email</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={notificationForm.control}
                name="marketplaceUpdates"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Marketplace Updates</FormLabel>
                      <FormDescription>Get notified about new leads</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={notificationForm.control}
                name="accountAlerts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Account Alerts</FormLabel>
                      <FormDescription>Security and account notifications</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Update your account password. Choose a strong password that you don't use elsewhere.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4 py-2">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Enter current password" 
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Enter new password" 
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Confirm new password" 
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">Update Password</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Password Success Alert Dialog */}
      <AlertDialog open={passwordSuccess} onOpenChange={setPasswordSuccess}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Password Updated</AlertDialogTitle>
            <AlertDialogDescription>
              Your password has been successfully changed. You'll use your new password the next time you sign in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handlePasswordSuccessClose}>
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default ProfileSettingsCard;
