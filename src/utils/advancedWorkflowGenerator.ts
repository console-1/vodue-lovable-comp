
import { NodeIntelligenceService, type NodeRecommendation } from '@/services/nodeIntelligenceService';
import { EnhancedWorkflowValidator } from './enhancedWorkflowValidator';
import type { Database } from '@/integrations/supabase/types';

type NodeDefinition = Database['public']['Tables']['node_definitions']['Row'];

export interface AdvancedGeneratedWorkflow {
  id: number;
  name: string;
  description: string;
  nodes: any[];
  connections: any;
  json: any;
  validationResult?: any;
  recommendations?: string[];
  aiInsights?: {
    confidence: number;
    reasoning: string;
    suggestedImprovements: string[];
    complexity: 'simple' | 'medium' | 'complex';
  };
}

export class AdvancedWorkflowGenerator {
  private static nodeCounter = 0;
  
  static async generateWorkflow(description: string): Promise<AdvancedGeneratedWorkflow> {
    console.log('🎯 Advanced workflow generation for:', description);
    
    // Step 1: Analyze intent with enhanced NLP
    const intentAnalysis = await this.analyzeIntent(description);
    console.log('📊 Intent analysis:', intentAnalysis);
    
    // Step 2: Get intelligent recommendations
    const recommendations = await NodeIntelligenceService.getIntelligentRecommendations(description);
    const workflowStructure = await NodeIntelligenceService.suggestWorkflowStructure(description);
    
    // Step 3: Generate workflow using AI insights
    const workflow = await this.generateIntelligentWorkflow(
      description, 
      intentAnalysis, 
      recommendations, 
      workflowStructure
    );
    
    // Step 4: Validate and enhance
    const validationResult = await EnhancedWorkflowValidator.validateWorkflowComprehensive(workflow.json);
    
    // Step 5: Auto-fix if needed
    if (!validationResult.isValid) {
      const { fixed, changes } = await EnhancedWorkflowValidator.autoFixWorkflow(workflow.json);
      workflow.json = fixed;
      console.log('🔧 Applied auto-fixes:', changes);
    }
    
    // Step 6: Generate AI insights
    const aiInsights = this.generateAIInsights(description, intentAnalysis, recommendations, validationResult);
    
    return {
      ...workflow,
      validationResult,
      recommendations: validationResult.recommendations,
      aiInsights
    };
  }

  private static async analyzeIntent(description: string): Promise<{
    category: string;
    complexity: 'simple' | 'medium' | 'complex';
    keywords: string[];
    entities: string[];
    confidence: number;
    workflowType: string;
    primaryAction: string;
    dataFlow: string;
  }> {
    const lowerDesc = description.toLowerCase();
    const words = lowerDesc.split(/\s+/);
    
    // Enhanced keyword extraction
    const keywords = this.extractEnhancedKeywords(lowerDesc);
    
    // Entity recognition
    const entities = this.extractEntities(description);
    
    // Workflow type classification
    const workflowType = this.classifyWorkflowType(lowerDesc, keywords);
    
    // Primary action detection
    const primaryAction = this.detectPrimaryAction(lowerDesc, keywords);
    
    // Data flow analysis
    const dataFlow = this.analyzeDataFlow(lowerDesc, keywords);
    
    // Complexity assessment
    const complexity = this.assessComplexity(description, keywords);
    
    // Confidence calculation
    const confidence = this.calculateConfidence(keywords, entities, workflowType);
    
    return {
      category: workflowType,
      complexity,
      keywords,
      entities,
      confidence,
      workflowType,
      primaryAction,
      dataFlow
    };
  }

  private static extractEnhancedKeywords(description: string): string[] {
    const enhancedKeywordMap = {
      // Triggers
      'webhook': ['webhook', 'receive', 'incoming', 'trigger', 'endpoint', 'api call'],
      'schedule': ['schedule', 'cron', 'timer', 'daily', 'hourly', 'periodic', 'recurring', 'interval'],
      'manual': ['manual', 'start', 'begin', 'initiate', 'launch'],
      
      // Actions
      'api': ['api', 'rest', 'http', 'request', 'fetch', 'get', 'post', 'put', 'delete', 'call'],
      'process': ['process', 'transform', 'manipulate', 'modify', 'convert', 'parse', 'format'],
      'condition': ['if', 'condition', 'check', 'validate', 'filter', 'when', 'unless', 'case'],
      'code': ['code', 'script', 'javascript', 'custom', 'logic', 'function', 'execute'],
      'data': ['data', 'json', 'object', 'field', 'property', 'value', 'item'],
      
      // Integrations
      'email': ['email', 'mail', 'send', 'notify', 'message', 'smtp'],
      'database': ['database', 'db', 'sql', 'store', 'save', 'persist', 'record'],
      'file': ['file', 'upload', 'download', 'csv', 'excel', 'pdf', 'document'],
      'slack': ['slack', 'channel', 'message', 'notification', 'team'],
      'discord': ['discord', 'bot', 'server', 'channel'],
      
      // Operations
      'split': ['split', 'branch', 'route', 'switch', 'divide', 'separate'],
      'merge': ['merge', 'combine', 'join', 'aggregate', 'union', 'concat'],
      'loop': ['loop', 'iterate', 'repeat', 'foreach', 'each', 'all'],
      'wait': ['wait', 'delay', 'pause', 'sleep', 'timeout'],
      
      // Data operations
      'filter': ['filter', 'where', 'select', 'find', 'search', 'match'],
      'sort': ['sort', 'order', 'arrange', 'rank', 'organize'],
      'count': ['count', 'total', 'sum', 'calculate', 'compute'],
      'unique': ['unique', 'distinct', 'dedupe', 'duplicate', 'remove duplicates']
    };

    const keywords: string[] = [];
    for (const [category, terms] of Object.entries(enhancedKeywordMap)) {
      if (terms.some(term => description.includes(term))) {
        keywords.push(category);
      }
    }
    return keywords;
  }

  private static extractEntities(description: string): string[] {
    const entityPatterns = {
      url: /https?:\/\/[^\s]+/gi,
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
      api_endpoint: /\/api\/[^\s]*/gi,
      json_path: /\$\.[\w.[\]]+/gi,
      time: /\b\d{1,2}:\d{2}(?::\d{2})?\b/gi,
      numbers: /\b\d+\b/gi
    };

    const entities: string[] = [];
    for (const [type, pattern] of Object.entries(entityPatterns)) {
      const matches = description.match(pattern);
      if (matches) {
        entities.push(...matches.map(match => `${type}:${match}`));
      }
    }
    return entities;
  }

  private static classifyWorkflowType(description: string, keywords: string[]): string {
    if (keywords.includes('webhook') || keywords.includes('api')) return 'API Integration';
    if (keywords.includes('schedule')) return 'Scheduled Automation';
    if (keywords.includes('condition')) return 'Conditional Logic';
    if (keywords.includes('process') || keywords.includes('data')) return 'Data Processing';
    if (keywords.includes('email') || keywords.includes('slack')) return 'Notification';
    if (keywords.includes('database')) return 'Data Management';
    return 'General Automation';
  }

  private static detectPrimaryAction(description: string, keywords: string[]): string {
    const actionPriority = ['api', 'process', 'email', 'database', 'condition', 'webhook'];
    for (const action of actionPriority) {
      if (keywords.includes(action)) return action;
    }
    return 'process';
  }

  private static analyzeDataFlow(description: string, keywords: string[]): string {
    if (keywords.includes('webhook') && keywords.includes('api')) return 'webhook → process → api';
    if (keywords.includes('schedule') && keywords.includes('api')) return 'schedule → api → process';
    if (keywords.includes('condition')) return 'input → condition → branch';
    if (keywords.includes('merge')) return 'multiple → merge → output';
    return 'linear';
  }

  private static assessComplexity(description: string, keywords: string[]): 'simple' | 'medium' | 'complex' {
    const complexityIndicators = {
      simple: 1,
      medium: keywords.length > 3 ? 2 : 1,
      complex: 0
    };

    if (keywords.includes('condition') && keywords.includes('loop')) complexityIndicators.complex += 2;
    if (keywords.includes('merge') || keywords.includes('split')) complexityIndicators.complex += 1;
    if (description.length > 200) complexityIndicators.complex += 1;
    if (keywords.length > 5) complexityIndicators.complex += 1;

    const maxScore = Math.max(...Object.values(complexityIndicators));
    if (complexityIndicators.complex === maxScore) return 'complex';
    if (complexityIndicators.medium === maxScore) return 'medium';
    return 'simple';
  }

  private static calculateConfidence(keywords: string[], entities: string[], workflowType: string): number {
    let confidence = 0.3; // Base confidence
    
    confidence += Math.min(keywords.length * 0.1, 0.4); // Keyword bonus
    confidence += Math.min(entities.length * 0.05, 0.2); // Entity bonus
    confidence += workflowType !== 'General Automation' ? 0.1 : 0; // Type specificity bonus
    
    return Math.min(confidence, 0.95);
  }

  private static async generateIntelligentWorkflow(
    description: string,
    intentAnalysis: any,
    recommendations: NodeRecommendation[],
    workflowStructure: any
  ): Promise<Omit<AdvancedGeneratedWorkflow, 'validationResult' | 'recommendations' | 'aiInsights'>> {
    
    // Use pattern-based generation if available
    if (workflowStructure.pattern) {
      return this.generatePatternBasedWorkflow(description, intentAnalysis, workflowStructure);
    }
    
    // Use intelligent node selection based on recommendations
    return this.generateRecommendationBasedWorkflow(description, intentAnalysis, recommendations);
  }

  private static async generatePatternBasedWorkflow(
    description: string,
    intentAnalysis: any,
    workflowStructure: any
  ): Promise<Omit<AdvancedGeneratedWorkflow, 'validationResult' | 'recommendations' | 'aiInsights'>> {
    
    const nodes: any[] = [];
    let xPosition = 240;
    const yPosition = 300;

    // Generate nodes based on the suggested pattern
    for (const nodeType of workflowStructure.suggestedNodes) {
      const node = this.createIntelligentNode(
        this.getNodeDisplayName(nodeType),
        nodeType,
        xPosition,
        yPosition,
        this.generateIntelligentParameters(nodeType, description, intentAnalysis)
      );
      nodes.push(node);
      xPosition += 220;
    }

    const workflowJson = {
      name: this.generateIntelligentWorkflowName(description, intentAnalysis),
      nodes,
      connections: this.generateIntelligentConnections(nodes, workflowStructure.pattern),
      active: false,
      settings: {}
    };

    return {
      id: Date.now(),
      name: workflowJson.name,
      description,
      nodes: this.formatNodesForPreview(nodes),
      connections: this.formatConnectionsForPreview(workflowJson.connections),
      json: workflowJson
    };
  }

  private static async generateRecommendationBasedWorkflow(
    description: string,
    intentAnalysis: any,
    recommendations: NodeRecommendation[]
  ): Promise<Omit<AdvancedGeneratedWorkflow, 'validationResult' | 'recommendations' | 'aiInsights'>> {
    
    const nodes: any[] = [];
    let xPosition = 240;
    const yPosition = 300;

    // Select top recommendations based on relevance
    const selectedNodes = recommendations.slice(0, 4).sort((a, b) => b.relevanceScore - a.relevanceScore);

    for (const nodeRec of selectedNodes) {
      const node = this.createIntelligentNode(
        nodeRec.display_name,
        nodeRec.node_type,
        xPosition,
        yPosition,
        this.generateIntelligentParameters(nodeRec.node_type, description, intentAnalysis)
      );
      nodes.push(node);
      xPosition += 220;
    }

    const workflowJson = {
      name: this.generateIntelligentWorkflowName(description, intentAnalysis),
      nodes,
      connections: this.generateLinearConnections(nodes),
      active: false,
      settings: {}
    };

    return {
      id: Date.now(),
      name: workflowJson.name,
      description,
      nodes: this.formatNodesForPreview(nodes),
      connections: this.formatConnectionsForPreview(workflowJson.connections),
      json: workflowJson
    };
  }

  private static createIntelligentNode(name: string, type: string, x: number, y: number, parameters: any): any {
    return {
      name,
      type,
      typeVersion: this.getNodeTypeVersion(type),
      position: [x, y],
      parameters,
      id: `${name.replace(/\s+/g, '')}_${++this.nodeCounter}`
    };
  }

  private static generateIntelligentParameters(nodeType: string, description: string, intentAnalysis: any): any {
    const baseParams = this.getBaseParameters(nodeType);
    
    // Enhance parameters based on intent analysis
    return this.enhanceParametersWithIntent(baseParams, nodeType, description, intentAnalysis);
  }

  private static getBaseParameters(nodeType: string): any {
    const parameterMap: Record<string, any> = {
      'n8n-nodes-base.webhook': {
        path: 'webhook',
        httpMethod: 'POST',
        responseMode: 'onReceived'
      },
      'n8n-nodes-base.code': {
        mode: 'runOnceForAllItems',
        jsCode: '// AI-generated processing logic\nreturn $input.all();'
      },
      'n8n-nodes-base.set': {
        fields: {
          values: [
            {
              name: 'processed',
              type: 'booleanValue',
              booleanValue: true
            }
          ]
        }
      },
      'n8n-nodes-base.httpRequest': {
        url: 'https://api.example.com',
        method: 'GET',
        authentication: 'none'
      },
      'n8n-nodes-base.if': {
        conditions: {
          options: {
            caseSensitive: true,
            leftValue: '={{ $json.status }}',
            operation: 'equal',
            rightValue: 'active'
          }
        }
      }
    };

    return parameterMap[nodeType] || {};
  }

  private static enhanceParametersWithIntent(baseParams: any, nodeType: string, description: string, intentAnalysis: any): any {
    const enhanced = { ...baseParams };
    
    // Enhance based on intent analysis
    if (nodeType === 'n8n-nodes-base.webhook' && intentAnalysis.entities.length > 0) {
      const pathEntity = intentAnalysis.entities.find((e: string) => e.startsWith('api_endpoint:'));
      if (pathEntity) {
        enhanced.path = pathEntity.split(':')[1].replace('/api/', '');
      } else {
        enhanced.path = this.generateWebhookPath(description, intentAnalysis);
      }
    }
    
    if (nodeType === 'n8n-nodes-base.code') {
      enhanced.jsCode = this.generateIntelligentCode(description, intentAnalysis);
    }
    
    if (nodeType === 'n8n-nodes-base.httpRequest') {
      const urlEntity = intentAnalysis.entities.find((e: string) => e.startsWith('url:'));
      if (urlEntity) {
        enhanced.url = urlEntity.split(':', 2)[1];
      }
      enhanced.method = this.detectHttpMethod(description, intentAnalysis);
    }
    
    return enhanced;
  }

  private static generateIntelligentCode(description: string, intentAnalysis: any): string {
    const templates = {
      'API Integration': `// AI-generated API integration logic for: ${description}
const processedItems = [];

for (const item of $input.all()) {
  try {
    // Enhanced data processing based on intent: ${intentAnalysis.primaryAction}
    const processed = {
      original: item.json,
      processed_at: new Date().toISOString(),
      workflow_type: "${intentAnalysis.workflowType}",
      confidence: ${intentAnalysis.confidence}
    };
    
    // Apply intelligent transformations
    ${this.generateTransformationLogic(intentAnalysis)}
    
    processedItems.push({ json: processed });
  } catch (error) {
    processedItems.push({ json: { error: error.message, item: item.json } });
  }
}

return processedItems;`,

      'Data Processing': `// AI-enhanced data processing for: ${description}
const results = [];

for (const item of $input.all()) {
  const result = {
    id: Math.random().toString(36).substr(2, 9),
    processed_at: new Date().toISOString(),
    data_flow: "${intentAnalysis.dataFlow}",
    complexity: "${intentAnalysis.complexity}"
  };
  
  // Intelligent processing based on detected patterns
  ${this.generateProcessingLogic(intentAnalysis)}
  
  results.push({ json: result });
}

return results;`,

      'default': `// AI-generated workflow logic for: ${description}
// Detected intent: ${intentAnalysis.workflowType} (${intentAnalysis.confidence * 100}% confidence)

for (const item of $input.all()) {
  item.json.ai_enhanced = true;
  item.json.processing_metadata = {
    keywords: ${JSON.stringify(intentAnalysis.keywords)},
    complexity: "${intentAnalysis.complexity}",
    processed_at: new Date().toISOString()
  };
}

return $input.all();`
    };

    return templates[intentAnalysis.workflowType as keyof typeof templates] || templates.default;
  }

  private static generateTransformationLogic(intentAnalysis: any): string {
    if (intentAnalysis.keywords.includes('filter')) {
      return `// Apply intelligent filtering
    if (item.json && typeof item.json === 'object') {
      processed.filtered_data = Object.keys(item.json).length > 0 ? item.json : null;
    }`;
    }
    
    if (intentAnalysis.keywords.includes('merge')) {
      return `// Intelligent data merging
    processed.merged_data = { ...item.json, enhanced: true };`;
    }
    
    return `// Standard transformation
    processed.transformed = item.json;`;
  }

  private static generateProcessingLogic(intentAnalysis: any): string {
    if (intentAnalysis.complexity === 'complex') {
      return `// Complex processing logic
  result.advanced_processing = true;
  result.data_analysis = this.analyzeDataStructure(item.json);`;
    }
    
    return `// Standard processing
  result.data = item.json;
  result.status = 'processed';`;
  }

  private static generateWebhookPath(description: string, intentAnalysis: any): string {
    const words = description.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(' ')
      .filter(word => word.length > 2 && !['the', 'and', 'for', 'with'].includes(word))
      .slice(0, 2);
    
    return words.join('-') || intentAnalysis.primaryAction || 'webhook';
  }

  private static detectHttpMethod(description: string, intentAnalysis: any): string {
    const desc = description.toLowerCase();
    if (desc.includes('post') || desc.includes('create') || desc.includes('submit')) return 'POST';
    if (desc.includes('put') || desc.includes('update') || desc.includes('modify')) return 'PUT';
    if (desc.includes('delete') || desc.includes('remove')) return 'DELETE';
    if (desc.includes('patch')) return 'PATCH';
    return intentAnalysis.keywords.includes('api') ? 'POST' : 'GET';
  }

  private static generateIntelligentWorkflowName(description: string, intentAnalysis: any): string {
    const actionMap: Record<string, string> = {
      'api': 'API Integration',
      'webhook': 'Webhook Handler',
      'process': 'Data Processor',
      'email': 'Email Automation',
      'schedule': 'Scheduled Task'
    };
    
    const prefix = actionMap[intentAnalysis.primaryAction] || 'Smart Workflow';
    const suffix = intentAnalysis.workflowType !== 'General Automation' 
      ? ` - ${intentAnalysis.workflowType}` 
      : '';
    
    return `${prefix}${suffix}`;
  }

  private static generateAIInsights(
    description: string,
    intentAnalysis: any,
    recommendations: NodeRecommendation[],
    validationResult: any
  ): any {
    const suggestedImprovements: string[] = [];
    
    if (intentAnalysis.confidence < 0.7) {
      suggestedImprovements.push('Consider providing more specific details about your workflow requirements');
    }
    
    if (recommendations.length === 0) {
      suggestedImprovements.push('Add more context about the data sources and destinations');
    }
    
    if (validationResult.issues?.length > 0) {
      suggestedImprovements.push('Review validation issues to optimize workflow performance');
    }
    
    const reasoning = `Generated ${intentAnalysis.workflowType.toLowerCase()} workflow with ${intentAnalysis.confidence * 100}% confidence. ` +
      `Detected ${intentAnalysis.keywords.length} key requirements and selected ${recommendations.length} optimal nodes.`;
    
    return {
      confidence: intentAnalysis.confidence,
      reasoning,
      suggestedImprovements,
      complexity: intentAnalysis.complexity
    };
  }

  // Helper methods from ModernWorkflowGenerator
  private static getNodeTypeVersion(nodeType: string): number {
    const versionMap: Record<string, number> = {
      'n8n-nodes-base.webhook': 2,
      'n8n-nodes-base.code': 2,
      'n8n-nodes-base.set': 3,
      'n8n-nodes-base.httpRequest': 4,
      'n8n-nodes-base.if': 2,
      'n8n-nodes-base.switch': 3,
      'n8n-nodes-base.cron': 1,
      'n8n-nodes-base.manualTrigger': 1
    };
    return versionMap[nodeType] || 1;
  }

  private static generateLinearConnections(nodes: any[]): Record<string, any> {
    const connections: Record<string, any> = {};
    
    for (let i = 0; i < nodes.length - 1; i++) {
      connections[nodes[i].name] = {
        main: [[{ node: nodes[i + 1].name, type: 'main', index: 0 }]]
      };
    }
    
    return connections;
  }

  private static generateIntelligentConnections(nodes: any[], pattern?: any): Record<string, any> {
    if (pattern?.name === 'Data Validation Pipeline') {
      return this.generateConditionalConnections(nodes);
    }
    
    return this.generateLinearConnections(nodes);
  }

  private static generateConditionalConnections(nodes: any[]): Record<string, any> {
    const connections: Record<string, any> = {};
    
    if (nodes.length >= 2) {
      connections[nodes[0].name] = {
        main: [[{ node: nodes[1].name, type: 'main', index: 0 }]]
      };
    }
    
    if (nodes.length >= 4) {
      connections[nodes[1].name] = {
        main: [
          [{ node: nodes[2].name, type: 'main', index: 0 }],
          [{ node: nodes[3].name, type: 'main', index: 0 }]
        ]
      };
    }
    
    return connections;
  }

  private static formatNodesForPreview(nodes: any[]): any[] {
    return nodes.map(node => ({
      id: node.id || node.name,
      name: node.name,
      type: this.getNodeDisplayName(node.type),
      position: node.position
    }));
  }

  private static formatConnectionsForPreview(connections: Record<string, any>): Array<{from: string, to: string}> {
    const result: Array<{from: string, to: string}> = [];
    
    Object.entries(connections).forEach(([from, connection]) => {
      connection.main?.forEach((connectionArray: any[]) => {
        connectionArray.forEach((conn: any) => {
          result.push({ from, to: conn.node });
        });
      });
    });
    
    return result;
  }

  private static getNodeDisplayName(nodeType: string): string {
    const displayNames: Record<string, string> = {
      'n8n-nodes-base.webhook': 'Webhook',
      'n8n-nodes-base.code': 'Code',
      'n8n-nodes-base.set': 'Edit Fields (Set)',
      'n8n-nodes-base.httpRequest': 'HTTP Request',
      'n8n-nodes-base.if': 'If',
      'n8n-nodes-base.switch': 'Switch',
      'n8n-nodes-base.cron': 'Schedule Trigger',
      'n8n-nodes-base.manualTrigger': 'Manual Trigger'
    };
    return displayNames[nodeType] || nodeType.split('.').pop() || nodeType;
  }
}
