
import { N8N_NODE_TYPES, DEPRECATED_NODES } from '@/data/n8nNodeReference';

export interface ValidationError {
  type: 'error' | 'warning';
  message: string;
  nodeId?: string;
  suggestion?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export class WorkflowValidator {
  static validateWorkflow(workflow: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Check for deprecated node names
    this.checkDeprecatedNodes(workflow, warnings);
    
    // Validate node connections
    this.validateConnections(workflow, errors);
    
    // Check webhook configurations
    this.validateWebhooks(workflow, errors);
    
    // Validate node parameters
    this.validateNodeParameters(workflow, errors);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private static checkDeprecatedNodes(workflow: any, warnings: ValidationError[]) {
    workflow.nodes?.forEach((node: any) => {
      const displayName = node.name || node.displayName;
      
      if (DEPRECATED_NODES[displayName]) {
        warnings.push({
          type: 'warning',
          message: `Node "${displayName}" is deprecated. Use "${DEPRECATED_NODES[displayName]}" instead.`,
          nodeId: node.id,
          suggestion: `Replace with ${DEPRECATED_NODES[displayName]} node`
        });
      }

      // Check for old node type names
      if (node.type === 'n8n-nodes-base.function') {
        warnings.push({
          type: 'warning',
          message: 'Function node is deprecated. Use Code node instead.',
          nodeId: node.id,
          suggestion: 'Change node type to n8n-nodes-base.code'
        });
      }
    });
  }

  private static validateConnections(workflow: any, errors: ValidationError[]) {
    const nodeIds = new Set(workflow.nodes?.map((node: any) => node.name) || []);
    
    Object.entries(workflow.connections || {}).forEach(([sourceNode, connections]: [string, any]) => {
      if (!nodeIds.has(sourceNode)) {
        errors.push({
          type: 'error',
          message: `Connection source node "${sourceNode}" does not exist`,
          suggestion: 'Remove invalid connection or add missing node'
        });
      }

      connections.main?.forEach((connectionArray: any[], outputIndex: number) => {
        connectionArray.forEach((connection: any) => {
          if (!nodeIds.has(connection.node)) {
            errors.push({
              type: 'error',
              message: `Connection target node "${connection.node}" does not exist`,
              suggestion: 'Remove invalid connection or add missing node'
            });
          }
        });
      });
    });
  }

  private static validateWebhooks(workflow: any, errors: ValidationError[]) {
    const webhookNodes = workflow.nodes?.filter((node: any) => 
      node.type === 'n8n-nodes-base.webhook'
    ) || [];

    webhookNodes.forEach((node: any) => {
      const path = node.parameters?.path;
      
      if (!path || path === '') {
        errors.push({
          type: 'error',
          message: `Webhook node "${node.name}" is missing a path`,
          nodeId: node.id,
          suggestion: 'Add a valid webhook path'
        });
      }

      // Check for invalid characters in webhook path
      if (path && !/^[a-zA-Z0-9\-_\/]*$/.test(path)) {
        errors.push({
          type: 'error',
          message: `Webhook path "${path}" contains invalid characters`,
          nodeId: node.id,
          suggestion: 'Use only letters, numbers, hyphens, underscores, and forward slashes'
        });
      }
    });
  }

  private static validateNodeParameters(workflow: any, errors: ValidationError[]) {
    workflow.nodes?.forEach((node: any) => {
      // Validate HTTP Request nodes
      if (node.type === 'n8n-nodes-base.httpRequest') {
        const url = node.parameters?.url;
        if (!url || url === '') {
          errors.push({
            type: 'error',
            message: `HTTP Request node "${node.name}" is missing a URL`,
            nodeId: node.id,
            suggestion: 'Add a valid URL to the HTTP Request node'
          });
        }
      }

      // Validate Code nodes
      if (node.type === 'n8n-nodes-base.code') {
        const jsCode = node.parameters?.jsCode;
        if (!jsCode || jsCode.trim() === '') {
          errors.push({
            type: 'error',
            message: `Code node "${node.name}" is missing JavaScript code`,
            nodeId: node.id,
            suggestion: 'Add JavaScript code to the Code node'
          });
        }
      }

      // Validate Edit Fields (Set) nodes
      if (node.type === 'n8n-nodes-base.set') {
        const fields = node.parameters?.fields?.values;
        if (!fields || fields.length === 0) {
          errors.push({
            type: 'error',
            message: `Edit Fields node "${node.name}" has no fields configured`,
            nodeId: node.id,
            suggestion: 'Add at least one field to set'
          });
        }
      }
    });
  }

  static fixDeprecatedNodes(workflow: any): any {
    const fixedWorkflow = JSON.parse(JSON.stringify(workflow));
    
    fixedWorkflow.nodes?.forEach((node: any) => {
      // Fix deprecated Function nodes
      if (node.type === 'n8n-nodes-base.function') {
        node.type = 'n8n-nodes-base.code';
        node.typeVersion = 2;
        
        // Convert old function parameters to new code format
        if (node.parameters?.functionCode) {
          node.parameters.jsCode = node.parameters.functionCode;
          delete node.parameters.functionCode;
        }
      }

      // Update node display names
      if (node.name === 'Function') {
        node.name = 'Code';
      }
      if (node.name === 'Set') {
        node.name = 'Edit Fields (Set)';
      }
    });

    return fixedWorkflow;
  }
}
