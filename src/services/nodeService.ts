
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type NodeDefinition = Database['public']['Tables']['node_definitions']['Row'];
type NodeParameter = Database['public']['Tables']['node_parameters']['Row'];
type WorkflowTemplate = Database['public']['Tables']['workflow_templates']['Row'];

export interface NodeWithParameters extends NodeDefinition {
  parameters: NodeParameter[];
}

export interface ValidationIssue {
  type: 'error' | 'warning' | 'suggestion';
  nodeId?: string;
  nodeName?: string;
  message: string;
  suggestion?: string;
  autoFix?: boolean;
}

export interface WorkflowValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  modernizedWorkflow?: any;
}

export class NodeService {
  private static nodeDefinitionsCache: Map<string, NodeWithParameters> = new Map();
  private static templateCache: WorkflowTemplate[] = [];
  private static cacheExpiry = 5 * 60 * 1000; // 5 minutes
  private static lastCacheUpdate = 0;

  static async getNodeDefinitions(): Promise<NodeWithParameters[]> {
    await this.refreshCacheIfNeeded();
    return Array.from(this.nodeDefinitionsCache.values());
  }

  static async getNodeDefinition(nodeType: string): Promise<NodeWithParameters | null> {
    await this.refreshCacheIfNeeded();
    return this.nodeDefinitionsCache.get(nodeType) || null;
  }

  static async getWorkflowTemplates(category?: string): Promise<WorkflowTemplate[]> {
    await this.refreshCacheIfNeeded();
    
    if (category) {
      return this.templateCache.filter(template => template.category === category);
    }
    
    return this.templateCache;
  }

  static async validateWorkflow(workflow: any): Promise<WorkflowValidationResult> {
    const issues: ValidationIssue[] = [];
    let modernizedWorkflow = JSON.parse(JSON.stringify(workflow));
    
    if (!workflow.nodes) {
      return {
        isValid: false,
        issues: [{ type: 'error', message: 'Workflow must contain nodes array' }]
      };
    }

    // Check each node
    for (const node of workflow.nodes) {
      const nodeIssues = await this.validateNode(node);
      issues.push(...nodeIssues);
      
      // Auto-fix deprecated nodes
      if (nodeIssues.some(issue => issue.type === 'warning' && issue.autoFix)) {
        const modernizedNode = await this.modernizeNode(node);
        if (modernizedNode) {
          const nodeIndex = modernizedWorkflow.nodes.findIndex((n: any) => n.name === node.name);
          if (nodeIndex !== -1) {
            modernizedWorkflow.nodes[nodeIndex] = modernizedNode;
          }
        }
      }
    }

    // Validate connections
    const connectionIssues = this.validateConnections(workflow);
    issues.push(...connectionIssues);

    // Check for workflow patterns and suggest improvements
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
    const nodeDefinition = await this.getNodeDefinition(node.type);

    if (!nodeDefinition) {
      // Check if it's a deprecated node with a replacement
      const deprecatedNode = await this.findDeprecatedNode(node.type, node.name);
      if (deprecatedNode) {
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

    // Check if node is deprecated
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

    // Validate parameters
    const parameterIssues = await this.validateNodeParameters(node, nodeDefinition);
    issues.push(...parameterIssues);

    return issues;
  }

  static async validateNodeParameters(node: any, nodeDefinition: NodeWithParameters): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    const nodeParams = node.parameters || {};

    // Check required parameters
    for (const param of nodeDefinition.parameters) {
      if (param.required && (nodeParams[param.parameter_name] === undefined || nodeParams[param.parameter_name] === '')) {
        issues.push({
          type: 'error',
          nodeId: node.id,
          nodeName: node.name,
          message: `Missing required parameter "${param.parameter_name}" in node "${node.name}"`,
          suggestion: `Add value for ${param.parameter_name}: ${param.description}`
        });
      }

      // Validate parameter types and rules
      if (nodeParams[param.parameter_name] !== undefined) {
        const validationResult = this.validateParameterValue(
          nodeParams[param.parameter_name],
          param
        );
        
        if (!validationResult.isValid) {
          issues.push({
            type: 'error',
            nodeId: node.id,
            nodeName: node.name,
            message: `Invalid value for parameter "${param.parameter_name}": ${validationResult.message}`,
            suggestion: validationResult.suggestion
          });
        }
      }
    }

    return issues;
  }

  static validateParameterValue(value: any, parameter: NodeParameter): { isValid: boolean; message?: string; suggestion?: string } {
    const rules = parameter.validation_rules as any || {};
    
    // Type validation
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
        if (typeof value !== 'number' && isNaN(Number(value))) {
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

      connections.main?.forEach((connectionArray: any[], outputIndex: number) => {
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
    
    // Check for common patterns and suggest optimizations
    const nodes = workflow.nodes || [];
    
    // Suggest using Code node instead of multiple Set nodes
    const setNodes = nodes.filter((node: any) => node.type === 'n8n-nodes-base.set');
    if (setNodes.length > 3) {
      suggestions.push({
        type: 'suggestion',
        message: `Consider using a Code node instead of ${setNodes.length} Set nodes for better performance`,
        suggestion: 'Combine multiple field operations into a single Code node'
      });
    }

    // Suggest error handling for HTTP requests
    const httpNodes = nodes.filter((node: any) => node.type === 'n8n-nodes-base.httpRequest');
    if (httpNodes.length > 0 && !nodes.some((node: any) => node.type === 'n8n-nodes-base.if')) {
      suggestions.push({
        type: 'suggestion',
        message: 'Consider adding error handling for HTTP requests',
        suggestion: 'Add If nodes to handle potential API failures'
      });
    }

    return suggestions;
  }

  static async modernizeNode(node: any): Promise<any | null> {
    // Handle specific node modernizations
    if (node.type === 'n8n-nodes-base.function') {
      const modernNode = { ...node };
      modernNode.type = 'n8n-nodes-base.code';
      modernNode.typeVersion = 2;
      
      // Convert function parameters to code parameters
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

  static async findDeprecatedNode(nodeType: string, nodeName?: string): Promise<NodeDefinition | null> {
    const { data } = await supabase
      .from('node_definitions')
      .select('*')
      .eq('node_type', nodeType)
      .eq('deprecated', true)
      .single();
    
    return data;
  }

  static async refreshCacheIfNeeded(): Promise<void> {
    const now = Date.now();
    if (now - this.lastCacheUpdate < this.cacheExpiry && this.nodeDefinitionsCache.size > 0) {
      return;
    }

    await Promise.all([
      this.loadNodeDefinitions(),
      this.loadWorkflowTemplates()
    ]);
    
    this.lastCacheUpdate = now;
  }

  static async loadNodeDefinitions(): Promise<void> {
    const { data: definitions } = await supabase
      .from('node_definitions')
      .select('*')
      .order('display_name');

    const { data: parameters } = await supabase
      .from('node_parameters')
      .select('*');

    if (definitions && parameters) {
      this.nodeDefinitionsCache.clear();
      
      definitions.forEach(definition => {
        const nodeParameters = parameters.filter(param => param.node_definition_id === definition.id);
        this.nodeDefinitionsCache.set(definition.node_type, {
          ...definition,
          parameters: nodeParameters
        });
      });
    }
  }

  static async loadWorkflowTemplates(): Promise<void> {
    const { data } = await supabase
      .from('workflow_templates')
      .select('*')
      .eq('is_public', true)
      .order('usage_count', { ascending: false });

    if (data) {
      this.templateCache = data;
    }
  }

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
    if (!user) throw new Error('User not authenticated');

    await supabase
      .from('workflow_templates')
      .insert({
        user_id: user.id,
        name,
        description,
        category,
        tags,
        n8n_workflow: workflow,
        use_case: useCase,
        difficulty,
        is_public: isPublic
      });
  }

  static async recommendNodes(intent: string, currentNodes: any[] = []): Promise<NodeDefinition[]> {
    await this.refreshCacheIfNeeded();
    const allNodes = Array.from(this.nodeDefinitionsCache.values());
    
    // Simple intent-based recommendation
    const recommendations: NodeDefinition[] = [];
    const lowerIntent = intent.toLowerCase();
    
    // Recommend based on keywords
    if (lowerIntent.includes('webhook') || lowerIntent.includes('trigger')) {
      recommendations.push(...allNodes.filter(node => node.category === 'Trigger Nodes'));
    }
    
    if (lowerIntent.includes('api') || lowerIntent.includes('http') || lowerIntent.includes('request')) {
      const httpNode = allNodes.find(node => node.node_type === 'n8n-nodes-base.httpRequest');
      if (httpNode) recommendations.push(httpNode);
    }
    
    if (lowerIntent.includes('condition') || lowerIntent.includes('if') || lowerIntent.includes('check')) {
      const ifNode = allNodes.find(node => node.node_type === 'n8n-nodes-base.if');
      const switchNode = allNodes.find(node => node.node_type === 'n8n-nodes-base.switch');
      if (ifNode) recommendations.push(ifNode);
      if (switchNode) recommendations.push(switchNode);
    }
    
    if (lowerIntent.includes('code') || lowerIntent.includes('script') || lowerIntent.includes('process')) {
      const codeNode = allNodes.find(node => node.node_type === 'n8n-nodes-base.code');
      if (codeNode) recommendations.push(codeNode);
    }
    
    if (lowerIntent.includes('data') || lowerIntent.includes('transform') || lowerIntent.includes('set')) {
      const setNode = allNodes.find(node => node.node_type === 'n8n-nodes-base.set');
      if (setNode) recommendations.push(setNode);
    }

    return recommendations.slice(0, 5); // Return top 5 recommendations
  }
}
