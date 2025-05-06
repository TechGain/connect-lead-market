
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/use-user-role';
import { toast } from 'sonner';
import AdminChatView from './AdminChatView';

interface Chat {
  id: string;
  user_name: string | null;
  user_email: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  latest_message?: {
    content: string;
    created_at: string;
  };
  unread_count?: number;
}

const AdminChatDashboard = () => {
  const { isAdmin } = useUserRole();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('open');
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  
  // Fetch all chats that an admin can view
  useEffect(() => {
    if (!isAdmin) {
      toast.error("Admin access required");
      return;
    }

    const fetchChats = async () => {
      setLoading(true);
      try {
        // Fetch chats with their latest message
        const { data, error } = await supabase
          .from('chats')
          .select(`
            *,
            messages:messages (
              content,
              created_at,
              sender_type
            )
          `)
          .eq('status', activeTab === 'open' ? 'open' : 'closed')
          .order('updated_at', { ascending: false });

        if (error) throw error;

        // Process the data to get latest message and count unread messages
        const processedChats = data.map(chat => {
          // Sort messages to find the latest
          const sortedMessages = chat.messages ? 
            [...chat.messages].sort((a, b) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            ) : [];
          
          // Count messages that haven't been read by admin (messages from user)
          const unreadCount = sortedMessages.filter(
            msg => msg.sender_type === 'user'
          ).length;
          
          return {
            ...chat,
            messages: undefined, // Remove the messages array
            latest_message: sortedMessages.length > 0 ? {
              content: sortedMessages[0].content,
              created_at: sortedMessages[0].created_at
            } : undefined,
            unread_count: unreadCount
          };
        });

        setChats(processedChats);
      } catch (error) {
        console.error('Error fetching chats:', error);
        toast.error('Failed to load chats');
      } finally {
        setLoading(false);
      }
    };

    fetchChats();

    // Set up real-time subscription for new chats and messages
    const channel = supabase
      .channel('admin-dashboard-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'chats' 
      }, () => {
        fetchChats(); // Refetch chats when there's a change
      })
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages' 
      }, () => {
        fetchChats(); // Refetch when there's a new message
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, activeTab]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle chat selection
  const handleSelectChat = (chatId: string) => {
    setSelectedChat(chatId === selectedChat ? null : chatId);
  };

  // Close chat functionality
  const handleCloseChat = async (chatId: string) => {
    try {
      const { error } = await supabase
        .from('chats')
        .update({ status: 'closed' })
        .eq('id', chatId);

      if (error) throw error;
      
      toast.success('Chat closed successfully');
      // Update local state
      setChats(chats.filter(chat => chat.id !== chatId));
      if (selectedChat === chatId) {
        setSelectedChat(null);
      }
    } catch (error) {
      console.error('Error closing chat:', error);
      toast.error('Failed to close chat');
    }
  };

  // Reopen chat functionality
  const handleReopenChat = async (chatId: string) => {
    try {
      const { error } = await supabase
        .from('chats')
        .update({ status: 'open' })
        .eq('id', chatId);

      if (error) throw error;
      
      toast.success('Chat reopened successfully');
      // Update local state
      setChats(chats.filter(chat => chat.id !== chatId));
      if (selectedChat === chatId) {
        setSelectedChat(null);
      }
    } catch (error) {
      console.error('Error reopening chat:', error);
      toast.error('Failed to reopen chat');
    }
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>You need admin privileges to view this page.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Admin Chat Dashboard</h1>
      
      <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-200px)]">
        <Card className="w-full md:w-1/3 h-full">
          <CardHeader className="pb-3">
            <CardTitle>Support Conversations</CardTitle>
            <CardDescription>
              Manage user support conversations
            </CardDescription>
            <Tabs defaultValue="open" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="open">Open</TabsTrigger>
                <TabsTrigger value="closed">Closed</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-300px)]">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <p>Loading chats...</p>
                </div>
              ) : chats.length === 0 ? (
                <div className="flex justify-center items-center h-40">
                  <p className="text-gray-500">No {activeTab} chats</p>
                </div>
              ) : (
                <div>
                  {chats.map((chat) => (
                    <div key={chat.id}>
                      <div 
                        className={`p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                          selectedChat === chat.id ? 'bg-gray-100 dark:bg-gray-800' : ''
                        }`}
                        onClick={() => handleSelectChat(chat.id)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-medium">
                            {chat.user_name || 'Anonymous'}{' '}
                            {chat.unread_count && chat.unread_count > 0 ? (
                              <Badge variant="destructive" className="ml-2">{chat.unread_count}</Badge>
                            ) : null}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {formatDate(chat.updated_at || chat.created_at)}
                          </span>
                        </div>
                        {chat.user_email && (
                          <p className="text-xs text-gray-500 mb-2">{chat.user_email}</p>
                        )}
                        {chat.latest_message && (
                          <p className="text-sm truncate">
                            {chat.latest_message.content}
                          </p>
                        )}
                        <div className="flex justify-end mt-2">
                          {activeTab === 'open' ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCloseChat(chat.id);
                              }}
                            >
                              Close
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReopenChat(chat.id);
                              }}
                            >
                              Reopen
                            </Button>
                          )}
                        </div>
                      </div>
                      <Separator />
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="w-full md:w-2/3 h-full">
          <CardHeader>
            <CardTitle>
              {selectedChat ? 'Chat Conversation' : 'Select a Chat'}
            </CardTitle>
            <CardDescription>
              {selectedChat 
                ? 'Respond to the selected conversation' 
                : 'Select a conversation from the list to view details and respond'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedChat ? (
              <AdminChatView chatId={selectedChat} />
            ) : (
              <div className="flex justify-center items-center h-[calc(100vh-400px)]">
                <p className="text-gray-500">No chat selected</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminChatDashboard;
