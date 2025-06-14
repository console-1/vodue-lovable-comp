import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

/**
 * Represents a workflow object as stored and retrieved from the database.
 */
export interface Workflow {
  /** The unique identifier for the workflow. */
  id: string;
  /** The name of the workflow. */
  name: string;
  /** An optional description for the workflow. */
  description?: string;
  /** The n8n JSON representation of the workflow, if applicable. */
  n8n_json?: any;
  /** The frontend-specific code or configuration for the workflow, if applicable. */
  frontend_code?: string;
  /** The webhook URL for the workflow if it's triggered by a webhook. */
  webhook_url?: string;
  /** The current status of the workflow. */
  status: 'draft' | 'deployed' | 'active';
  /** Indicates whether the workflow is publicly accessible. */
  is_public: boolean;
  /** Timestamp of when the workflow was created. */
  created_at: string;
}

/**
 * Defines the input structure for creating a new workflow.
 */
export interface CreateWorkflowInput {
  /** The name of the workflow. */
  name: string;
  /** An optional description for the workflow. */
  description?: string;
  /** The n8n JSON representation of the workflow, if applicable. */
  n8n_json?: any;
  /** The frontend-specific code or configuration for the workflow, if applicable. */
  frontend_code?: string;
  /** The webhook URL for the workflow if it's triggered by a webhook. */
  webhook_url?: string;
  /** The initial status of the workflow. Defaults to 'draft'. */
  status?: 'draft' | 'deployed' | 'active';
  /** Indicates whether the workflow should be publicly accessible. Defaults to false. */
  is_public?: boolean;
  /** Optional ID of a conversation related to this workflow. */
  conversation_id?: string;
}

/**
 * Custom React hook for managing workflows.
 * Provides functionality to fetch, create, update, and delete workflows.
 * It also handles loading states and displays toasts for error messages.
 *
 * @returns {object} An object containing:
 *  - `workflows` {Workflow[]}: An array of the current user's workflows.
 *  - `loading` {boolean}: A boolean indicating if workflows are currently being fetched.
 *  - `createWorkflow` {function(workflow: CreateWorkflowInput): Promise<Workflow | null>}: Function to create a new workflow.
 *  - `updateWorkflow` {function(id: string, updates: Partial<CreateWorkflowInput>): Promise<boolean>}: Function to update an existing workflow.
 *  - `deleteWorkflow` {function(id: string): Promise<boolean>}: Function to delete a workflow.
 *  - `refetch` {function(): Promise<void>}: Function to manually refetch the list of workflows.
 */
export const useWorkflows = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  /**
   * Fetches workflows for the current user from the database.
   * Updates the `workflows` state and handles loading and error states.
   * @async
   */
  const fetchWorkflows = useCallback(async () => {
    if (!user) {
      setWorkflows([]);
      setLoading(false);
      return;
    }

    setLoading(true);
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
        setWorkflows([]); // Clear workflows on error
        return;
      }

      setWorkflows(data || []);
    } catch (error) {
      console.error('Caught error fetching workflows:', error);
      toast({
        title: "Error Loading Workflows",
        description: "An unexpected error occurred while fetching workflows. Please try again later.",
        variant: "destructive",
      });
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  /**
   * Creates a new workflow for the current user.
   * @param {CreateWorkflowInput} workflowInput - The details of the workflow to create.
   * @returns {Promise<Workflow | null>} A promise that resolves to the created workflow object or null if creation fails.
   * @async
   */
  const createWorkflow = async (workflowInput: CreateWorkflowInput): Promise<Workflow | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('workflows')
        .insert({
          ...workflowInput, // Spread all properties from input
          status: workflowInput.status || 'draft',
          is_public: workflowInput.is_public || false,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating workflow:', error);
        toast({
          title: "Error",
          description: "Failed to create workflow: " + error.message,
          variant: "destructive",
        });
        return null;
      }

      setWorkflows(prev => [data, ...prev]);
      toast({
        title: "Workflow Created",
        description: `Workflow "${data.name}" has been successfully created.`,
        variant: "default",
      });
      return data;
    } catch (error) {
      console.error('Caught error creating workflow:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating the workflow.",
        variant: "destructive",
      });
      return null;
    }
  };

  /**
   * Updates an existing workflow.
   * @param {string} id - The ID of the workflow to update.
   * @param {Partial<CreateWorkflowInput>} updates - An object containing the fields to update.
   * @returns {Promise<boolean>} A promise that resolves to true if update is successful, false otherwise.
   * @async
   */
  const updateWorkflow = async (id: string, updates: Partial<CreateWorkflowInput>): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating workflow:', error);
        toast({
          title: "Error",
          description: "Failed to update workflow: " + error.message,
          variant: "destructive",
        });
        return false;
      }

      setWorkflows(prev =>
        prev.map(workflow => workflow.id === id ? data : workflow)
      );
      toast({
        title: "Workflow Updated",
        description: `Workflow "${data.name}" has been successfully updated.`,
        variant: "default",
      });
      return true;
    } catch (error) {
      console.error('Caught error updating workflow:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating the workflow.",
        variant: "destructive",
      });
      return false;
    }
  };

  /**
   * Deletes a workflow.
   * @param {string} id - The ID of the workflow to delete.
   * @returns {Promise<boolean>} A promise that resolves to true if deletion is successful, false otherwise.
   * @async
   */
  const deleteWorkflow = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting workflow:', error);
        toast({
          title: "Error",
          description: "Failed to delete workflow: " + error.message,
          variant: "destructive",
        });
        return false;
      }

      setWorkflows(prev => prev.filter(workflow => workflow.id !== id));
      toast({
        title: "Workflow Deleted",
        description: "The workflow has been successfully deleted.",
        variant: "default",
      });
      return true;
    } catch (error) {
      console.error('Caught error deleting workflow:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the workflow.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [user, fetchWorkflows]); // Added fetchWorkflows to dependency array due to useCallback

  return {
    workflows,
    loading,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    refetch: fetchWorkflows,
  };
};
