
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

interface EmailTestButtonProps {
  userEmail?: string | null;
}

const EmailTestButton = ({ userEmail }: EmailTestButtonProps) => {
  const [isSending, setIsSending] = useState(false);
  
  // The Resend account owner's email - needed for warning message
  const resendAccountEmail = "stayconnectorg@gmail.com";
  
  const handleTestEmail = async () => {
    if (!userEmail) {
      toast.error("No email address found to send test to");
      return;
    }
    
    setIsSending(true);
    
    try {
      // Show appropriate message based on email match with Resend account
      if (userEmail !== resendAccountEmail) {
        toast.info(`Note: Test emails can only be sent to ${resendAccountEmail} until domain verification is complete`);
      } else {
        toast.info("Sending test email...");
      }
      
      const { data, error } = await supabase.functions.invoke('test-email-sending', {
        body: { email: userEmail }
      });
      
      if (error) {
        console.error("Error invoking test-email-sending function:", error);
        toast.error(`Failed to send test email: ${error.message}`);
        return;
      }
      
      console.log("Test email response:", data);
      
      if (data.success) {
        toast.success(`Test email sent successfully to ${userEmail}!`);
      } else {
        // Special handling for the Resend account email limitation
        if (data.error && data.error.includes("can only send test emails to")) {
          toast.warning(`${data.error} To test now, please login with ${resendAccountEmail} or complete domain verification.`);
        } else {
          toast.error(`Failed to send test email: ${data.error || 'Unknown error'}`);
        }
      }
      
    } catch (error) {
      console.error("Exception sending test email:", error);
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleTestEmail} 
      disabled={isSending || !userEmail}
    >
      {isSending ? 'Sending...' : 'Test Email Notification'}
    </Button>
  );
};

export default EmailTestButton;
