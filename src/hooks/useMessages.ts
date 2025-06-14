
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  metadata?: any;
}

export const useMessages = (conversationId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMessages = async () => {
    if (!user || !conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

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
          description: "Failed to load messages",
          variant: "destructive",
        });
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMessage = async (content: string, role: 'user' | 'assistant', metadata?: any) => {
    if (!user || !conversationId) return null;

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
          description: "Failed to save message",
          variant: "destructive",
        });
        return null;
      }

      setMessages(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error adding message:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [user, conversationId]);

  return {
    messages,
    loading,
    addMessage,
    refetch: fetchMessages,
  };
};
