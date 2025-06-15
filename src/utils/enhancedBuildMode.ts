
import { DatabaseWorkflowService } from '@/services/databaseWorkflowService';
import { EnhancedWorkflowValidator } from './enhancedWorkflowValidator';
import { WorkflowPatterns } from './workflow/workflowPatterns';
import type { WorkflowData } from '@/types/workflowTypes';

export class EnhancedBuildMode {
  /**
   * Generate intelligent workflow using database-driven node intelligence
   */
  static async generateIntelligentWorkflow(userIntent: string): Promise<{
    workflow: WorkflowData;
    validation: any;
    insights: any;
  }> {
    try {
      console.log('🎯 Enhanced Build Mode: Processing user intent...');
      
      // Step 1: Detect workflow type and patterns
      const workflowType = WorkflowPatterns.detectWorkflowType(userIntent);
      console.log('🔍 Detected workflow type:', workflowType);
      
      // Step 2: Generate workflow using database intelligence
      const result = await DatabaseWorkflowService.generateWorkflow(
        userIntent,
        'temp-user', // TODO: Get from auth context
        undefined // TODO: Pass conversation ID
      );
      
      // Step 3: Enhanced validation with database rules
      const validation = await EnhancedWorkflowValidator.validateWorkflow(
        result.workflow.json,
        {
          checkDeprecatedNodes: true,
          validateParameters: true,
          checkConnections: true,
          performanceAnalysis: true
        }
      );
      
      // Step 4: Generate insights and recommendations
      const insights = await this.generateWorkflowInsights(
        result.workflow,
        validation,
        workflowType
      );
      
      console.log('✅ Enhanced workflow generation complete');
      
      return {
        workflow: result.workflow,
        validation,
        insights
      };
    } catch (error) {
      console.error('❌ Enhanced build mode failed:', error);
      
      // Fallback to basic workflow generation
      return this.generateFallbackWorkflow(userIntent);
    }
  }

  /**
   * Generate insights about the workflow using database patterns
   */
  private static async generateWorkflowInsights(
    workflow: WorkflowData,
    validation: any,
    workflowType: string
  ): Promise<any> {
    try {
      // Get similar patterns from database
      const patterns = await DatabaseWorkflowService.getWorkflowPatterns();
      
      const insights = {
        complexity: this.calculateComplexity(workflow),
        estimatedExecutionTime: this.estimateExecutionTime(workflow),
        recommendations: this.generateRecommendations(workflow, validation, patterns),
        workflowType,
        nodeCount: workflow.nodes.length,
        connectionCount: workflow.connections.length,
        patterns: patterns.slice(0, 3) // Top 3 relevant patterns
      };
      
      return insights;
    } catch (error) {
      console.error('❌ Failed to generate insights:', error);
      return {
        complexity: 'unknown',
        estimatedExecutionTime: 'unknown',
        recommendations: [],
        workflowType,
        nodeCount: workflow.nodes.length,
        connectionCount: workflow.connections.length,
        patterns: []
      };
    }
  }

  /**
   * Calculate workflow complexity score
   */
  private static calculateComplexity(workflow: WorkflowData): string {
    const nodeCount = workflow.nodes.length;
    const connectionCount = workflow.connections.length;
    
    const complexityScore = nodeCount + (connectionCount * 0.5);
    
    if (complexityScore <= 3) return 'Simple';
    if (complexityScore <= 8) return 'Moderate';
    if (complexityScore <= 15) return 'Complex';
    return 'Very Complex';
  }

  /**
   * Estimate workflow execution time
   */
  private static estimateExecutionTime(workflow: WorkflowData): string {
    const nodeTypes = workflow.nodes.map(node => node.type);
    
    // Basic estimation based on node types
    let timeEstimate = 0;
    
    nodeTypes.forEach(type => {
      switch (type) {
        case 'n8n-nodes-base.httpRequest':
          timeEstimate += 2000; // 2 seconds for HTTP requests
          break;
        case 'n8n-nodes-base.code':
          timeEstimate += 500; // 0.5 seconds for code execution
          break;
        case 'n8n-nodes-base.webhook':
          timeEstimate += 100; // 0.1 seconds for webhook
          break;
        default:
          timeEstimate += 300; // 0.3 seconds default
      }
    });
    
    if (timeEstimate < 1000) return '< 1 second';
    if (timeEstimate < 5000) return '1-5 seconds';
    if (timeEstimate < 15000) return '5-15 seconds';
    return '> 15 seconds';
  }

  /**
   * Generate recommendations based on validation and patterns
   */
  private static generateRecommendations(
    workflow: WorkflowData,
    validation: any,
    patterns: any[]
  ): string[] {
    const recommendations: string[] = [];
    
    // Add validation-based recommendations
    if (validation.issues?.length > 0) {
      recommendations.push('Fix validation issues to improve reliability');
    }
    
    // Add pattern-based recommendations
    if (patterns.length > 0) {
      recommendations.push('Consider using popular node combinations for better performance');
    }
    
    // Add complexity-based recommendations
    if (workflow.nodes.length > 10) {
      recommendations.push('Consider breaking this into smaller workflows for easier maintenance');
    }
    
    // Add default recommendations
    if (recommendations.length === 0) {
      recommendations.push('Workflow looks good! Test thoroughly before deployment.');
    }
    
    return recommendations;
  }

  /**
   * Fallback workflow generation when database fails
   */
  private static async generateFallbackWorkflow(userIntent: string): Promise<{
    workflow: WorkflowData;
    validation: any;
    insights: any;
  }> {
    // Generate a simple webhook -> code -> response workflow
    const workflow: WorkflowData = {
      id: Date.now(),
      name: `Generated Workflow - ${new Date().toLocaleDateString()}`,
      description: `Workflow generated from: "${userIntent}"`,
      nodes: [
        {
          id: '1',
          name: 'Webhook',
          type: 'n8n-nodes-base.webhook',
          position: [100, 100]
        },
        {
          id: '2',
          name: 'Process Data',
          type: 'n8n-nodes-base.code',
          position: [300, 100]
        }
      ],
      connections: [
        { from: '1', to: '2' }
      ],
      json: {
        name: `Generated Workflow - ${new Date().toLocaleDateString()}`,
        nodes: [],
        connections: {}
      }
    };
    
    return {
      workflow,
      validation: { isValid: true, issues: [] },
      insights: {
        complexity: 'Simple',
        estimatedExecutionTime: '< 1 second',
        recommendations: ['This is a basic fallback workflow'],
        workflowType: 'unknown',
        nodeCount: 2,
        connectionCount: 1,
        patterns: []
      }
    };
  }
}
