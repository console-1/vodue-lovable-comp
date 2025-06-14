
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Conversation {
  id: string;
  title: string;
  mode: 'build' | 'interact';
  created_at: string;
  updated_at: string;
}

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        toast({
          title: "Error",
          description: "Failed to load conversations",
          variant: "destructive",
        });
        return;
      }

      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (title: string, mode: 'build' | 'interact') => {
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
          description: "Failed to create conversation",
          variant: "destructive",
        });
        return null;
      }

      setConversations(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  const updateConversation = async (id: string, updates: Partial<Conversation>) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating conversation:', error);
        return false;
      }

      setConversations(prev =>
        prev.map(conv => conv.id === id ? { ...conv, ...updates } : conv)
      );
      return true;
    } catch (error) {
      console.error('Error updating conversation:', error);
      return false;
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting conversation:', error);
        return false;
      }

      setConversations(prev => prev.filter(conv => conv.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  return {
    conversations,
    loading,
    createConversation,
    updateConversation,
    deleteConversation,
    refetch: fetchConversations,
  };
};
