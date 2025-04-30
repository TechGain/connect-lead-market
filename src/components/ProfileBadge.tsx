
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StarRating from './StarRating';

interface ProfileBadgeProps {
  name: string;
  rating: number;
  avatar?: string;
  role: 'seller' | 'buyer';
  totalLeads?: number;
}

const ProfileBadge = ({ name, rating, avatar, role, totalLeads }: ProfileBadgeProps) => {
  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10 border border-gray-200">
        <AvatarImage src={avatar} alt={name} />
        <AvatarFallback className="bg-brand-100 text-brand-800">
          {name.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium text-sm">{name}</p>
        <div className="flex items-center gap-2 mt-1">
          <StarRating rating={rating} size={16} readOnly />
          {role === 'seller' && totalLeads !== undefined && (
            <span className="text-xs text-gray-500">{totalLeads} leads</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileBadge;
