
import { useState, useCallback } from 'react';
import { NodeService } from '@/services/nodeService';
import { NodeIntelligenceService, type NodeRecommendation } from '@/services/nodeIntelligenceService';
import { EnhancedWorkflowValidator, type EnhancedValidationResult } from '@/utils/enhancedWorkflowValidator';
import { useToast } from '@/hooks/use-toast';

export const useNodeIntelligence = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<EnhancedValidationResult | null>(null);
  const { toast } = useToast();

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
          variant: "default"
        });
      } else {
        toast({
          title: "Workflow Valid",
          description: "No issues found in your workflow. Great job!",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: "Validation Error",
        description: "An unexpected error occurred while validating the workflow.",
        variant: "destructive"
      });
      setValidationResult(null);
    } finally {
      setIsValidating(false);
    }
  }, [toast]);

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
      return { fixed: workflow, changes: [] };
    }
  }, [toast]);

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
      return [];
    }
  }, [toast]);

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
    } catch (error: unknown) {
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
