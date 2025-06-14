import { useState, useCallback } from 'react';
// NodeService is still needed for saveWorkflowAsTemplate
import { NodeService } from '@/services/nodeService';
// NodeRecommendation type is used in getNodeRecommendations return type JSDoc
import { NodeIntelligenceService, type NodeRecommendation } from '@/services/nodeIntelligenceService';
import { EnhancedWorkflowValidator, type EnhancedValidationResult } from '@/utils/enhancedWorkflowValidator';
import { useToast } from '@/hooks/use-toast';

/**
 * Custom React hook providing a suite of workflow intelligence features.
 * This includes workflow validation, auto-fixing, node recommendations, and saving workflows as templates.
 * It utilizes `NodeService`, `NodeIntelligenceService`, and `EnhancedWorkflowValidator` to perform these actions.
 * User feedback is provided via toasts.
 *
 * @returns {object} An object containing:
 *  - `isValidating` {boolean}: True if workflow validation is currently in progress.
 *  - `validationResult` {EnhancedValidationResult | null}: The result of the last workflow validation, or null if no validation has occurred.
 *  - `validateWorkflow` {function(workflow: any): Promise<void>}: Function to validate a workflow.
 *  - `autoFixWorkflow` {function(workflow: any): Promise<{ fixed: any; changes: string[] }>}: Function to attempt auto-fixing a workflow.
 *  - `getNodeRecommendations` {function(intent: string, currentNodes?: any[]): Promise<NodeRecommendation[]>}: Function to get node recommendations based on intent.
 *  - `saveAsTemplate` {function(name: string, description: string, workflow: any, category: string, options?: { tags?: string[]; useCase?: string; difficulty?: 'beginner' | 'intermediate' | 'advanced'; isPublic?: boolean; }): Promise<void>}: Function to save a workflow as a template.
 */
export const useNodeIntelligence = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<EnhancedValidationResult | null>(null);
  const { toast } = useToast();

  /**
   * Validates a given workflow comprehensively.
   * Sets validation results and loading states. Displays toasts for feedback.
   * @param {any} workflow - The workflow object to validate.
   * @returns {Promise<void>} A promise that resolves when validation is complete.
   * @async
   */
  const validateWorkflow = useCallback(async (workflow: any) => {
    if (!workflow) return;
    
    setIsValidating(true);
    try {
      const result = await EnhancedWorkflowValidator.validateWorkflowComprehensive(workflow);
      setValidationResult(result);
      
      const errorCount = result.issues.filter(issue => issue.type === 'error').length;
      const warningCount = result.issues.filter(issue => issue.type === 'warning').length;
      
      if (errorCount > 0) {
        toast({
          title: "Validation Issues Found",
          description: `${errorCount} errors and ${warningCount} warnings detected. Please review.`,
          variant: "destructive"
        });
      } else if (warningCount > 0) {
        toast({
          title: "Workflow Validated",
          description: `${warningCount} warnings found. Consider addressing them for optimal performance.`,
          variant: "default" // Or a specific warning variant if available
        });
      } else {
        toast({
          title: "Workflow Valid",
          description: "No issues found in your workflow. Great job!",
          variant: "default" // Or a specific success variant
        });
      }
    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: "Validation Error",
        description: "An unexpected error occurred while validating the workflow.",
        variant: "destructive"
      });
      setValidationResult(null); // Clear previous results on error
    } finally {
      setIsValidating(false);
    }
  }, [toast]);

  /**
   * Attempts to automatically fix issues in a given workflow.
   * Displays a toast message indicating the number of fixes applied.
   * @param {any} workflow - The workflow object to auto-fix.
   * @returns {Promise<{ fixed: any; changes: string[] }>} A promise that resolves to an object containing the (potentially) fixed workflow and a list of applied change descriptions. Returns the original workflow and empty changes on error.
   * @async
   */
  const autoFixWorkflow = useCallback(async (workflow: any) => {
    try {
      const { fixed, changes } = await EnhancedWorkflowValidator.autoFixWorkflow(workflow);
      
      if (changes.length > 0) {
        toast({
          title: "Workflow Auto-Fixed",
          description: `Applied ${changes.length} automatic fix(es). Please review the changes.`,
          variant: "default"
        });
      } else {
        toast({
          title: "Auto-Fix Attempted",
          description: "No automatic fixes were applied. The workflow may already be optimal or require manual intervention.",
          variant: "default"
        });
      }
      return { fixed, changes };
    } catch (error) {
      console.error('Auto-fix error:', error);
      toast({
        title: "Auto-Fix Error",
        description: "An unexpected error occurred during the auto-fix process.",
        variant: "destructive"
      });
      return { fixed: workflow, changes: [] }; // Return original workflow on error
    }
  }, [toast]);

  /**
   * Fetches intelligent node recommendations based on user intent and current workflow nodes.
   * @param {string} intent - The user's intent or goal (e.g., "process webhook data").
   * @param {any[]} [currentNodes=[]] - An array of nodes currently in the workflow.
   * @returns {Promise<NodeRecommendation[]>} A promise that resolves to an array of node recommendations. Returns an empty array on error.
   * @async
   */
  const getNodeRecommendations = useCallback(async (intent: string, currentNodes: any[] = []): Promise<NodeRecommendation[]> => {
    try {
      return await NodeIntelligenceService.getIntelligentRecommendations(intent, currentNodes);
    } catch (error) {
      console.error('Recommendation error:', error);
      toast({
        title: "Recommendation Error",
        description: "Failed to fetch node recommendations.",
        variant: "destructive"
      });
      return []; // Return empty array on error
    }
  }, [toast]); // Added toast to dependency array

  /**
   * Saves the current workflow as a template.
   * @param {string} name - The name for the new template.
   * @param {string} description - A description for the new template.
   * @param {any} workflow - The workflow object (n8n JSON structure) to save.
   * @param {string} category - The category for the template.
   * @param {object} [options={}] - Optional parameters for template creation.
   * @param {string[]} [options.tags] - Tags for the template.
   * @param {string} [options.useCase] - Use case description for the template.
   * @param {'beginner' | 'intermediate' | 'advanced'} [options.difficulty] - Difficulty level of the template.
   * @param {boolean} [options.isPublic] - Whether the template should be publicly accessible.
   * @returns {Promise<void>} A promise that resolves when the save operation is complete.
   * @async
   */
  const saveAsTemplate = useCallback(async (
    name: string,
    description: string,
    workflow: any,
    category: string,
    options: {
      tags?: string[];
      useCase?: string;
      difficulty?: 'beginner' | 'intermediate' | 'advanced';
      isPublic?: boolean;
    } = {}
  ) => {
    try {
      await NodeService.saveWorkflowAsTemplate(
        name,
        description,
        workflow,
        category,
        options.tags,
        options.useCase,
        options.difficulty,
        options.isPublic
      );
      
      toast({
        title: "Template Saved",
        description: `Workflow "${name}" saved as a template successfully.`,
        variant: "default"
      });
    } catch (error: unknown) { // Catch unknown for better error handling
      console.error('Save template error:', error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        title: "Save Template Error",
        description: `Failed to save workflow as template: ${errorMessage}`,
        variant: "destructive"
      });
    }
  }, [toast]);

  return {
    isValidating,
    validationResult,
    validateWorkflow,
    autoFixWorkflow,
    getNodeRecommendations,
    saveAsTemplate
  };
};
