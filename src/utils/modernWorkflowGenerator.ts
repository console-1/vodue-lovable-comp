
import { NodeIntelligenceService } from '@/services/nodeIntelligenceService';
import { EnhancedWorkflowValidator } from './enhancedWorkflowValidator';
import { WebhookWorkflowGenerator } from './workflow/webhookWorkflowGenerator';
import { DataProcessingWorkflowGenerator } from './workflow/dataProcessingWorkflowGenerator';
import { ConditionalWorkflowGenerator } from './workflow/conditionalWorkflowGenerator';
import { ScheduledWorkflowGenerator } from './workflow/scheduledWorkflowGenerator';
import { BasicWorkflowGenerator } from './workflow/basicWorkflowGenerator';
import type { Database } from '@/integrations/supabase/types';

type NodeDefinition = Database['public']['Tables']['node_definitions']['Row'];

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
    
    // Generate workflow structure based on description and recommendations
    const workflow = await this.analyzeAndGenerate(description, recommendedNodes);
    
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

  private static async analyzeAndGenerate(description: string, recommendedNodes: NodeDefinition[]): Promise<Omit<GeneratedWorkflow, 'validationResult' | 'recommendations'>> {
    const lowerDesc = description.toLowerCase();
    
    // Determine workflow type and delegate to appropriate generator
    if (this.isWebhookWorkflow(lowerDesc)) {
      return WebhookWorkflowGenerator.generate(description, recommendedNodes);
    } else if (this.isScheduledWorkflow(lowerDesc)) {
      return ScheduledWorkflowGenerator.generate(description, recommendedNodes);
    } else if (this.isConditionalWorkflow(lowerDesc)) {
      return ConditionalWorkflowGenerator.generate(description, recommendedNodes);
    } else if (this.isDataProcessingWorkflow(lowerDesc)) {
      return DataProcessingWorkflowGenerator.generate(description, recommendedNodes);
    } else {
      return BasicWorkflowGenerator.generate(description, recommendedNodes);
    }
  }

  private static isWebhookWorkflow(description: string): boolean {
    return /webhook|api|receive|endpoint|trigger/i.test(description);
  }

  private static isScheduledWorkflow(description: string): boolean {
    return /schedule|cron|timer|daily|hourly|periodic/i.test(description);
  }

  private static isConditionalWorkflow(description: string): boolean {
    return /condition|if|when|check|validate|filter/i.test(description);
  }

  private static isDataProcessingWorkflow(description: string): boolean {
    return /process|transform|convert|format|parse|extract/i.test(description);
  }
}
