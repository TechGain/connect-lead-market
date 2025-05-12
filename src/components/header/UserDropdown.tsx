
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MessageSquare, FileText } from 'lucide-react';

type UserDropdownProps = {
  role: string | null;
  isAdmin: boolean;
  handleLogout: () => void;
};

export const UserDropdown: React.FC<UserDropdownProps> = ({ role, isAdmin, handleLogout }) => {
  const navigate = useNavigate();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className={isAdmin ? "bg-purple-100 text-purple-800" : "bg-brand-100 text-brand-800"}>
              {isAdmin ? 'A' : role === 'seller' ? 'S' : 'B'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">My Account</p>
            <p className="text-xs text-muted-foreground capitalize">
              {role || 'User'} Account
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/profile')}>
          Profile
        </DropdownMenuItem>
        {role === 'seller' && (
          <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/my-leads')}>
            My Leads
          </DropdownMenuItem>
        )}
        {role === 'buyer' && (
          <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/purchases')}>
            My Purchases
          </DropdownMenuItem>
        )}
        {isAdmin && (
          <>
            <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/admin/chats')}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/admin/leads')}>
              <FileText className="mr-2 h-4 w-4" />
              All Leads
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
