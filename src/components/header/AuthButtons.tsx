
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const AuthButtons: React.FC = () => {
  return (
    <div className="flex items-center gap-4">
      <Link to="/login">
        <Button variant="ghost" className="hidden md:flex">
          Log In
        </Button>
      </Link>
      <Link to="/register">
        <Button className={cn("hidden md:flex", "bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600")}>
          Register
        </Button>
      </Link>
    </div>
  );
};
