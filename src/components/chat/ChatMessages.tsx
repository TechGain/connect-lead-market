
import React from 'react';
import { ChatMessage } from './ChatMessage';
import { Message } from '@/hooks/use-chat-widget';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ 
  messages, 
  isLoading, 
  messagesEndRef 
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex justify-center items-center h-full">
          <p className="text-muted-foreground">No messages yet</p>
        </div>
      ) : (
        messages.map((message) => (
          <ChatMessage
            key={message.id}
            content={message.content}
            sender={message.sender_type}
            timestamp={message.created_at}
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
