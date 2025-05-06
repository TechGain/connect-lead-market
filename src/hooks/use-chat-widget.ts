
import { useState, useEffect, useRef } from 'react';
import { useUserRole } from '@/hooks/use-user-role';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  sender_type: 'user' | 'rep';
  created_at: string;
}

export const useChatWidget = () => {
  const { user, isLoggedIn } = useUserRole();
  const [isOpen, setIsOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check if user has an existing open chat when they log in
  useEffect(() => {
    if (isLoggedIn && user?.id) {
      checkForExistingChat();
    }
  }, [isLoggedIn, user]);

  // Subscribe to real-time messages for the current chat
  useEffect(() => {
    if (!currentChatId) return;

    // Fetch existing messages
    fetchMessages();

    // Set up real-time subscription
    const channel = supabase
      .channel('chat-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${currentChatId}`
      }, (payload) => {
        // Ensure the payload has the correct shape before adding it to messages
        if (payload.new && 
            typeof payload.new.sender_type === 'string' && 
            (payload.new.sender_type === 'user' || payload.new.sender_type === 'rep')) {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentChatId]);

  const checkForExistingChat = async () => {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('id')
        .eq('user_id', user?.id)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // No rows returned
          console.error('Error checking for existing chat:', error);
        }
        return;
      }

      if (data?.id) {
        setCurrentChatId(data.id);
        setChatStarted(true);
      }
    } catch (error) {
      console.error('Error in checkForExistingChat:', error);
    }
  };

  const fetchMessages = async () => {
    if (!currentChatId) return;

    setIsLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', currentChatId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      // Filter messages to ensure they have the correct sender_type
      const validMessages = data?.filter(
        msg => msg.sender_type === 'user' || msg.sender_type === 'rep'
      ) as Message[];
      
      setMessages(validMessages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleInitialSubmit = async ({ name, email, message }: { name: string, email: string, message: string }) => {
    setIsInitializing(true);
    
    try {
      // Create a new chat
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .insert({
          user_id: isLoggedIn ? user?.id : null,
          user_name: name,
          user_email: email
        })
        .select('id')
        .single();

      if (chatError) throw chatError;

      const chatId = chatData.id;
      setCurrentChatId(chatId);

      // Add the first message
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_type: 'user',
          content: message
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Send notification to representative
      await supabase.functions.invoke('send-chat-notification', {
        body: {
          chatId,
          userName: name,
          userEmail: email,
          message
        }
      });

      setChatStarted(true);
      setMessages([messageData as Message]);

      // Show success message
      toast.success('Message sent! Our team will respond shortly.');
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!currentChatId || !content) return;

    try {
      // Optimistically update UI
      const tempMessage = {
        id: `temp-${Date.now()}`,
        content,
        sender_type: 'user' as const,
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, tempMessage]);

      // Add the message to the database
      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: currentChatId,
          sender_type: 'user',
          content
        })
        .select()
        .single();

      if (error) throw error;

      // Send notification for new message
      await supabase.functions.invoke('send-chat-notification', {
        body: {
          chatId: currentChatId,
          userName: isLoggedIn ? user?.user_metadata?.full_name : null,
          userEmail: isLoggedIn ? user?.email : null,
          message: content
        }
      });

      // Replace temp message with real message
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id ? (data as Message) : msg
      ));
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      
      // Remove the temporary message on error
      setMessages(prev => prev.filter(msg => msg.id !== `temp-${Date.now()}`));
    }
  };

  return {
    isOpen,
    setIsOpen,
    isInitializing,
    isLoadingMessages,
    chatStarted,
    messages,
    messagesEndRef,
    handleInitialSubmit,
    handleSendMessage
  };
};

export type { Message };
