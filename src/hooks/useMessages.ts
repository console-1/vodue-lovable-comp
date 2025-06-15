
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

/**
 * Represents a message within a conversation.
 */
export interface Message {
  /** The unique identifier for the message. */
  id: string;
  /** The textual content of the message. */
  content: string;
  /** The role of the entity that sent the message. */
  role: 'user' | 'assistant';
  /** Timestamp of when the message was created. */
  timestamp: string;
  /** Optional metadata associated with the message (e.g., sources, tool calls). */
  metadata?: any;
}

export const useMessages = (conversationId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMessages = useCallback(async () => {
    if (!user || !conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: "Error",
          description: "Failed to load messages: " + error.message,
          variant: "destructive",
        });
        setMessages([]);
        return;
      }

      // Type cast the database response to match our interface
      setMessages((data || []).map(item => ({
        ...item,
        role: item.role as 'user' | 'assistant'
      })));
    } catch (error) {
      console.error('Caught error fetching messages:', error);
      toast({
        title: "Error Loading Messages",
        description: "An unexpected error occurred while fetching messages. Please try again later.",
        variant: "destructive",
      });
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [user, conversationId, toast]);

  const addMessage = async (content: string, role: 'user' | 'assistant', metadata?: any): Promise<Message | null> => {
    if (!user || !conversationId) {
      toast({
        title: "Error",
        description: "Cannot add message: User not authenticated or conversation not selected.",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          content,
          role,
          conversation_id: conversationId,
          user_id: user.id,
          metadata: metadata || {},
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding message:', error);
        toast({
          title: "Error",
          description: "Failed to save message: " + error.message,
          variant: "destructive",
        });
        return null;
      }

      const newMessage: Message = {
        ...data,
        role: data.role as 'user' | 'assistant'
      };

      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (error) {
      console.error('Caught error adding message:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving the message.",
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages,
    loading,
    addMessage,
    refetch: fetchMessages,
  };
};
