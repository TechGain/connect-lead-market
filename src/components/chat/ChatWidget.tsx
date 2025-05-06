
import React from 'react';
import { ChatButton } from './ChatButton';
import { ChatContainer } from './ChatContainer';
import { useChatWidget } from '@/hooks/use-chat-widget';

export const ChatWidget = () => {
  const {
    isOpen,
    setIsOpen,
    isInitializing,
    isLoadingMessages,
    chatStarted,
    messages,
    messagesEndRef,
    handleInitialSubmit,
    handleSendMessage
  } = useChatWidget();

  return (
    <>
      <ChatButton onClick={() => setIsOpen(true)} />
      
      <ChatContainer
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        chatStarted={chatStarted}
        isInitializing={isInitializing}
        isLoadingMessages={isLoadingMessages}
        messages={messages}
        messagesEndRef={messagesEndRef}
        onInitialSubmit={handleInitialSubmit}
        onSendMessage={handleSendMessage}
      />
    </>
  );
};
