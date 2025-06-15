
import { supabase } from '@/integrations/supabase/client';
import type { NodeWithParameters, NodeParameter, ValidationIssue, WorkflowValidationResult } from '@/types/nodeTypes';

export class NodeValidationService {
  static async validateWorkflow(workflow: any): Promise<WorkflowValidationResult> {
    const issues: ValidationIssue[] = [];
    let modernizedWorkflow = JSON.parse(JSON.stringify(workflow));
    
    if (!workflow.nodes) {
      return {
        isValid: false,
        issues: [{ type: 'error', message: 'Workflow must contain nodes array' }]
      };
    }

    const { NodeCacheService } = await import('./nodeCacheService');
    
    for (const node of workflow.nodes) {
      const nodeIssues = await this.validateNode(node);
      issues.push(...nodeIssues);
    }

    const connectionIssues = this.validateConnections(workflow);
    issues.push(...connectionIssues);

    const suggestions = await this.suggestImprovements(workflow);
    issues.push(...suggestions);

    return {
      isValid: issues.filter(issue => issue.type === 'error').length === 0,
      issues,
      modernizedWorkflow: issues.some(issue => issue.autoFix) ? modernizedWorkflow : undefined
    };
  }

  static async validateNode(node: any): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    const { NodeCacheService } = await import('./nodeCacheService');
    const nodeDefinition = await NodeCacheService.getNodeDefinition(node.type);

    if (!nodeDefinition) {
      issues.push({
        type: 'error',
        nodeId: node.id,
        nodeName: node.name,
        message: `Unknown node type: ${node.type}`
      });
      return issues;
    }

    if (node.type === 'n8n-nodes-base.function') {
      issues.push({
        type: 'warning',
        nodeId: node.id,
        nodeName: node.name,
        message: `Node "${node.name}" uses deprecated type "n8n-nodes-base.function". Consider upgrading to "n8n-nodes-base.code".`,
        suggestion: 'Replace with n8n-nodes-base.code',
        autoFix: true
      });
    }

    const parameterIssues = await this.validateNodeParameters(node, nodeDefinition);
    issues.push(...parameterIssues);

    return issues;
  }

  static async validateNodeParameters(node: any, nodeDefinition: NodeWithParameters): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    const nodeParams = node.parameters || {};

    for (const paramDef of nodeDefinition.parameters) {
      if (paramDef.required && (nodeParams[paramDef.name] === undefined || nodeParams[paramDef.name] === '')) {
        issues.push({
          type: 'error',
          nodeId: node.id,
          nodeName: node.name,
          message: `Missing required parameter "${paramDef.name}" in node "${node.name}"`,
          suggestion: `Add value for ${paramDef.name}: ${paramDef.description || 'No description available'}`
        });
      }

      if (nodeParams[paramDef.name] !== undefined) {
        const validationResult = this.validateParameterValue(
          nodeParams[paramDef.name],
          paramDef
        );
        
        if (!validationResult.isValid) {
          issues.push({
            type: 'error',
            nodeId: node.id,
            nodeName: node.name,
            message: `Invalid value for parameter "${paramDef.name}": ${validationResult.message}`,
            suggestion: validationResult.suggestion
          });
        }
      }
    }
    return issues;
  }

  static validateParameterValue(value: any, parameter: NodeParameter): { isValid: boolean; message?: string; suggestion?: string } {
    const rules = parameter.validation as any || {};
    
    switch (parameter.type) {
      case 'string':
        if (typeof value !== 'string') {
          return { isValid: false, message: 'Expected string value', suggestion: 'Provide a text value' };
        }
        if (rules.minLength && value.length < rules.minLength) {
          return { isValid: false, message: `Minimum length is ${rules.minLength}`, suggestion: `Provide at least ${rules.minLength} characters` };
        }
        break;
      case 'number':
        if (typeof value !== 'number') {
          return { isValid: false, message: 'Expected numeric value', suggestion: 'Provide a number' };
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          return { isValid: false, message: 'Expected boolean value', suggestion: 'Use true or false' };
        }
        break;
      case 'options':
        const options = (parameter.options as any) || [];
        if (Array.isArray(options) && !options.includes(value)) {
          return { 
            isValid: false, 
            message: `Invalid option "${value}"`, 
            suggestion: `Choose from available options` 
          };
        }
        break;
    }
    return { isValid: true };
  }

  static validateConnections(workflow: any): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const nodeNames = new Set(workflow.nodes?.map((node: any) => node.name) || []);
    
    Object.entries(workflow.connections || {}).forEach(([sourceNode, connections]: [string, any]) => {
      if (!nodeNames.has(sourceNode)) {
        issues.push({
          type: 'error',
          message: `Connection source node "${sourceNode}" does not exist`,
          suggestion: 'Remove invalid connection or add missing node'
        });
      }

      connections.main?.forEach((connectionArray: any[]) => {
        connectionArray.forEach((connection: any) => {
          if (!nodeNames.has(connection.node)) {
            issues.push({
              type: 'error',
              message: `Connection target node "${connection.node}" does not exist`,
              suggestion: 'Remove invalid connection or add missing node'
            });
          }
        });
      });
    });
    return issues;
  }

  static async suggestImprovements(workflow: any): Promise<ValidationIssue[]> {
    const suggestions: ValidationIssue[] = [];
    const nodes = workflow.nodes || [];
    
    const setNodeCount = nodes.filter((node: any) => node.type === 'n8n-nodes-base.set').length;
    if (setNodeCount > 3) {
      suggestions.push({
        type: 'suggestion',
        message: 'Consider using a Code node instead of multiple Set nodes for better performance.',
        suggestion: 'Combine multiple field operations into a single Code node.'
      });
    }

    const hasHttpRequest = nodes.some((node: any) => node.type === 'n8n-nodes-base.httpRequest');
    const hasErrorHandling = nodes.some((node: any) => node.type === 'n8n-nodes-base.if');
    
    if (hasHttpRequest && !hasErrorHandling) {
      suggestions.push({
        type: 'suggestion',
        message: 'Consider adding error handling for HTTP requests.',
        suggestion: 'Add If or Switch nodes to handle potential API failures gracefully.'
      });
    }
    
    return suggestions;
  }
}
