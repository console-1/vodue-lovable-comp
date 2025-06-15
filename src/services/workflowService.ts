
import { supabase } from '@/integrations/supabase/client';
import type { Workflow, CreateWorkflowInput } from '@/types/workflowTypes';

export class WorkflowService {
  static async fetchWorkflows(): Promise<Workflow[]> {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to load workflows: ${error.message}`);
    }

    // Type cast the database response to match our interface
    return (data || []).map(item => ({
      ...item,
      status: item.status as 'draft' | 'deployed' | 'active'
    }));
  }

  static async createWorkflow(
    userId: string,
    workflowInput: CreateWorkflowInput
  ): Promise<Workflow> {
    const { data, error } = await supabase
      .from('workflows')
      .insert({
        ...workflowInput,
        status: workflowInput.status || 'draft',
        is_public: workflowInput.is_public || false,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create workflow: ${error.message}`);
    }

    return {
      ...data,
      status: data.status as 'draft' | 'deployed' | 'active'
    };
  }

  static async updateWorkflow(
    id: string,
    updates: Partial<CreateWorkflowInput>
  ): Promise<Workflow> {
    const { data, error } = await supabase
      .from('workflows')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update workflow: ${error.message}`);
    }

    return {
      ...data,
      status: data.status as 'draft' | 'deployed' | 'active'
    };
  }

  static async deleteWorkflow(id: string): Promise<void> {
    const { error } = await supabase
      .from('workflows')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete workflow: ${error.message}`);
    }
  }
}
