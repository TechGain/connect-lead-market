
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        setEmailSent(true);
        toast.success('Password reset email sent! Check your inbox.');
      }
    } catch (error: any) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="w-full max-w-md px-4">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Check Your Email</CardTitle>
                <CardDescription className="text-center">
                  We've sent a password reset link to {email}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 text-center">
                  Click the link in the email to reset your password. If you don't see it, check your spam folder.
                </p>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                <Link to="/login" className="w-full">
                  <Button variant="outline" className="w-full">
                    Back to Login
                  </Button>
                </Link>
                <div className="text-center text-sm">
                  Didn't receive the email?{' '}
                  <button 
                    onClick={() => setEmailSent(false)}
                    className="text-brand-600 hover:underline"
                  >
                    Try again
                  </button>
                </div>
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
              <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
              <CardDescription className="text-center">
                Enter your email address and we'll send you a reset link
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
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
                <div className="text-center text-sm">
                  Remember your password?{' '}
                  <Link to="/login" className="text-brand-600 hover:underline">
                    Back to Login
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

export default ForgotPassword;
