
import React, { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Message } from '@/hooks/use-chat-widget';

interface AdminChatViewProps {
  chatId: string;
}

interface ChatInfo {
  user_name: string | null;
  user_email: string | null;
  created_at: string;
}

const AdminChatView: React.FC<AdminChatViewProps> = ({ chatId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const processingLocalMessageIds = useRef<Set<string>>(new Set());
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Fetch chat info and messages
  useEffect(() => {
    const fetchChatData = async () => {
      setLoading(true);
      try {
        // Get chat info
        const { data: chatData, error: chatError } = await supabase
          .from('chats')
          .select('user_name, user_email, created_at')
          .eq('id', chatId)
          .single();
        
        if (chatError) throw chatError;
        setChatInfo(chatData);
        
        // Get messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true });
        
        if (messagesError) throw messagesError;
        setMessages(messagesData as Message[]);
      } catch (error) {
        console.error('Error fetching chat data:', error);
        toast.error('Failed to load chat');
      } finally {
        setLoading(false);
      }
    };
    
    if (chatId) {
      fetchChatData();
      
      // Set up real-time subscription for new messages
      const channel = supabase
        .channel(`admin-chat-${chatId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        }, (payload) => {
          if (payload.new) {
            const messageId = payload.new.id;
            
            // Skip messages we've just added locally
            if (processingLocalMessageIds.current.has(messageId)) {
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
    }
  }, [chatId]);
  
  // Handle sending a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !chatId) return;
    
    setSending(true);
    try {
      // Optimistically update UI
      const tempId = `temp-${Date.now()}`;
      const tempMessage = {
        id: tempId,
        content: newMessage,
        sender_type: 'rep' as const,
        created_at: new Date().toISOString(),
        sender_name: 'Support Team',
        chat_id: chatId
      };
      
      setMessages(prev => [...prev, tempMessage]);
      
      // Add the message to the database
      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_type: 'rep',
          content: newMessage,
          sender_name: 'Support Team'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Track this message ID
      if (data?.id) {
        processingLocalMessageIds.current.add(data.id);
      }
      
      // Update chat's updated_at timestamp
      await supabase
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId);
      
      // Notify via the edge function
      await supabase.functions.invoke('send-chat-notification', {
        body: {
          chatId,
          message: newMessage,
          isAdmin: true,
          senderName: 'Support Team'
        }
      });
      
      // Replace temp message with real message
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? data as Message : msg
      ));
      
      // Clear input
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };
  
  // Format date for display
  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Chat header with user info */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold">
          {chatInfo?.user_name || 'Anonymous User'}
        </h3>
        {chatInfo?.user_email && (
          <p className="text-sm text-gray-500">{chatInfo.user_email}</p>
        )}
        <p className="text-xs text-gray-400">
          Started: {chatInfo ? formatMessageDate(chatInfo.created_at) : 'Unknown'}
        </p>
      </div>
      
      {/* Messages area */}
      <Card className="flex-grow overflow-hidden mb-4">
        <ScrollArea className="h-[calc(100vh-450px)] p-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-4">No messages yet</div>
          ) : (
            messages.map((message) => (
              <div 
                key={message.id} 
                className={`mb-4 max-w-[80%] ${
                  message.sender_type === 'rep' 
                    ? 'ml-auto bg-primary text-primary-foreground' 
                    : 'mr-auto bg-muted'
                } rounded-lg p-3`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-sm">
                    {message.sender_name || (message.sender_type === 'rep' ? 'Support Team' : 'User')}
                  </span>
                  <span className="text-xs opacity-70">
                    {formatMessageDate(message.created_at)}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </ScrollArea>
      </Card>
      
      {/* Message input */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Textarea 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your response..."
          className="flex-grow resize-none"
          disabled={sending}
        />
        <Button type="submit" disabled={sending || !newMessage.trim()}>
          {sending ? 'Sending...' : 'Send'}
        </Button>
      </form>
    </div>
  );
};

export default AdminChatView;
