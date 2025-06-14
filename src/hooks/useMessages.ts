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

/**
 * Custom React hook for managing messages within a specific conversation.
 * Provides functionality to fetch messages and add new messages to the conversation.
 * It depends on a `conversationId` to scope its operations.
 *
 * @param {string | undefined} conversationId - The ID of the conversation whose messages are to be managed.
 * If undefined, the hook will not fetch or allow adding messages.
 * @returns {object} An object containing:
 *  - `messages` {Message[]}: An array of messages for the current conversation, ordered by timestamp.
 *  - `loading` {boolean}: A boolean indicating if messages are currently being fetched.
 *  - `addMessage` {function(content: string, role: 'user' | 'assistant', metadata?: any): Promise<Message | null>}: Function to add a new message to the conversation.
 *  - `refetch` {function(): Promise<void>}: Function to manually refetch the messages for the conversation.
 */
export const useMessages = (conversationId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  /**
   * Fetches messages for the specified `conversationId` from the database.
   * Orders messages by timestamp in ascending order.
   * Updates the `messages` state and handles loading and error states.
   * @async
   */
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
        setMessages([]); // Clear messages on error
        return;
      }

      setMessages(data || []);
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

  /**
   * Adds a new message to the current conversation.
   * @param {string} content - The textual content of the message.
   * @param {'user' | 'assistant'} role - The role of the message sender.
   * @param {any} [metadata] - Optional metadata to associate with the message.
   * @returns {Promise<Message | null>} A promise that resolves to the newly created message object or null if creation fails.
   * @async
   */
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

      setMessages(prev => [...prev, data]);
      // No toast for successful message add, as it's usually immediately visible.
      return data;
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
  }, [fetchMessages]); // fetchMessages is wrapped in useCallback

  return {
    messages,
    loading,
    addMessage,
    refetch: fetchMessages,
  };
};
