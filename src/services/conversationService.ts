
import { supabase } from '@/integrations/supabase/client';
import type { Conversation, ConversationCreateInput, ConversationUpdateInput } from '@/types/conversationTypes';

export class ConversationService {
  static async fetchConversations(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to load conversations: ${error.message}`);
    }

    // Type cast the database response to match our interface
    return (data || []).map(item => ({
      ...item,
      mode: item.mode as 'build' | 'interact'
    }));
  }

  static async createConversation(
    userId: string, 
    input: ConversationCreateInput
  ): Promise<Conversation> {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        title: input.title,
        mode: input.mode,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create conversation: ${error.message}`);
    }

    return {
      ...data,
      mode: data.mode as 'build' | 'interact'
    };
  }

  static async updateConversation(
    id: string, 
    updates: ConversationUpdateInput
  ): Promise<Conversation> {
    const { data, error } = await supabase
      .from('conversations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update conversation: ${error.message}`);
    }

    return {
      ...data,
      mode: data.mode as 'build' | 'interact'
    };
  }

  static async deleteConversation(id: string): Promise<void> {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete conversation: ${error.message}`);
    }
  }
}
