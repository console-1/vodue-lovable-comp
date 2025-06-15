
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { WorkflowService } from '@/services/workflowService';
import type { Workflow, CreateWorkflowInput } from '@/types/workflowTypes';

export { type Workflow, type CreateWorkflowInput } from '@/types/workflowTypes';

export const useWorkflows = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchWorkflows = useCallback(async () => {
    if (!user) {
      setWorkflows([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await WorkflowService.fetchWorkflows();
      setWorkflows(data);
    } catch (error) {
      console.error('Error fetching workflows:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred while fetching workflows.",
        variant: "destructive",
      });
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const createWorkflow = async (workflowInput: CreateWorkflowInput): Promise<Workflow | null> => {
    if (!user) return null;

    try {
      const newWorkflow = await WorkflowService.createWorkflow(user.id, workflowInput);
      setWorkflows(prev => [newWorkflow, ...prev]);
      toast({
        title: "Workflow Created",
        description: `Workflow "${newWorkflow.name}" has been successfully created.`,
        variant: "default",
      });
      return newWorkflow;
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred while creating the workflow.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateWorkflow = async (id: string, updates: Partial<CreateWorkflowInput>): Promise<boolean> => {
    try {
      const updatedWorkflow = await WorkflowService.updateWorkflow(id, updates);
      setWorkflows(prev =>
        prev.map(workflow => workflow.id === id ? updatedWorkflow : workflow)
      );
      toast({
        title: "Workflow Updated",
        description: `Workflow "${updatedWorkflow.name}" has been successfully updated.`,
        variant: "default",
      });
      return true;
    } catch (error) {
      console.error('Error updating workflow:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred while updating the workflow.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteWorkflow = async (id: string): Promise<boolean> => {
    try {
      await WorkflowService.deleteWorkflow(id);
      setWorkflows(prev => prev.filter(workflow => workflow.id !== id));
      toast({
        title: "Workflow Deleted",
        description: "The workflow has been successfully deleted.",
        variant: "default",
      });
      return true;
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred while deleting the workflow.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [user, fetchWorkflows]);

  return {
    workflows,
    loading,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    refetch: fetchWorkflows,
  };
};
