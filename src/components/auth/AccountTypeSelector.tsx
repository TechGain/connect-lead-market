
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { UserRound, Users } from "lucide-react";
import { cn } from '@/lib/utils';

interface AccountTypeSelectorProps {
  selectedRole: 'seller' | 'buyer';
  onRoleChange: (role: 'seller' | 'buyer') => void;
}

const AccountTypeSelector: React.FC<AccountTypeSelectorProps> = ({ 
  selectedRole, 
  onRoleChange 
}) => {
  return (
    <div className="space-y-3">
      <ToggleGroup 
        type="single" 
        value={selectedRole} 
        onValueChange={(value) => {
          if (value) onRoleChange(value as 'seller' | 'buyer');
        }}
        className="grid grid-cols-2 gap-4"
      >
        <ToggleGroupItem 
          value="buyer" 
          className={cn(
            "flex flex-col items-center justify-center h-24 data-[state=on]:bg-brand-100 data-[state=on]:border-brand-500 border-2",
            selectedRole === "buyer" ? "border-brand-500 bg-brand-100 text-brand-800" : "border-gray-200"
          )}
        >
          <UserRound className="w-8 h-8 mb-2" />
          <span className="text-base font-medium">Buyer</span>
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="seller" 
          className={cn(
            "flex flex-col items-center justify-center h-24 data-[state=on]:bg-brand-100 data-[state=on]:border-brand-500 border-2",
            selectedRole === "seller" ? "border-brand-500 bg-brand-100 text-brand-800" : "border-gray-200"
          )}
        >
          <Users className="w-8 h-8 mb-2" />
          <span className="text-base font-medium">Seller</span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default AccountTypeSelector;
