
import React from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ChatMessageProps {
  content: string;
  sender: 'user' | 'rep';
  timestamp: string | Date;
  senderName?: string;
}

export const ChatMessage = ({ content, sender, timestamp, senderName }: ChatMessageProps) => {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  
  return (
    <div
      className={cn(
        "flex mb-4",
        sender === 'user' ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-lg px-4 py-2",
          sender === 'user' 
            ? "bg-brand-600 text-white rounded-tr-none" 
            : "bg-gray-100 text-gray-800 rounded-tl-none"
        )}
      >
        {senderName && (
          <div className={cn(
            "text-xs font-semibold mb-1",
            sender === 'user' ? "text-brand-100" : "text-gray-500"
          )}>
            {senderName}
          </div>
        )}
        <p>{content}</p>
        <span className={cn(
          "text-xs block mt-1",
          sender === 'user' ? "text-brand-100" : "text-gray-500"
        )}>
          {format(date, 'p')}
        </span>
      </div>
    </div>
  );
};
