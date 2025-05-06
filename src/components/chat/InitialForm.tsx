
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUserRole } from '@/hooks/use-user-role';

interface InitialFormProps {
  onSubmit: (data: { name: string; email: string; message: string }) => void;
  isLoading?: boolean;
}

export const InitialForm = ({ onSubmit, isLoading = false }: InitialFormProps) => {
  const { user, isLoggedIn } = useUserRole();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    onSubmit({
      name: isLoggedIn && user?.user_metadata?.full_name ? user.user_metadata.full_name : name,
      email: isLoggedIn ? user?.email || email : email,
      message: message.trim()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
      
      {!isLoggedIn && (
        <>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Your name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Your email"
              required
            />
          </div>
        </>
      )}
      
      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea 
          id="message" 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          placeholder="How can we help you?"
          className="min-h-[100px]"
          required
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  );
};
