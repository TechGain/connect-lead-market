
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    
    if (!tokenFromUrl) {
      toast.error('Invalid reset link');
      navigate('/forgot-password');
      return;
    }
    
    setToken(tokenFromUrl);
    setIsValidToken(true); // We'll validate when the user submits
  }, [navigate, searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!token) {
      toast.error('Invalid reset token');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    
    try {
      // Call our custom edge function to reset the password
      const { data, error } = await supabase.functions.invoke('reset-password-with-token', {
        body: { 
          token: token,
          newPassword: password 
        }
      });
      
      if (error) {
        console.error('Password reset error:', error);
        if (error.message?.includes('Invalid or expired')) {
          toast.error('Reset link has expired or is invalid. Please request a new one.');
          navigate('/forgot-password');
        } else {
          toast.error('Failed to reset password. Please try again.');
        }
      } else {
        toast.success('Password updated successfully! Please log in with your new password.');
        navigate('/login');
      }
    } catch (error: any) {
      console.error('Password reset exception:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token || isValidToken === false) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="w-full max-w-md px-4">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Invalid Link</CardTitle>
                <CardDescription className="text-center">
                  This password reset link is invalid or has expired
                </CardDescription>
              </CardHeader>
              
              <CardFooter>
                <Button onClick={() => navigate('/forgot-password')} className="w-full">
                  Request New Reset Link
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md px-4">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Set New Password</CardTitle>
              <CardDescription className="text-center">
                Enter your new password below
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </CardContent>
              
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update Password'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ResetPassword;
