
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type NodeDefinition = Database['public']['Tables']['node_definitions']['Row'];
type NodeParameter = Database['public']['Tables']['node_parameters']['Row'];
type NodeVersion = Database['public']['Tables']['node_versions']['Row'];

/**
 * Represents a node definition augmented with its parameters and versions.
 */
export interface NodeWithParameters extends NodeDefinition {
  /** An array of parameters associated with this node type. */
  parameters: NodeParameter[];
  /** Latest version information for this node */
  latest_version?: NodeVersion;
}

/**
 * Describes an issue found during workflow or node validation.
 */
export interface ValidationIssue {
  /** The severity of the issue. */
  type: 'error' | 'warning' | 'suggestion';
  /** Optional ID of the node where the issue occurred. */
  nodeId?: string;
  /** Optional name of the node where the issue occurred. */
  nodeName?: string;
  /** A human-readable message describing the issue. */
  message: string;
  /** An optional suggestion on how to fix the issue. */
  suggestion?: string;
  /** Indicates if the issue can potentially be auto-fixed. */
  autoFix?: boolean;
}

/**
 * The result of a workflow validation process.
 */
export interface WorkflowValidationResult {
  /** Overall validity of the workflow (true if no errors). */
  isValid: boolean;
  /** An array of validation issues found. */
  issues: ValidationIssue[];
  /** An optional modernized version of the workflow if auto-fixes were applied. */
  modernizedWorkflow?: any;
}

/**
 * Provides services for managing and validating workflow nodes.
 */
export class NodeService {
  /** Cache for node definitions to reduce database calls. */
  private static nodeDefinitionsCache: Map<string, NodeWithParameters> = new Map();
  /** Duration for which the cache is considered valid (5 minutes). */
  private static cacheExpiry = 5 * 60 * 1000;
  /** Timestamp of the last cache update. */
  private static lastCacheUpdate = 0;

  /**
   * Retrieves all available node definitions, including their parameters.
   */
  static async getNodeDefinitions(): Promise<NodeWithParameters[]> {
    await this.refreshCacheIfNeeded();
    return Array.from(this.nodeDefinitionsCache.values());
  }

  /**
   * Retrieves a specific node definition by its name.
   */
  static async getNodeDefinition(nodeName: string): Promise<NodeWithParameters | null> {
    await this.refreshCacheIfNeeded();
    return this.nodeDefinitionsCache.get(nodeName) || null;
  }

  /**
   * Validates an entire workflow structure.
   */
  static async validateWorkflow(workflow: any): Promise<WorkflowValidationResult> {
    const issues: ValidationIssue[] = [];
    let modernizedWorkflow = JSON.parse(JSON.stringify(workflow));
    
    if (!workflow.nodes) {
      return {
        isValid: false,
        issues: [{ type: 'error', message: 'Workflow must contain nodes array' }]
      };
    }

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

  /**
   * Validates a single node within a workflow.
   */
  static async validateNode(node: any): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    const nodeDefinition = await this.getNodeDefinition(node.type);

    if (!nodeDefinition) {
      issues.push({
        type: 'error',
        nodeId: node.id,
        nodeName: node.name,
        message: `Unknown node type: ${node.type}`
      });
      return issues;
    }

    // Check if it's a known deprecated node type (hardcoded common cases)
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

  /**
   * Validates the parameters of a given node against its definition.
   */
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

  /**
   * Validates a single parameter value against its definition rules.
   */
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

  /**
   * Validates the connections within a workflow.
   */
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

  /**
   * Suggests improvements for a workflow based on common patterns.
   */
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

  /**
   * Attempts to modernize a given node if it's of a deprecated type.
   */
  static async modernizeNode(node: any, nodeDefinition: NodeWithParameters | null): Promise<any | null> {
    if (!nodeDefinition) return null;

    // Handle known deprecated node modernization
    if (node.type === 'n8n-nodes-base.function') {
      const modernNode = { ...node };
      modernNode.type = 'n8n-nodes-base.code';
      modernNode.typeVersion = 2;
      if (node.parameters?.functionCode) {
        modernNode.parameters = { 
          ...node.parameters, 
          jsCode: node.parameters.functionCode, 
          mode: 'runOnceForAllItems' 
        };
        delete modernNode.parameters.functionCode;
      }
      return modernNode;
    }

    return null;
  }

  /**
   * Refreshes the internal cache for node definitions if it's stale.
   */
  static async refreshCacheIfNeeded(): Promise<void> {
    const now = Date.now();
    if (now - this.lastCacheUpdate < this.cacheExpiry && this.nodeDefinitionsCache.size > 0) {
      return;
    }
    await this.loadNodeDefinitions();
    this.lastCacheUpdate = now;
  }

  /**
   * Loads all node definitions and their parameters from the database.
   */
  static async loadNodeDefinitions(): Promise<void> {
    const { data: definitions, error: defError } = await supabase
      .from('node_definitions')
      .select('*')
      .order('display_name');
      
    if (defError) { 
      console.error("Error loading node definitions:", defError); 
      return; 
    }

    const { data: parameters, error: paramError } = await supabase
      .from('node_parameters')
      .select('*');
      
    if (paramError) { 
      console.error("Error loading node parameters:", paramError); 
      return; 
    }

    if (definitions && parameters) {
      this.nodeDefinitionsCache.clear();
      definitions.forEach(definition => {
        const nodeParams = parameters.filter(param => param.node_version_id === definition.id);
        this.nodeDefinitionsCache.set(definition.name, { ...definition, parameters: nodeParams });
      });
    }
  }
}
