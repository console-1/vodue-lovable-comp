
import { NodeService, type ValidationIssue, type WorkflowValidationResult } from '@/services/nodeService';

export interface EnhancedValidationResult extends WorkflowValidationResult {
  performanceScore: number;
  securityScore: number;
  maintainabilityScore: number;
  recommendations: string[];
}

export class EnhancedWorkflowValidator {
  static async validateWorkflowComprehensive(workflow: any): Promise<EnhancedValidationResult> {
    // Get basic validation
    const baseValidation = await NodeService.validateWorkflow(workflow);
    
    // Calculate performance score
    const performanceScore = this.calculatePerformanceScore(workflow);
    
    // Calculate security score
    const securityScore = this.calculateSecurityScore(workflow);
    
    // Calculate maintainability score
    const maintainabilityScore = this.calculateMaintainabilityScore(workflow);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(workflow, baseValidation.issues);
    
    return {
      ...baseValidation,
      performanceScore,
      securityScore,
      maintainabilityScore,
      recommendations
    };
  }

  private static calculatePerformanceScore(workflow: any): number {
    let score = 100;
    const nodes = workflow.nodes || [];
    
    // Penalize excessive HTTP requests without caching
    const httpNodes = nodes.filter((node: any) => node.type === 'n8n-nodes-base.httpRequest');
    if (httpNodes.length > 5) {
      score -= (httpNodes.length - 5) * 10;
    }
    
    // Penalize excessive Set nodes (suggest Code node instead)
    const setNodes = nodes.filter((node: any) => node.type === 'n8n-nodes-base.set');
    if (setNodes.length > 3) {
      score -= (setNodes.length - 3) * 5;
    }
    
    // Reward efficient patterns
    const codeNodes = nodes.filter((node: any) => node.type === 'n8n-nodes-base.code');
    if (codeNodes.length > 0 && setNodes.length <= 2) {
      score += 10; // Efficient data processing
    }
    
    return Math.max(0, Math.min(100, score));
  }

  private static calculateSecurityScore(workflow: any): number {
    let score = 100;
    const nodes = workflow.nodes || [];
    
    // Check for hardcoded credentials
    nodes.forEach((node: any) => {
      const params = JSON.stringify(node.parameters || {});
      if (params.includes('password') || params.includes('token') || params.includes('key')) {
        // Check if it looks like hardcoded credentials
        if (!/\{\{|\$/.test(params)) {
          score -= 20; // Likely hardcoded credentials
        }
      }
    });
    
    // Check for HTTP requests without authentication
    const httpNodes = nodes.filter((node: any) => 
      node.type === 'n8n-nodes-base.httpRequest' && 
      (!node.parameters?.authentication || node.parameters.authentication === 'none')
    );
    
    if (httpNodes.length > 0) {
      score -= httpNodes.length * 5; // Unsecured HTTP requests
    }
    
    // Check webhook security
    const webhookNodes = nodes.filter((node: any) => 
      node.type === 'n8n-nodes-base.webhook' &&
      (!node.parameters?.options?.allowedOrigins)
    );
    
    if (webhookNodes.length > 0) {
      score -= webhookNodes.length * 10; // Unrestricted webhooks
    }
    
    return Math.max(0, Math.min(100, score));
  }

  private static calculateMaintainabilityScore(workflow: any): number {
    let score = 100;
    const nodes = workflow.nodes || [];
    
    // Check for proper node naming
    const defaultNamedNodes = nodes.filter((node: any) => 
      node.name === node.type?.split('.').pop() || 
      /^(Node|Untitled)/.test(node.name)
    );
    
    if (defaultNamedNodes.length > 0) {
      score -= defaultNamedNodes.length * 5; // Poor naming
    }
    
    // Check workflow complexity
    if (nodes.length > 20) {
      score -= (nodes.length - 20) * 2; // Overly complex
    }
    
    // Check for error handling
    const hasErrorHandling = nodes.some((node: any) => 
      node.type === 'n8n-nodes-base.if' && 
      JSON.stringify(node.parameters).includes('error')
    );
    
    if (!hasErrorHandling && nodes.some((node: any) => node.type === 'n8n-nodes-base.httpRequest')) {
      score -= 15; // No error handling for HTTP requests
    }
    
    // Reward good practices
    const hasCodeComments = nodes.some((node: any) => 
      node.type === 'n8n-nodes-base.code' &&
      node.parameters?.jsCode?.includes('//')
    );
    
    if (hasCodeComments) {
      score += 10; // Good documentation
    }
    
    return Math.max(0, Math.min(100, score));
  }

  private static generateRecommendations(workflow: any, issues: ValidationIssue[]): string[] {
    const recommendations: string[] = [];
    const nodes = workflow.nodes || [];
    
    // Performance recommendations
    const setNodes = nodes.filter((node: any) => node.type === 'n8n-nodes-base.set');
    if (setNodes.length > 3) {
      recommendations.push('Consider consolidating multiple Set nodes into a single Code node for better performance');
    }
    
    // Security recommendations
    const httpNodes = nodes.filter((node: any) => node.type === 'n8n-nodes-base.httpRequest');
    if (httpNodes.some((node: any) => !node.parameters?.authentication || node.parameters.authentication === 'none')) {
      recommendations.push('Add proper authentication to HTTP Request nodes for security');
    }
    
    // Error handling recommendations
    if (httpNodes.length > 0 && !nodes.some((node: any) => node.type === 'n8n-nodes-base.if')) {
      recommendations.push('Add error handling with If nodes to make your workflow more robust');
    }
    
    // Maintainability recommendations
    const defaultNamedNodes = nodes.filter((node: any) => 
      node.name === node.type?.split('.').pop() || 
      /^(Node|Untitled)/.test(node.name)
    );
    
    if (defaultNamedNodes.length > 0) {
      recommendations.push('Rename nodes with descriptive names to improve workflow readability');
    }
    
    // Add issue-based recommendations
    const deprecatedIssues = issues.filter(issue => issue.type === 'warning' && issue.autoFix);
    if (deprecatedIssues.length > 0) {
      recommendations.push('Update deprecated nodes to their modern equivalents for better compatibility');
    }
    
    return recommendations;
  }

  static async autoFixWorkflow(workflow: any): Promise<{ fixed: any; changes: string[] }> {
    const changes: string[] = [];
    const fixedWorkflow = JSON.parse(JSON.stringify(workflow));
    
    if (!fixedWorkflow.nodes) {
      return { fixed: fixedWorkflow, changes };
    }
    
    // Fix deprecated nodes
    for (let i = 0; i < fixedWorkflow.nodes.length; i++) {
      const node = fixedWorkflow.nodes[i];
      
      if (node.type === 'n8n-nodes-base.function') {
        // Convert Function node to Code node
        fixedWorkflow.nodes[i] = {
          ...node,
          type: 'n8n-nodes-base.code',
          typeVersion: 2,
          parameters: {
            ...node.parameters,
            jsCode: node.parameters?.functionCode || '// Add your code here',
            mode: 'runOnceForAllItems'
          }
        };
        
        delete fixedWorkflow.nodes[i].parameters.functionCode;
        changes.push(`Converted Function node "${node.name}" to Code node`);
      }
      
      // Fix Set node names
      if (node.type === 'n8n-nodes-base.set' && node.name === 'Set') {
        fixedWorkflow.nodes[i].name = 'Edit Fields (Set)';
        changes.push(`Updated Set node name to "Edit Fields (Set)"`);
      }
    }
    
    return { fixed: fixedWorkflow, changes };
  }
}
