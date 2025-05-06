
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useUserRole } from '@/hooks/use-user-role';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, isLoggedIn, role } = useUserRole();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
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

  // This function now handles the form submission with direct role management
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
    
    setIsLoading(true);
    
    try {
      console.log("Starting registration with role:", selectedRole);
      
      // Make sure the role is explicitly typed and validated
      const userRole: 'seller' | 'buyer' = 
        selectedRole === 'seller' ? 'seller' : 'buyer';
      
      // Log to confirm the role is correctly formatted before registration
      console.log("Registration role check:", {
        selectedRole, 
        validatedRole: userRole,
        type: typeof userRole,
        isSeller: userRole === 'seller',
        isBuyer: userRole === 'buyer'
      });
      
      const result = await register(
        email, 
        password, 
        userRole,
        name,
        companyName
      );
      
      if (result) {
        // Directly ensure the profile exists with the correct role
        const { user } = result;
        
        if (user?.id) {
          console.log("Registration successful, ensuring profile exists with role:", userRole);
          
          try {
            // DIRECT DATABASE UPDATE - Explicitly insert or update the profile
            const { error } = await supabase
              .from('profiles')
              .upsert({
                id: user.id,
                full_name: name,
                role: userRole,
                company: companyName,
                created_at: new Date().toISOString()
              }, { onConflict: 'id' });
              
            if (error) {
              console.error("Error directly creating profile:", error);
              toast.error("Error creating your profile. Please try again.");
            } else {
              console.log("Profile directly created/updated with role:", userRole);
              
              // Double check that the profile was created correctly
              const { data: profileCheck } = await supabase
                .from('profiles')
                .select('role, company')
                .eq('id', user.id)
                .maybeSingle();
                
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
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>
              Choose your account type and enter your details below.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="grid gap-4">
              <div className="flex flex-row items-center justify-between space-x-2">
                <Label>Account Type</Label>
                <RadioGroup 
                  defaultValue={selectedRole} 
                  className="flex" 
                  value={selectedRole}
                  onValueChange={(value) => {
                    console.log("Role selected:", value);
                    setSelectedRole(value as 'seller' | 'buyer');
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="buyer" id="buyer" />
                    <Label htmlFor="buyer">Buyer</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="seller" id="seller" />
                    <Label htmlFor="seller">Seller</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  placeholder="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {/* Modified to show company name field as required */}
              <div className="grid gap-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  placeholder="Company Name"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>
              {registrationError && (
                <p className="text-red-500 text-sm">{registrationError}</p>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button 
                type="submit" 
                disabled={isLoading} 
                className={cn("w-full", isLoading ? "cursor-not-allowed" : "")}
              >
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-brand-600 hover:underline">
                  Log In
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register;
