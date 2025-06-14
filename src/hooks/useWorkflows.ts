
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Workflow {
  id: string;
  name: string;
  description?: string;
  n8n_json?: any;
  frontend_code?: string;
  webhook_url?: string;
  status: 'draft' | 'deployed' | 'active';
  is_public: boolean;
  created_at: string;
}

export const useWorkflows = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchWorkflows = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching workflows:', error);
        toast({
          title: "Error",
          description: "Failed to load workflows",
          variant: "destructive",
        });
        return;
      }

      setWorkflows(data || []);
    } catch (error) {
      console.error('Error fetching workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const createWorkflow = async (workflow: Partial<Workflow>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('workflows')
        .insert({
          ...workflow,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating workflow:', error);
        toast({
          title: "Error",
          description: "Failed to create workflow",
          variant: "destructive",
        });
        return null;
      }

      setWorkflows(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating workflow:', error);
      return null;
    }
  };

  const updateWorkflow = async (id: string, updates: Partial<Workflow>) => {
    try {
      const { error } = await supabase
        .from('workflows')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating workflow:', error);
        return false;
      }

      setWorkflows(prev =>
        prev.map(workflow => workflow.id === id ? { ...workflow, ...updates } : workflow)
      );
      return true;
    } catch (error) {
      console.error('Error updating workflow:', error);
      return false;
    }
  };

  const deleteWorkflow = async (id: string) => {
    try {
      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting workflow:', error);
        return false;
      }

      setWorkflows(prev => prev.filter(workflow => workflow.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting workflow:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [user]);

  return {
    workflows,
    loading,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    refetch: fetchWorkflows,
  };
};
