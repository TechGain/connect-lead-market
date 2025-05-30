
import React from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { InitialForm } from './InitialForm';
import { Message } from '@/hooks/use-chat-widget';

interface ChatContainerProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  chatStarted: boolean;
  isInitializing: boolean;
  isLoadingMessages: boolean;
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onInitialSubmit: (data: { name: string; email: string; message: string }) => void;
  onSendMessage: (message: string) => void;
  isAdmin?: boolean;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  isOpen,
  setIsOpen,
  chatStarted,
  isInitializing,
  isLoadingMessages,
  messages,
  messagesEndRef,
  onInitialSubmit,
  onSendMessage,
  isAdmin = false
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent 
        className="sm:max-w-md p-0 flex flex-col" 
        side="right"
      >
        <ChatHeader 
          title={chatStarted ? (isAdmin ? "Admin Support Chat" : "Chat with Support") : "Contact Support"} 
          onClose={() => setIsOpen(false)} 
        />
        
        {!chatStarted ? (
          <InitialForm 
            onSubmit={onInitialSubmit}
            isLoading={isInitializing}
          />
        ) : (
          <>
            <ChatMessages 
              messages={messages}
              isLoading={isLoadingMessages}
              messagesEndRef={messagesEndRef}
              isAdmin={isAdmin}
            />
            
            <ChatInput 
              onSendMessage={onSendMessage} 
              placeholder={isAdmin ? "Type your response as Support Team..." : "Type your message here..."}
              isAdmin={isAdmin}
            />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
