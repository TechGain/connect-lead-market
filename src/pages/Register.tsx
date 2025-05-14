import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserRole } from '@/hooks/use-user-role';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import RegistrationForm from '@/components/auth/RegistrationForm';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    register,
    isLoggedIn,
    role
  } = useUserRole();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(''); 
  const [selectedRole, setSelectedRole] = useState<'seller' | 'buyer'>('buyer');
  const [registrationError, setRegistrationError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If the user is already logged in, redirect them to the marketplace or my-leads
    if (isLoggedIn) {
      if (role === 'seller') {
        navigate('/my-leads');
      } else {
        navigate('/marketplace');
      }
    }

    // Set the role based on the URL parameter
    const roleParam = searchParams.get('role');
    if (roleParam === 'seller' || roleParam === 'buyer') {
      setSelectedRole(roleParam);
    }
  }, [isLoggedIn, navigate, role, searchParams]);

  // This function handles the form submission with direct role management
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    // Reset previous errors
    setRegistrationError("");

    // Validate password
    if (password !== confirmPassword) {
      setRegistrationError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    // Validate company name
    if (!companyName.trim()) {
      setRegistrationError("Company name is required");
      toast.error("Company name is required");
      return;
    }

    // Validate phone number
    if (!phoneNumber.trim()) {
      setRegistrationError("Phone number is required");
      toast.error("Phone number is required");
      return;
    }
    setIsLoading(true);
    try {
      console.log("Starting registration with role:", selectedRole);

      // Make sure the role is explicitly typed and validated
      const userRole: 'seller' | 'buyer' = selectedRole === 'seller' ? 'seller' : 'buyer';

      // Log to confirm the role is correctly formatted before registration
      console.log("Registration role check:", {
        selectedRole,
        validatedRole: userRole,
        type: typeof userRole,
        isSeller: userRole === 'seller',
        isBuyer: userRole === 'buyer'
      });
      const result = await register(email, password, userRole, name, companyName, phoneNumber);
      if (result) {
        // Directly ensure the profile exists with the correct role
        const {
          user
        } = result;
        if (user?.id) {
          console.log("Registration successful, ensuring profile exists with role:", userRole);
          try {
            // DIRECT DATABASE UPDATE - Explicitly insert or update the profile
            const {
              error
            } = await supabase.from('profiles').upsert({
              id: user.id,
              full_name: name,
              role: userRole,
              company: companyName,
              phone: phoneNumber, // Include phone number in profile
              sms_notifications_enabled: true, // Enable SMS notifications by default
              created_at: new Date().toISOString()
            }, {
              onConflict: 'id'
            });
            if (error) {
              console.error("Error directly creating profile:", error);
              toast.error("Error creating your profile. Please try again.");
            } else {
              console.log("Profile directly created/updated with role:", userRole);

              // Double check that the profile was created correctly
              const {
                data: profileCheck
              } = await supabase.from('profiles').select('role, company, phone, sms_notifications_enabled').eq('id', user.id).maybeSingle();
              console.log("Profile check after creation:", profileCheck);
            }
          } catch (err) {
            console.error("Error ensuring profile during registration:", err);
          }
        }
        toast.success(`Registration successful! Welcome ${name}`);

        // We need a small delay to ensure the user state is properly updated
        setTimeout(() => {
          console.log("Registration completed, redirecting with role:", userRole);
          if (userRole === 'seller') {
            navigate('/my-leads');
          } else {
            navigate('/marketplace');
          }
        }, 1500); // Increased timeout to ensure state updates
      } else {
        setIsLoading(false); // Reset loading state on failure
        // If result is null, show a more detailed error
        setRegistrationError("Registration failed. This could be due to an existing account or invalid credentials.");
        toast.error("Registration failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Registration error caught:", error);
      setRegistrationError(error.message || "An unexpected error occurred");
      toast.error(error.message || "An error occurred during registration");
      setIsLoading(false); // Reset loading state on error
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>
              Choose your account type and enter your details below.
            </CardDescription>
          </CardHeader>
          <RegistrationForm
            onSubmit={handleSubmit}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            name={name}
            setName={setName}
            companyName={companyName}
            setCompanyName={setCompanyName}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
            registrationError={registrationError}
            isLoading={isLoading}
          />
        </Card>
      </div>
    </div>
  );
};

export default Register;
