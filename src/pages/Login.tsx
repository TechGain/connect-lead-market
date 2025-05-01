import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { toast } from "sonner";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useUserRole } from '@/hooks/use-user-role';
import { ensureUserProfile } from '@/utils/roleManager';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoggedIn, role, user } = useUserRole();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If the user is already logged in, redirect them
    if (isLoggedIn) {
      if (role === 'seller') {
        navigate('/my-leads');
      } else {
        navigate('/marketplace');
      }
    }
  }, [isLoggedIn, role, navigate]);

  // When user logs in and we detect they have a valid user ID but no role,
  // this effect will try to ensure their profile exists
  useEffect(() => {
    const checkAndFixProfile = async () => {
      if (isLoggedIn && user?.id && role === null) {
        console.log("Logged in but no role detected. Attempting to fix profile...");
        
        try {
          // Try to get role from metadata first
          const metadataRole = user.user_metadata?.role;
          const validRole = (metadataRole === 'seller' || metadataRole === 'buyer') 
            ? metadataRole as 'seller' | 'buyer'
            : 'buyer'; // Default to buyer
          
          await ensureUserProfile(user.id, validRole);
          toast.info(`Your profile has been updated with role: ${validRole}`);
        } catch (err) {
          console.error("Error fixing profile after login:", err);
        }
      }
    };
    
    checkAndFixProfile();
  }, [isLoggedIn, user?.id, role]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const result = await login(email, password);
      if (!result) {
        setError('Invalid email or password');
        toast.error('Login failed. Please check your credentials.');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during login');
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md px-4">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Log In</CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="johndoe@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link to="/forgot-password" className="text-sm text-brand-600 hover:underline">
                      Forgot Password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full">
                  Log In
                </Button>
                <div className="text-center text-sm">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-brand-600 hover:underline">
                    Create Account
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Login;
