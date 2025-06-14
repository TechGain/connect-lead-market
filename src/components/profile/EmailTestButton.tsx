
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

interface EmailTestButtonProps {
  userEmail?: string | null;
}

const EmailTestButton = ({ userEmail }: EmailTestButtonProps) => {
  const [isSending, setIsSending] = useState(false);
  
  const handleTestEmail = async () => {
    if (!userEmail) {
      toast.error("No email address found to send test to");
      return;
    }
    
    setIsSending(true);
    console.log('=== EMAIL TEST STARTED ===');
    console.log('Testing email for:', userEmail);
    
    try {
      toast.info("Sending test email...");
      
      console.log('Invoking test-email-sending function...');
      const { data, error } = await supabase.functions.invoke('test-email-sending', {
        body: { email: userEmail }
      });
      
      console.log('Test email function response:', { data, error });
      
      if (error) {
        console.error("Error invoking test-email-sending function:", error);
        toast.error(`Failed to send test email: ${error.message}`);
        return;
      }
      
      console.log("Test email response data:", data);
      
      if (data.success) {
        if (data.redirected) {
          toast.success(`Test email redirected to the verified email due to domain settings`);
          toast.info("To send emails to all recipients, verify your domain in Resend and set DOMAIN_VERIFIED=true");
          
          if (data.debugInfo) {
            console.info("Email Debug Information:", data.debugInfo);
          }
        } else {
          toast.success(`Test email sent successfully to ${userEmail}!`);
        }
      } else if (data.domainVerificationRequired) {
        toast.error("Domain verification required");
        toast.info("Please verify your domain at resend.com/domains and set DOMAIN_VERIFIED=true");
        
        if (data.debugInfo) {
          console.info("Email Configuration Debug Information:", data.debugInfo);
          toast.info(`Domain verification value: "${data.debugInfo.domainVerifiedRaw || 'not set'}"`);
        }
      } else {
        toast.error(`Failed to send test email: ${data.error || 'Unknown error'}`);
        
        if (data.debugInfo) {
          console.info("Email Debug Information:", data.debugInfo);
        }
      }
      
    } catch (error) {
      console.error("Exception sending test email:", error);
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSending(false);
      console.log('=== EMAIL TEST COMPLETED ===');
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
