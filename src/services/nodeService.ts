import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type NodeDefinition = Database['public']['Tables']['node_definitions']['Row'];
type NodeParameter = Database['public']['Tables']['node_parameters']['Row'];
type WorkflowTemplate = Database['public']['Tables']['workflow_templates']['Row'];

/**
 * Represents a node definition augmented with its parameters.
 * Extends a standard NodeDefinition.
 */
export interface NodeWithParameters extends NodeDefinition {
  /** An array of parameters associated with this node type. */
  parameters: NodeParameter[];
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
 * Provides services for managing and validating workflow nodes and templates.
 * This includes fetching node definitions, validating workflows, and modernizing nodes.
 */
export class NodeService {
  /** Cache for node definitions to reduce database calls. Maps node_type to NodeWithParameters. */
  private static nodeDefinitionsCache: Map<string, NodeWithParameters> = new Map();
  /** Cache for workflow templates. */
  private static templateCache: WorkflowTemplate[] = [];
  /** Duration for which the cache is considered valid (5 minutes). */
  private static cacheExpiry = 5 * 60 * 1000;
  /** Timestamp of the last cache update. */
  private static lastCacheUpdate = 0;

  /**
   * Retrieves all available node definitions, including their parameters.
   * Uses a cache that refreshes if stale.
   * @returns {Promise<NodeWithParameters[]>} A promise that resolves to an array of all node definitions.
   */
  static async getNodeDefinitions(): Promise<NodeWithParameters[]> {
    await this.refreshCacheIfNeeded();
    return Array.from(this.nodeDefinitionsCache.values());
  }

  /**
   * Retrieves a specific node definition by its type.
   * Uses a cache that refreshes if stale.
   * @param {string} nodeType - The type of the node to retrieve (e.g., "n8n-nodes-base.if").
   * @returns {Promise<NodeWithParameters | null>} A promise that resolves to the node definition or null if not found.
   */
  static async getNodeDefinition(nodeType: string): Promise<NodeWithParameters | null> {
    await this.refreshCacheIfNeeded();
    return this.nodeDefinitionsCache.get(nodeType) || null;
  }

  /**
   * Retrieves workflow templates, optionally filtered by category.
   * Uses a cache that refreshes if stale.
   * @param {string} [category] - Optional category to filter templates by.
   * @returns {Promise<WorkflowTemplate[]>} A promise that resolves to an array of workflow templates.
   */
  static async getWorkflowTemplates(category?: string): Promise<WorkflowTemplate[]> {
    await this.refreshCacheIfNeeded();
    
    if (category) {
      return this.templateCache.filter(template => template.category === category);
    }
    
    return this.templateCache;
  }

  /**
   * Validates an entire workflow structure.
   * This includes validating individual nodes, their parameters, and connections.
   * It can also attempt to auto-fix certain issues, like deprecated nodes.
   * @param {any} workflow - The workflow object to validate.
   * @returns {Promise<WorkflowValidationResult>} A promise that resolves to the validation result.
   */
  static async validateWorkflow(workflow: any): Promise<WorkflowValidationResult> {
    const issues: ValidationIssue[] = [];
    let modernizedWorkflow = JSON.parse(JSON.stringify(workflow)); // Deep copy for potential modifications
    
    if (!workflow.nodes) {
      return {
        isValid: false,
        issues: [{ type: 'error', message: 'Workflow must contain nodes array' }]
      };
    }

    for (const node of workflow.nodes) {
      const nodeIssues = await this.validateNode(node);
      issues.push(...nodeIssues);
      
      if (nodeIssues.some(issue => issue.type === 'warning' && issue.autoFix)) {
        const nodeDefinition = await this.getNodeDefinition(node.type);
        if (nodeDefinition) {
          const modernizedNode = await this.modernizeNode(node, nodeDefinition);
          if (modernizedNode) {
            const nodeIndex = modernizedWorkflow.nodes.findIndex((n: any) => n.name === node.name);
            if (nodeIndex !== -1) {
              modernizedWorkflow.nodes[nodeIndex] = modernizedNode;
            }
          }
        }
      }
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
   * Checks for unknown node types, deprecation status, and parameter validity.
   * @param {any} node - The node object to validate.
   * @returns {Promise<ValidationIssue[]>} A promise that resolves to an array of validation issues for the node.
   */
  static async validateNode(node: any): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    const nodeDefinition = await this.getNodeDefinition(node.type);

    if (!nodeDefinition) {
      const deprecatedNode = await this.findDeprecatedNode(node.type, node.name);
      if (deprecatedNode && deprecatedNode.replaced_by) {
        issues.push({
          type: 'warning',
          nodeId: node.id,
          nodeName: node.name,
          message: `Node "${node.name}" uses deprecated type "${node.type}". Consider upgrading to "${deprecatedNode.replaced_by}".`,
          suggestion: `Replace with ${deprecatedNode.replaced_by}`,
          autoFix: true
        });
      } else {
        issues.push({
          type: 'error',
          nodeId: node.id,
          nodeName: node.name,
          message: `Unknown node type: ${node.type}`
        });
      }
      return issues;
    }

    if (nodeDefinition.deprecated) {
      issues.push({
        type: 'warning',
        nodeId: node.id,
        nodeName: node.name,
        message: `Node "${node.name}" is deprecated. ${nodeDefinition.replaced_by ? `Use "${nodeDefinition.replaced_by}" instead.` : 'Consider finding an alternative.'}`,
        suggestion: nodeDefinition.replaced_by || 'Update to modern equivalent',
        autoFix: !!nodeDefinition.replaced_by
      });
    }

    const parameterIssues = await this.validateNodeParameters(node, nodeDefinition);
    issues.push(...parameterIssues);

    return issues;
  }

  /**
   * Validates the parameters of a given node against its definition.
   * Checks for required parameters and validates types and rules for provided parameters.
   * @param {any} node - The node object whose parameters are to be validated.
   * @param {NodeWithParameters} nodeDefinition - The definition of the node, including expected parameters.
   * @returns {Promise<ValidationIssue[]>} A promise that resolves to an array of parameter validation issues.
   */
  static async validateNodeParameters(node: any, nodeDefinition: NodeWithParameters): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    const nodeParams = node.parameters || {};

    for (const paramDef of nodeDefinition.parameters) {
      if (paramDef.required && (nodeParams[paramDef.parameter_name] === undefined || nodeParams[paramDef.parameter_name] === '')) {
        issues.push({
          type: 'error',
          nodeId: node.id,
          nodeName: node.name,
          message: `Missing required parameter "${paramDef.parameter_name}" in node "${node.name}"`,
          suggestion: `Add value for ${paramDef.parameter_name}: ${paramDef.description}`
        });
      }

      if (nodeParams[paramDef.parameter_name] !== undefined) {
        const validationResult = this.validateParameterValue(
          nodeParams[paramDef.parameter_name],
          paramDef
        );
        
        if (!validationResult.isValid) {
          issues.push({
            type: 'error',
            nodeId: node.id,
            nodeName: node.name,
            message: `Invalid value for parameter "${paramDef.parameter_name}": ${validationResult.message}`,
            suggestion: validationResult.suggestion
          });
        }
      }
    }
    return issues;
  }

  /**
   * Validates a single parameter value against its definition rules.
   * @param {any} value - The value of the parameter to validate.
   * @param {NodeParameter} parameter - The definition of the parameter, including type and validation rules.
   * @returns {{isValid: boolean; message?: string; suggestion?: string}} An object indicating validity and optional messages.
   */
  static validateParameterValue(value: any, parameter: NodeParameter): { isValid: boolean; message?: string; suggestion?: string } {
    const rules = parameter.validation_rules as any || {};
    
    switch (parameter.parameter_type) {
      case 'string':
        if (typeof value !== 'string') {
          return { isValid: false, message: 'Expected string value', suggestion: 'Provide a text value' };
        }
        if (rules.minLength && value.length < rules.minLength) {
          return { isValid: false, message: `Minimum length is ${rules.minLength}`, suggestion: `Provide at least ${rules.minLength} characters` };
        }
        if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
          return { isValid: false, message: 'Value does not match required pattern', suggestion: 'Check the format requirements' };
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
        const options = (parameter.options as any)?.options || [];
        if (!options.includes(value)) {
          return { 
            isValid: false, 
            message: `Invalid option "${value}"`, 
            suggestion: `Choose from: ${options.join(', ')}` 
          };
        }
        break;
      default:
        return { isValid: false, message: 'Unknown parameter type', suggestion: 'Ensure the parameter type is correctly defined in the node definition.' };
    }
    return { isValid: true };
  }

  /**
   * Validates the connections within a workflow.
   * Checks if source and target nodes for connections exist.
   * @param {any} workflow - The workflow object, containing nodes and connections.
   * @returns {ValidationIssue[]} An array of connection validation issues.
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
   * Suggests improvements for a workflow based on common patterns and best practices.
   * @param {any} workflow - The workflow object to analyze.
   * @returns {Promise<ValidationIssue[]>} A promise that resolves to an array of suggested improvements.
   */
  static async suggestImprovements(workflow: any): Promise<ValidationIssue[]> {
    const suggestions: ValidationIssue[] = [];
    const nodes = workflow.nodes || [];
    
    if (nodes.filter((node: any) => node.type === 'n8n-nodes-base.set').length > 3) {
      suggestions.push({
        type: 'suggestion',
        message: 'Consider using a Code node instead of multiple Set nodes for better performance and readability.',
        suggestion: 'Combine multiple field operations into a single Code node.'
      });
    }

    if (nodes.some((node: any) => node.type === 'n8n-nodes-base.httpRequest') && !nodes.some((node: any) => node.type === 'n8n-nodes-base.if')) {
      suggestions.push({
        type: 'suggestion',
        message: 'Consider adding error handling for HTTP requests using If or Try/Catch nodes.',
        suggestion: 'Add If or Try/Catch nodes to handle potential API failures gracefully.'
      });
    }
    return suggestions;
  }

  /**
   * Attempts to modernize a given node if it's of a deprecated type that has a known replacement.
   * Handles specific cases like 'n8n-nodes-base.function' to 'n8n-nodes-base.code'
   * and generic cases where `deprecated` and `replaced_by` are set in the node definition.
   * @param {any} node - The node object to potentially modernize.
   * @param {NodeWithParameters | null} nodeDefinition - The definition of the node.
   * @returns {Promise<any | null>} A promise that resolves to the modernized node object or null if no modernization occurred.
   */
  static async modernizeNode(node: any, nodeDefinition: NodeWithParameters | null): Promise<any | null> {
    if (!nodeDefinition) return null;

    if (node.type === 'n8n-nodes-base.function' && nodeDefinition.node_type === 'n8n-nodes-base.function') {
      const modernNode = { ...node };
      modernNode.type = 'n8n-nodes-base.code';
      modernNode.typeVersion = 2;
      if (node.parameters?.functionCode) {
        modernNode.parameters = { ...node.parameters, jsCode: node.parameters.functionCode, mode: 'runOnceForAllItems' };
        delete modernNode.parameters.functionCode;
      }
      return modernNode;
    }

    if (nodeDefinition.deprecated && nodeDefinition.replaced_by) {
      const modernNode = { ...node };
      modernNode.type = nodeDefinition.replaced_by;
      delete modernNode.typeVersion;
      return modernNode;
    }
    return null;
  }

  /**
   * Finds a deprecated node definition by its type.
   * This is used when a node type is not found in the main cache, to check if it's a known deprecated type.
   * @param {string} nodeType - The type of the node to find.
   * @param {string} [nodeName] - Optional name of the node, for context (not used in query).
   * @returns {Promise<NodeDefinition | null>} A promise that resolves to the deprecated node definition or null.
   * @private
   */
  static async findDeprecatedNode(nodeType: string, nodeName?: string): Promise<NodeDefinition | null> {
    // nodeName is not used in the query but kept for signature consistency or future use.
    const { data } = await supabase
      .from('node_definitions')
      .select('*')
      .eq('node_type', nodeType)
      .eq('deprecated', true)
      .single();
    return data;
  }

  /**
   * Refreshes the internal cache for node definitions and workflow templates if it's stale.
   * @returns {Promise<void>} A promise that resolves when the cache is refreshed or found to be fresh.
   * @private
   */
  static async refreshCacheIfNeeded(): Promise<void> {
    const now = Date.now();
    if (now - this.lastCacheUpdate < this.cacheExpiry && this.nodeDefinitionsCache.size > 0 && this.templateCache.length > 0) {
      return;
    }
    await Promise.all([this.loadNodeDefinitions(), this.loadWorkflowTemplates()]);
    this.lastCacheUpdate = now;
  }

  /**
   * Loads all node definitions and their parameters from the database and populates the cache.
   * @returns {Promise<void>} A promise that resolves when definitions are loaded.
   * @private
   */
  static async loadNodeDefinitions(): Promise<void> {
    const { data: definitions, error: defError } = await supabase.from('node_definitions').select('*').order('display_name');
    if (defError) { console.error("Error loading node definitions:", defError); return; }

    const { data: parameters, error: paramError } = await supabase.from('node_parameters').select('*');
    if (paramError) { console.error("Error loading node parameters:", paramError); return; }

    if (definitions && parameters) {
      this.nodeDefinitionsCache.clear();
      definitions.forEach(definition => {
        const nodeParams = parameters.filter(param => param.node_definition_id === definition.id);
        this.nodeDefinitionsCache.set(definition.node_type, { ...definition, parameters: nodeParams });
      });
    }
  }

  /**
   * Loads all public workflow templates from the database and populates the cache.
   * @returns {Promise<void>} A promise that resolves when templates are loaded.
   * @private
   */
  static async loadWorkflowTemplates(): Promise<void> {
    const { data, error } = await supabase
      .from('workflow_templates')
      .select('*')
      .eq('is_public', true)
      .order('usage_count', { ascending: false });
    if (error) { console.error("Error loading workflow templates:", error); return; }
    if (data) this.templateCache = data;
  }

  /**
   * Saves a given workflow as a new template in the database.
   * @param {string} name - The name for the new template.
   * @param {string} description - A description for the new template.
   * @param {any} workflow - The workflow object (n8n JSON structure) to save.
   * @param {string} category - The category for the template.
   * @param {string[]} [tags=[]] - Optional tags for the template.
   * @param {string} [useCase] - Optional use case description.
   * @param {'beginner' | 'intermediate' | 'advanced'} [difficulty='beginner'] - Difficulty level.
   * @param {boolean} [isPublic=false] - Whether the template should be publicly accessible.
   * @returns {Promise<void>} A promise that resolves when the template is saved.
   * @throws {Error} If the user is not authenticated.
   */
  static async saveWorkflowAsTemplate(
    name: string,
    description: string,
    workflow: any,
    category: string,
    tags: string[] = [],
    useCase?: string,
    difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner',
    isPublic = false
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated for saving template.');

    await supabase.from('workflow_templates').insert({
      user_id: user.id, name, description, category, tags,
      n8n_workflow: workflow, use_case: useCase, difficulty, is_public: isPublic
    });
  }
}
