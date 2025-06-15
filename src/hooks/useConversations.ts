
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ConversationService } from '@/services/conversationService';
import type { Conversation, ConversationCreateInput, ConversationUpdateInput } from '@/types/conversationTypes';

export { type Conversation } from '@/types/conversationTypes';

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
      const data = await ConversationService.fetchConversations(user.id);
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred while fetching conversations.",
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
      const newConversation = await ConversationService.createConversation(user.id, { title, mode });
      setConversations(prev => [newConversation, ...prev]);
      toast({
        title: "Conversation Created",
        description: `Conversation "${newConversation.title}" has been successfully created.`,
        variant: "default",
      });
      return newConversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred while creating the conversation.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateConversation = async (id: string, updates: ConversationUpdateInput): Promise<boolean> => {
    try {
      const updatedConversation = await ConversationService.updateConversation(id, updates);
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
      console.error('Error updating conversation:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred while updating the conversation.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteConversation = async (id: string): Promise<boolean> => {
    try {
      await ConversationService.deleteConversation(id);
      setConversations(prev => prev.filter(conv => conv.id !== id));
      toast({
        title: "Conversation Deleted",
        description: "The conversation has been successfully deleted.",
        variant: "default",
      });
      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred while deleting the conversation.",
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
