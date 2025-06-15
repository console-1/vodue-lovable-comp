
import { NodeIntelligenceService } from '@/services/nodeIntelligenceService';
import { EnhancedWorkflowValidator } from './enhancedWorkflowValidator';
import { WorkflowPatterns } from './workflow/workflowPatterns';
import { WorkflowTypeDetector } from './workflow/workflowTypeDetector';

export interface GeneratedWorkflow {
  id: number;
  name: string;
  description: string;
  nodes: any[];
  connections: any;
  json: any;
  validationResult?: any;
  recommendations?: string[];
}

export class ModernWorkflowGenerator {
  static async generateWorkflow(description: string): Promise<GeneratedWorkflow> {
    console.log('Generating workflow for:', description);
    
    // Get node recommendations first
    const recommendedNodes = await NodeIntelligenceService.getIntelligentRecommendations(description);
    console.log('Recommended nodes:', recommendedNodes);
    
    // Determine workflow type and generate appropriate structure
    const workflowType = WorkflowTypeDetector.analyzeWorkflowType(description);
    const workflow = this.generateWorkflowByType(description, workflowType);
    
    // Validate the generated workflow
    const validationResult = await EnhancedWorkflowValidator.validateWorkflowComprehensive(workflow.json);
    
    // Auto-fix if needed
    if (!validationResult.isValid) {
      const { fixed } = await EnhancedWorkflowValidator.autoFixWorkflow(workflow.json);
      workflow.json = fixed;
    }
    
    return {
      ...workflow,
      validationResult,
      recommendations: validationResult.recommendations
    };
  }

  private static generateWorkflowByType(description: string, workflowType: string): Omit<GeneratedWorkflow, 'validationResult' | 'recommendations'> {
    switch (workflowType) {
      case 'webhook':
        return WorkflowPatterns.generateWebhookWorkflow(description);
      case 'scheduled':
        return WorkflowPatterns.generateScheduledWorkflow(description);
      case 'conditional':
        return WorkflowPatterns.generateConditionalWorkflow(description);
      case 'dataProcessing':
        return WorkflowPatterns.generateDataProcessingWorkflow(description);
      default:
        return WorkflowPatterns.generateBasicWorkflow(description);
    }
  }
}
