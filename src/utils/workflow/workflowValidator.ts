
export class WorkflowQualityControl {
  /**
   * Layer 3: Quality Control - Comprehensive Validation
   * Validates and optimizes the generated workflow
   */
  static async validateAndOptimize(workflow: any): Promise<{
    isValid: boolean;
    optimizations: string[];
    warnings: string[];
    complexity: number;
  }> {
    console.log('🔍 Quality Control Layer: Validating workflow');
    
    const warnings = [];
    const optimizations = [];
    
    // Calculate complexity using local implementation
    const complexity = await this.calculateComplexityLocal(workflow.json);
    
    // Validate node configurations
    const nodeValidation = await this.validateNodes(workflow.nodes);
    warnings.push(...nodeValidation.warnings);
    
    // Check for optimization opportunities
    const optimizationSuggestions = await this.suggestOptimizations(workflow);
    optimizations.push(...optimizationSuggestions);
    
    // Validate connections
    const connectionValidation = this.validateConnections(workflow.connections);
    warnings.push(...connectionValidation);
    
    return {
      isValid: warnings.filter(w => w.includes('Error')).length === 0,
      optimizations,
      warnings,
      complexity
    };
  }

  private static async calculateComplexityLocal(workflowJson: any): Promise<number> {
    try {
      const nodeCount = workflowJson.nodes?.length || 0;
      const connectionCount = Object.keys(workflowJson.connections || {}).length;
      
      const baseComplexity = nodeCount + (connectionCount * 0.5);
      return Math.min(10, Math.max(1, Math.round(baseComplexity)));
    } catch (error) {
      console.error('Error calculating complexity:', error);
      return 1;
    }
  }

  private static async validateNodes(nodes: any[]): Promise<{ warnings: string[] }> {
    const warnings = [];
    
    for (const node of nodes) {
      if (node.type === 'n8n-nodes-base.httpRequest' && !node.parameters?.url) {
        warnings.push(`Warning: HTTP Request node "${node.name}" missing URL parameter`);
      }
      
      if (node.type === 'n8n-nodes-base.code' && !node.parameters?.jsCode) {
        warnings.push(`Warning: Code node "${node.name}" missing JavaScript code`);
      }
    }
    
    return { warnings };
  }

  private static async suggestOptimizations(workflow: any): Promise<string[]> {
    const optimizations = [];
    
    const nodeCount = workflow.nodes?.length || 0;
    
    if (nodeCount > 5) {
      optimizations.push('Consider breaking this into smaller, focused workflows');
    }
    
    const httpNodes = workflow.nodes?.filter(n => n.type === 'n8n-nodes-base.httpRequest') || [];
    if (httpNodes.length > 3) {
      optimizations.push('Multiple HTTP requests detected - consider batching or caching');
    }
    
    return optimizations;
  }

  private static validateConnections(connections: any): string[] {
    const warnings = [];
    
    for (const [sourceName, connection] of Object.entries(connections)) {
      if (!connection || typeof connection !== 'object') {
        warnings.push(`Warning: Invalid connection from node "${sourceName}"`);
      }
    }
    
    return warnings;
  }
}
