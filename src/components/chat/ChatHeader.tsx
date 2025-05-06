
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  title: string;
  onClose: () => void;
}

export const ChatHeader = ({ title, onClose }: ChatHeaderProps) => {
  return (
    <div className="border-b p-4 flex justify-between items-center">
      <h3 className="font-semibold text-lg">{title}</h3>
      <Button variant="ghost" size="icon" onClick={onClose}>
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
};
