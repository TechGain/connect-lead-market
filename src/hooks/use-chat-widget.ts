
import { useState, useEffect, useRef } from 'react';
import { useUserRole } from '@/hooks/use-user-role';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  sender_type: 'user' | 'rep';
  created_at: string;
  sender_name?: string;
}

export const useChatWidget = () => {
  const { user, isLoggedIn, isAdmin } = useUserRole();
  const [isOpen, setIsOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const processingLocalMessageIds = useRef<Set<string>>(new Set()); // Track locally added message IDs

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
        // Only add message if it's not from our local optimistic updates
        if (payload.new && 
            typeof payload.new.sender_type === 'string' && 
            (payload.new.sender_type === 'user' || payload.new.sender_type === 'rep')) {
          
          // Check if this is a message we just added locally
          const messageId = payload.new.id;
          if (processingLocalMessageIds.current.has(messageId)) {
            // This is our own message that we already added optimistically
            // Remove from the processing set but don't add to messages again
            processingLocalMessageIds.current.delete(messageId);
            return;
          }
          
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

      // Generate a temporary ID for local tracking
      const tempId = `temp-${Date.now()}`;
      processingLocalMessageIds.current.add(tempId);

      // Add the first message
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_type: 'user',
          content: message,
          sender_name: name
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Track the actual message ID to prevent duplicate display
      if (messageData?.id) {
        processingLocalMessageIds.current.add(messageData.id);
      }

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
      setMessages([{...messageData, sender_name: name} as Message]);

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
      // Optimistically update UI with temporary ID
      const tempId = `temp-${Date.now()}`;
      const tempMessage = {
        id: tempId,
        content,
        sender_type: isAdmin ? 'rep' : 'user' as const,
        created_at: new Date().toISOString(),
        sender_name: isAdmin ? 'Support Team' : user?.user_metadata?.full_name || 'User'
      };
      
      setMessages(prev => [...prev, tempMessage]);

      // Add the message to the database
      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: currentChatId,
          sender_type: isAdmin ? 'rep' : 'user',
          content,
          sender_name: isAdmin ? 'Support Team' : user?.user_metadata?.full_name || 'User'
        })
        .select()
        .single();

      if (error) throw error;

      // Track this message ID to prevent duplicate display when the realtime event arrives
      if (data?.id) {
        processingLocalMessageIds.current.add(data.id);
      }

      // Send notification for new message (only for user messages, not admin responses)
      if (!isAdmin) {
        await supabase.functions.invoke('send-chat-notification', {
          body: {
            chatId: currentChatId,
            userName: isLoggedIn ? user?.user_metadata?.full_name : null,
            userEmail: isLoggedIn ? user?.email : null,
            message: content,
            isAdmin: false
          }
        });
      } else {
        // For admin messages, still notify but with isAdmin flag
        await supabase.functions.invoke('send-chat-notification', {
          body: {
            chatId: currentChatId,
            message: content,
            isAdmin: true,
            senderName: 'Support Team'
          }
        });
      }

      // Replace temp message with real message
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? (
          {
            ...data, 
            sender_name: isAdmin ? 'Support Team' : user?.user_metadata?.full_name || 'User'
          } as Message
        ) : msg
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
    handleSendMessage,
    isAdmin
  };
};

export type { Message };
