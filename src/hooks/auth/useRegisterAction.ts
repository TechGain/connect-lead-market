
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatPhoneToE164, isValidPhoneNumber } from '@/utils/format-helpers';

/**
 * Hook for handling user registration
 */
export function useRegisterAction() {
  const [isLoading, setIsLoading] = useState(false);

  const register = async (
    email: string, 
    password: string, 
    role: 'seller' | 'buyer',
    fullName: string,
    company?: string,
    phone?: string,
    referralSource?: string
  ) => {
    try {
      console.log("Registration starting with:", { email, role, fullName, company, phone, referralSource });
      setIsLoading(true);
      
      // Validate role input before proceeding - ensure admin can't be set
      if (role !== 'seller' && role !== 'buyer') {
        throw new Error("Invalid role. Must be 'seller' or 'buyer'");
      }
      
      // Validate company input
      if (!company) {
        throw new Error("Company name is required");
      }
      
      // Validate phone input
      if (!phone) {
        throw new Error("Phone number is required");
      }
      
      // Validate phone format
      if (!isValidPhoneNumber(phone)) {
        throw new Error("Please enter a valid phone number with at least 10 digits");
      }
      
      // Format phone to E.164 format for SMS compatibility
      const formattedPhone = formatPhoneToE164(phone);
      console.log("Phone formatted for storage:", formattedPhone);
      
      // Sign up the user with role, company, and phone in metadata
      // AND set the phone number directly in the auth.users.phone field
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        phone: formattedPhone, // This will store phone in auth.users.phone field
        options: {
          data: {
            full_name: fullName,
            role: role,
            company: company,
            phone: formattedPhone, // Also store formatted phone in user metadata for compatibility
            referral_source: referralSource // Add referral source to metadata
          }
        }
      });
      
      if (error) {
        console.error("Signup error:", error);
        throw error;
      }
      
      // CRITICAL: Create a profile with the role IMMEDIATELY after signup
      if (data.user?.id) {
        try {
          console.log("Creating profile for new user with role:", role);
          
          // Define profile data according to the expected schema type
          const profileData = {
            id: data.user.id,
            full_name: fullName,
            role: role,
            company: company,
            phone: formattedPhone, // Store formatted phone in the profile
            sms_notifications_enabled: true, // Enable SMS notifications by default
            referral_source: referralSource // Store where the user heard about us
          };
          
          const { error: profileError } = await supabase
            .from('profiles')
            .insert(profileData);
            
          if (profileError) {
            console.error("Error creating profile during registration:", profileError);
          } else {
            console.log("Profile successfully created with role, company, phone, and referral:", { role, company, formattedPhone, referralSource });
          }
        } catch (err) {
          console.error("Exception creating profile during registration:", err);
        }
      }
      
      return data;
    } catch (error: any) {
      console.error("Registration error:", error);
      // Provide more specific error messages based on the error
      if (error.message?.includes('email')) {
        toast.error('This email address is already registered');
      } else if (error.message?.includes('password')) {
        toast.error('Password does not meet requirements');
      } else {
        toast.error(error.message || 'Failed to create account');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    isLoading
  };
}
