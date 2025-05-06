
import React from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ChatMessageProps {
  content: string;
  sender: 'user' | 'rep' | 'system';
  timestamp: string;
  senderName?: string;
  isAdmin?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  content, 
  sender, 
  timestamp,
  senderName,
  isAdmin = false
}) => {
  const isRep = sender === 'rep';
  const formattedDate = format(new Date(timestamp), 'MMM d, h:mm a');
  
  return (
    <div 
      className={cn(
        "mb-4 max-w-[80%]",
        isRep 
          ? "ml-auto bg-primary text-primary-foreground rounded-t-lg rounded-bl-lg" 
          : "mr-auto bg-muted rounded-t-lg rounded-br-lg",
        "p-3"
      )}
    >
      <div className="flex justify-between items-center mb-1">
        <span className="font-medium text-xs">
          {isAdmin 
            ? (senderName || (isRep ? 'Support Team' : 'User')) 
            : (isRep ? 'Support' : 'You')}
        </span>
        <span className="text-xs opacity-70">{formattedDate}</span>
      </div>
      <p className="whitespace-pre-wrap">{content}</p>
    </div>
  );
};
