
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardFooter } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import AccountTypeSelector from './AccountTypeSelector';
import { formatPhoneToE164 } from '@/utils/format-helpers';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface RegistrationFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (confirmPassword: string) => void;
  name: string;
  setName: (name: string) => void;
  companyName: string;
  setCompanyName: (companyName: string) => void;
  phoneNumber: string;
  setPhoneNumber: (phoneNumber: string) => void;
  selectedRole: 'seller' | 'buyer';
  setSelectedRole: (role: 'seller' | 'buyer') => void;
  registrationError: string;
  isLoading: boolean;
  referralSource: string;
  setReferralSource: (source: string) => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onSubmit,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  name,
  setName,
  companyName,
  setCompanyName,
  phoneNumber,
  setPhoneNumber,
  selectedRole,
  setSelectedRole,
  registrationError,
  isLoading,
  referralSource,
  setReferralSource
}) => {
  // Format phone number as user types
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
  };

  // Format phone for display (optional)
  const displayPhone = phoneNumber ? phoneNumber : '';

  return (
    <form onSubmit={onSubmit}>
      <CardContent className="grid gap-4">
        <div className="space-y-3">
          <Label>Account Type</Label>
          <AccountTypeSelector 
            selectedRole={selectedRole} 
            onRoleChange={setSelectedRole} 
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" placeholder="John Doe" type="text" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" placeholder="name@example.com" type="email" autoCapitalize="none" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone-number">Phone Number</Label>
          <Input 
            id="phone-number" 
            placeholder="(123) 456-7890" 
            type="tel" 
            value={displayPhone} 
            onChange={handlePhoneChange} 
            required 
          />
          <p className="text-xs text-muted-foreground">Enter your phone number with country code (e.g., +1 for US)</p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input id="confirm-password" placeholder="Confirm Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="company-name">Company Name</Label>
          <Input id="company-name" placeholder="Company Name" type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="referral-source">How did you hear about us?</Label>
          <Select value={referralSource} onValueChange={setReferralSource}>
            <SelectTrigger id="referral-source">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="google">Google</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="friend">Friend</SelectItem>
              <SelectItem value="word-of-mouth">Word of Mouth</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {registrationError && <p className="text-red-500 text-sm">{registrationError}</p>}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button type="submit" disabled={isLoading} className={cn("w-full", isLoading ? "cursor-not-allowed" : "")}>
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
  );
};

export default RegistrationForm;
