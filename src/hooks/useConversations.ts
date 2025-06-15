
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

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

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
        setConversations([]);
        return;
      }

      // Type cast the database response to match our interface
      setConversations((data || []).map(item => ({
        ...item,
        mode: item.mode as 'build' | 'interact'
      })));
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

      const newConversation: Conversation = {
        ...data,
        mode: data.mode as 'build' | 'interact'
      };

      setConversations(prev => [newConversation, ...prev]);
      toast({
        title: "Conversation Created",
        description: `Conversation "${newConversation.title}" has been successfully created.`,
        variant: "default",
      });
      return newConversation;
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

      const updatedConversation: Conversation = {
        ...updatedData,
        mode: updatedData.mode as 'build' | 'interact'
      };

      setConversations(prev =>
        prev.map(conv => conv.id === id ? updatedConversation : conv)
      );
      toast({
        title: "Conversation Updated",
        description: `Conversation "${updatedConversation.title}" has been successfully updated.`,
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
  }, [user, fetchConversations]);

  return {
    conversations,
    loading,
    createConversation,
    updateConversation,
    deleteConversation,
    refetch: fetchConversations,
  };
};
