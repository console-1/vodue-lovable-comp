
import { useState, useCallback } from 'react';
// NodeService is still needed for saveWorkflowAsTemplate
import { NodeService, type ValidationIssue } from '@/services/nodeService';
import { NodeIntelligenceService } from '@/services/nodeIntelligenceService';
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
          description: `${errorCount} errors and ${warningCount} warnings detected`,
          variant: "destructive"
        });
      } else if (warningCount > 0) {
        toast({
          title: "Workflow Validated",
          description: `${warningCount} warnings found - consider improvements`,
          variant: "default"
        });
      } else {
        toast({
          title: "Workflow Valid",
          description: "No issues found in your workflow",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: "Validation Error",
        description: "Failed to validate workflow",
        variant: "destructive"
      });
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
          description: `Applied ${changes.length} automatic fixes`,
          variant: "default"
        });
      }
      
      return { fixed, changes };
    } catch (error) {
      console.error('Auto-fix error:', error);
      toast({
        title: "Auto-Fix Error",
        description: "Failed to automatically fix workflow",
        variant: "destructive"
      });
      return { fixed: workflow, changes: [] };
    }
  }, [toast]);

  const getNodeRecommendations = useCallback(async (intent: string, currentNodes: any[] = []) => {
    try {
      // Return type of getIntelligentRecommendations is Promise<NodeRecommendation[]>
      // which is compatible with Promise<NodeDefinition[]> as NodeRecommendation extends NodeDefinition
      return await NodeIntelligenceService.getIntelligentRecommendations(intent, currentNodes);
    } catch (error) {
      console.error('Recommendation error:', error);
      return [];
    }
  }, []);

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
        description: "Workflow saved as template successfully",
        variant: "default"
      });
    } catch (error) {
      console.error('Save template error:', error);
      toast({
        title: "Save Error",
        description: "Failed to save workflow as template",
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
