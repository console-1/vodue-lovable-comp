
import { EnhancedWorkflowValidator } from '@/utils/enhancedWorkflowValidator';
import { WorkflowService } from './workflowService';
import type { WorkflowData, CreateWorkflowInput, Workflow } from '@/types/workflowTypes';

export class WorkflowOperationsService {
  static async exportWorkflow(
    workflow: WorkflowData,
    validationResults: any,
    onSuccess: (message: string) => void,
    onError: (message: string) => void
  ): Promise<void> {
    try {
      let workflowToExport = workflow.json;
      
      // Auto-fix if needed
      if (!validationResults?.isValid) {
        // Apply any available auto-fixes
        const { fixed } = await EnhancedWorkflowValidator.autoFixWorkflow(workflowToExport);
        workflowToExport = fixed;
        onSuccess("Applied intelligent optimizations before export.");
      }
      
      const dataStr = JSON.stringify(workflowToExport, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `${workflow.name.replace(/[^a-z0-9]/gi, '_')}_vodue.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      onSuccess("Your intelligent n8n workflow has been exported with VODUE optimizations.");
    } catch (error) {
      console.error('Export error:', error);
      onError("There was an error exporting your workflow.");
    }
  }

  static async deployWorkflow(
    workflow: WorkflowData,
    userId: string,
    workflows: Workflow[],
    onWorkflowCreate: (workflows: Workflow[]) => void,
    onSuccess: (message: string) => void,
    onError: (message: string) => void
  ): Promise<void> {
    try {
      // Save to database using the enhanced workflow data
      const savedWorkflow = await WorkflowService.createWorkflow(userId, {
        name: workflow.name,
        description: workflow.description,
        n8n_json: workflow.json,
        status: 'deployed',
        is_public: false
      });

      const newWorkflows = [...workflows, savedWorkflow];
      onWorkflowCreate(newWorkflows);
      
      onSuccess(`"${workflow.name}" is now live in your VODUE workspace with enhanced intelligence.`);
    } catch (error) {
      console.error('Deploy error:', error);
      onError("There was an error deploying your workflow to the database.");
    }
  }
}
