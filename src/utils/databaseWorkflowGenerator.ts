
import { supabase } from '@/integrations/supabase/client';

interface NodeDefinition {
  id: string;
  name: string;
  display_name: string;
  description: string;
  icon: string;
  latest_version: number;
  class_name: string;
  properties: any;
  operation_count: number;
}

interface NodeSuggestion {
  node_type: string;
  node_display_name: string;
  compatibility_score: number;
  usage_frequency: number;
  reasoning: string;
}

export class DatabaseWorkflowGenerator {
  
  /**
   * Layer 1: The Architect - Intelligent Planning
   * Analyzes user intent and creates a logical workflow blueprint
   */
  static async analyzeIntent(description: string): Promise<{
    nodes: string[];
    flow: string;
    complexity: 'simple' | 'medium' | 'complex';
    recommendations: NodeSuggestion[];
  }> {
    console.log('🧠 Architect Layer: Analyzing user intent for:', description);
    
    // Extract key intent patterns
    const intentKeywords = this.extractIntentKeywords(description);
    const suggestedNodes = await this.getRecommendedNodes(intentKeywords);
    
    // Determine workflow complexity
    const complexity = this.assessComplexity(description, suggestedNodes);
    
    // Get node recommendations based on intent
    const nodeTypes = suggestedNodes.map(n => n.name);
    const recommendations = await this.getNodeSuggestions(nodeTypes);
    
    return {
      nodes: nodeTypes,
      flow: this.determineWorkflowFlow(intentKeywords),
      complexity,
      recommendations
    };
  }

  /**
   * Layer 2: The Builder - Smart Assembly
   * Translates architect's blueprint into actual n8n JSON
   */
  static async buildWorkflow(
    name: string,
    description: string,
    blueprint: any
  ): Promise<any> {
    console.log('🔨 Builder Layer: Assembling workflow from blueprint');
    
    const nodes = [];
    const connections: any = {};
    let nodeId = 0;
    
    // Get actual node definitions from database
    const nodeDefinitions = await this.getNodeDefinitions(blueprint.nodes);
    
    // Create trigger node if needed
    if (this.needsTrigger(description)) {
      const webhookNode = await this.createWebhookNode(nodeId++);
      nodes.push(webhookNode);
    }
    
    // Build main processing nodes
    for (const nodeType of blueprint.nodes) {
      const nodeDef = nodeDefinitions.find(n => n.name === nodeType);
      if (nodeDef) {
        const node = await this.createNodeFromDefinition(nodeDef, nodeId++, description);
        nodes.push(node);
      }
    }
    
    // Create connections based on flow logic
    this.createConnections(nodes, connections);
    
    const workflow = {
      id: Math.floor(Math.random() * 1000000),
      name,
      description,
      nodes: nodes.map((node, index) => ({
        ...node,
        position: [100 + (index * 200), 100 + (index % 2) * 150]
      })),
      connections,
      json: {
        name,
        nodes,
        connections,
        active: false,
        settings: {},
        staticData: null
      }
    };
    
    console.log('✅ Builder Layer: Workflow assembled with', nodes.length, 'nodes');
    return workflow;
  }

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
    
    // Calculate complexity using our database function
    const complexity = await this.calculateComplexity(workflow.json);
    
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

  // Helper methods for database interactions
  private static async getNodeDefinitions(nodeTypes: string[]): Promise<NodeDefinition[]> {
    try {
      const { data, error } = await supabase
        .from('current_node_definitions')
        .select('*')
        .in('name', nodeTypes);
      
      if (error) {
        console.error('Error fetching node definitions:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Database error fetching node definitions:', error);
      return [];
    }
  }

  private static async getNodeSuggestions(currentNodes: string[]): Promise<NodeSuggestion[]> {
    try {
      const { data, error } = await supabase
        .rpc('suggest_next_nodes', { current_node_types: currentNodes });
      
      if (error) {
        console.error('Error getting node suggestions:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Database error getting suggestions:', error);
      return [];
    }
  }

  private static async calculateComplexity(workflowJson: any): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('calculate_workflow_complexity', { workflow_json: workflowJson });
      
      if (error) {
        console.error('Error calculating complexity:', error);
        return 0;
      }
      
      return data || 0;
    } catch (error) {
      console.error('Database error calculating complexity:', error);
      return 0;
    }
  }

  // Intent analysis helpers
  private static extractIntentKeywords(description: string): string[] {
    const keywords = [];
    const lower = description.toLowerCase();
    
    // Data processing patterns
    if (lower.includes('api') || lower.includes('request') || lower.includes('fetch')) {
      keywords.push('api_integration');
    }
    if (lower.includes('email') || lower.includes('send') || lower.includes('notify')) {
      keywords.push('notification');
    }
    if (lower.includes('data') || lower.includes('process') || lower.includes('transform')) {
      keywords.push('data_processing');
    }
    if (lower.includes('webhook') || lower.includes('trigger') || lower.includes('receive')) {
      keywords.push('webhook_trigger');
    }
    if (lower.includes('condition') || lower.includes('if') || lower.includes('filter')) {
      keywords.push('conditional');
    }
    
    return keywords;
  }

  private static async getRecommendedNodes(keywords: string[]): Promise<NodeDefinition[]> {
    const nodeMap: { [key: string]: string[] } = {
      'api_integration': ['n8n-nodes-base.httpRequest'],
      'notification': ['n8n-nodes-base.emailSend', 'n8n-nodes-base.slack'],
      'data_processing': ['n8n-nodes-base.code', 'n8n-nodes-base.set'],
      'webhook_trigger': ['n8n-nodes-base.webhook'],
      'conditional': ['n8n-nodes-base.if', 'n8n-nodes-base.switch']
    };
    
    const recommendedTypes = keywords.flatMap(k => nodeMap[k] || []);
    return this.getNodeDefinitions(recommendedTypes);
  }

  private static assessComplexity(description: string, nodes: NodeDefinition[]): 'simple' | 'medium' | 'complex' {
    const indicators = {
      simple: ['send', 'get', 'fetch', 'simple'],
      medium: ['process', 'transform', 'condition', 'filter'],
      complex: ['multiple', 'complex', 'integration', 'workflow', 'automation']
    };
    
    const lower = description.toLowerCase();
    let complexityScore = nodes.length;
    
    // Add points based on description complexity
    if (indicators.complex.some(word => lower.includes(word))) complexityScore += 3;
    else if (indicators.medium.some(word => lower.includes(word))) complexityScore += 2;
    else if (indicators.simple.some(word => lower.includes(word))) complexityScore += 1;
    
    if (complexityScore <= 3) return 'simple';
    if (complexityScore <= 6) return 'medium';
    return 'complex';
  }

  private static determineWorkflowFlow(keywords: string[]): string {
    if (keywords.includes('webhook_trigger')) {
      return 'trigger_based';
    } else if (keywords.includes('conditional')) {
      return 'conditional_flow';
    } else if (keywords.includes('api_integration')) {
      return 'api_processing';
    }
    return 'linear_flow';
  }

  private static needsTrigger(description: string): boolean {
    const triggerWords = ['webhook', 'receive', 'trigger', 'incoming', 'listen'];
    return triggerWords.some(word => description.toLowerCase().includes(word));
  }

  private static async createWebhookNode(id: number): Promise<any> {
    return {
      id: `webhook_${id}`,
      name: 'Webhook',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2,
      position: [100, 100],
      parameters: {
        path: 'vodue-webhook',
        httpMethod: 'POST',
        responseMode: 'onReceived'
      }
    };
  }

  private static async createNodeFromDefinition(
    nodeDef: NodeDefinition, 
    id: number, 
    context: string
  ): Promise<any> {
    const baseNode = {
      id: `node_${id}`,
      name: nodeDef.display_name,
      type: nodeDef.name,
      typeVersion: nodeDef.latest_version || 1,
      position: [100 + (id * 200), 100],
      parameters: {}
    };

    // Add context-specific parameters based on node type
    if (nodeDef.name === 'n8n-nodes-base.code') {
      baseNode.parameters = {
        jsCode: `// Process your data here\nconst items = $input.all();\n\n// Add your logic\nfor (const item of items) {\n  item.json.processed = true;\n  item.json.timestamp = new Date().toISOString();\n}\n\nreturn items;`,
        mode: 'runOnceForAllItems'
      };
    } else if (nodeDef.name === 'n8n-nodes-base.httpRequest') {
      baseNode.parameters = {
        url: '={{$json.url}}',
        method: 'GET',
        authentication: 'none'
      };
    } else if (nodeDef.name === 'n8n-nodes-base.set') {
      baseNode.parameters = {
        fields: {
          values: [
            {
              name: 'processed',
              type: 'booleanValue',
              booleanValue: true
            }
          ]
        }
      };
    }

    return baseNode;
  }

  private static createConnections(nodes: any[], connections: any): void {
    // Create simple linear connections for now
    for (let i = 0; i < nodes.length - 1; i++) {
      const sourceNode = nodes[i];
      const targetNode = nodes[i + 1];
      
      if (!connections[sourceNode.name]) {
        connections[sourceNode.name] = {};
      }
      
      connections[sourceNode.name].main = [[{
        node: targetNode.name,
        type: 'main',
        index: 0
      }]];
    }
  }

  private static async validateNodes(nodes: any[]): Promise<{ warnings: string[] }> {
    const warnings = [];
    
    for (const node of nodes) {
      // Check for required parameters
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
    
    // Check for potential optimizations
    const nodeCount = workflow.nodes?.length || 0;
    
    if (nodeCount > 5) {
      optimizations.push('Consider breaking this into smaller, focused workflows');
    }
    
    // Check for duplicate HTTP requests
    const httpNodes = workflow.nodes?.filter(n => n.type === 'n8n-nodes-base.httpRequest') || [];
    if (httpNodes.length > 3) {
      optimizations.push('Multiple HTTP requests detected - consider batching or caching');
    }
    
    return optimizations;
  }

  private static validateConnections(connections: any): string[] {
    const warnings = [];
    
    // Basic connection validation
    for (const [sourceName, connection] of Object.entries(connections)) {
      if (!connection || typeof connection !== 'object') {
        warnings.push(`Warning: Invalid connection from node "${sourceName}"`);
      }
    }
    
    return warnings;
  }
}
