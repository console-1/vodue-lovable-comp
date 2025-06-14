import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

/**
 * Represents a conversation object as stored and retrieved from the database.
 */
export interface Conversation {
  /** The unique identifier for the conversation. */
  id: string;
  /** The title of the conversation. */
  title: string;
  /** The mode of the conversation, indicating its purpose (e.g., building a workflow or interacting with it). */
  mode: 'build' | 'interact';
  /** Timestamp of when the conversation was created. */
  created_at: string;
  /** Timestamp of when the conversation was last updated. */
  updated_at: string;
}

/**
 * Custom React hook for managing conversations.
 * Provides functionality to fetch, create, update, and delete conversations
 * associated with the currently authenticated user.
 * It also handles loading states and displays toasts for user feedback.
 *
 * @returns {object} An object containing:
 *  - `conversations` {Conversation[]}: An array of the current user's conversations, ordered by most recently updated.
 *  - `loading` {boolean}: A boolean indicating if conversations are currently being fetched.
 *  - `createConversation` {function(title: string, mode: 'build' | 'interact'): Promise<Conversation | null>}: Function to create a new conversation.
 *  - `updateConversation` {function(id: string, updates: Partial<Conversation>): Promise<boolean>}: Function to update an existing conversation's title or mode.
 *  - `deleteConversation` {function(id: string): Promise<boolean>}: Function to delete a conversation.
 *  - `refetch` {function(): Promise<void>}: Function to manually refetch the list of conversations.
 */
export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  /**
   * Fetches conversations for the current user from the database.
   * Orders conversations by the last update time, descending.
   * Updates the `conversations` state and handles loading and error states.
   * @async
   */
  const fetchConversations = useCallback(async () => {
    if (!user) {
      setConversations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        toast({
          title: "Error",
          description: "Failed to load conversations: " + error.message,
          variant: "destructive",
        });
        setConversations([]); // Clear conversations on error
        return;
      }

      setConversations(data || []);
    } catch (error) {
      console.error('Caught error fetching conversations:', error);
      toast({
        title: "Error Loading Conversations",
        description: "An unexpected error occurred while fetching conversations. Please try again later.",
        variant: "destructive",
      });
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  /**
   * Creates a new conversation for the current user.
   * @param {string} title - The title for the new conversation.
   * @param {'build' | 'interact'} mode - The mode for the new conversation.
   * @returns {Promise<Conversation | null>} A promise that resolves to the created conversation object or null if creation fails.
   * @async
   */
  const createConversation = async (title: string, mode: 'build' | 'interact'): Promise<Conversation | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          title,
          mode,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        toast({
          title: "Error",
          description: "Failed to create conversation: " + error.message,
          variant: "destructive",
        });
        return null;
      }

      setConversations(prev => [data, ...prev]);
      toast({
        title: "Conversation Created",
        description: `Conversation "${data.title}" has been successfully created.`,
        variant: "default",
      });
      return data;
    } catch (error) {
      console.error('Caught error creating conversation:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating the conversation.",
        variant: "destructive",
      });
      return null;
    }
  };

  /**
   * Updates an existing conversation's title or mode.
   * Note: Only `title` and `mode` are typically updatable by the user directly through this function.
   * Other fields like `updated_at` are handled by the database.
   * @param {string} id - The ID of the conversation to update.
   * @param {Partial<Pick<Conversation, 'title' | 'mode'>>} updates - An object containing the fields to update (e.g., title, mode).
   * @returns {Promise<boolean>} A promise that resolves to true if update is successful, false otherwise.
   * @async
   */
  const updateConversation = async (id: string, updates: Partial<Pick<Conversation, 'title' | 'mode'>>): Promise<boolean> => {
    try {
      const { data: updatedData, error } = await supabase
        .from('conversations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating conversation:', error);
        toast({
          title: "Error",
          description: "Failed to update conversation: " + error.message,
          variant: "destructive",
        });
        return false;
      }

      setConversations(prev =>
        prev.map(conv => conv.id === id ? updatedData : conv)
      );
      toast({
        title: "Conversation Updated",
        description: `Conversation "${updatedData.title}" has been successfully updated.`,
        variant: "default",
      });
      return true;
    } catch (error) {
      console.error('Caught error updating conversation:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating the conversation.",
        variant: "destructive",
      });
      return false;
    }
  };

  /**
   * Deletes a conversation.
   * @param {string} id - The ID of the conversation to delete.
   * @returns {Promise<boolean>} A promise that resolves to true if deletion is successful, false otherwise.
   * @async
   */
  const deleteConversation = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting conversation:', error);
        toast({
          title: "Error",
          description: "Failed to delete conversation: " + error.message,
          variant: "destructive",
        });
        return false;
      }

      setConversations(prev => prev.filter(conv => conv.id !== id));
      toast({
        title: "Conversation Deleted",
        description: "The conversation has been successfully deleted.",
        variant: "default",
      });
      return true;
    } catch (error) {
      console.error('Caught error deleting conversation:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the conversation.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user, fetchConversations]); // Added fetchConversations to dependency array

  return {
    conversations,
    loading,
    createConversation,
    updateConversation,
    deleteConversation,
    refetch: fetchConversations,
  };
};
