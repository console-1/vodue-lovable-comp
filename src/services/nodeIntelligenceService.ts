
import { NodeService } from './nodeService';
import type { Database } from '@/integrations/supabase/types';

type NodeDefinition = Database['public']['Tables']['node_definitions']['Row'];

export interface NodeRecommendation extends NodeDefinition {
  relevanceScore: number;
  reasoning: string;
}

export interface WorkflowPattern {
  name: string;
  description: string;
  nodes: string[];
  useCase: string;
  complexity: 'simple' | 'medium' | 'complex';
}

export class NodeIntelligenceService {
  private static readonly WORKFLOW_PATTERNS: WorkflowPattern[] = [
    {
      name: 'Webhook to API Processing',
      description: 'Receive data via webhook, process it, and send to external API',
      nodes: ['n8n-nodes-base.webhook', 'n8n-nodes-base.code', 'n8n-nodes-base.httpRequest'],
      useCase: 'API integration, data processing',
      complexity: 'simple'
    },
    {
      name: 'Data Validation Pipeline',
      description: 'Validate incoming data with conditional logic and error handling',
      nodes: ['n8n-nodes-base.webhook', 'n8n-nodes-base.if', 'n8n-nodes-base.set', 'n8n-nodes-base.httpRequest'],
      useCase: 'Data validation, conditional processing',
      complexity: 'medium'
    },
    {
      name: 'Multi-API Aggregation',
      description: 'Fetch data from multiple APIs, merge results, and process',
      nodes: ['n8n-nodes-base.cron', 'n8n-nodes-base.httpRequest', 'n8n-nodes-base.merge', 'n8n-nodes-base.code'],
      useCase: 'Data aggregation, scheduled processing',
      complexity: 'complex'
    }
  ];

  static async getIntelligentRecommendations(
    intent: string, 
    currentNodes: any[] = []
  ): Promise<NodeRecommendation[]> {
    const allNodes = await NodeService.getNodeDefinitions();
    const recommendations: NodeRecommendation[] = [];
    
    const intentLower = intent.toLowerCase();
    const currentNodeTypes = new Set(currentNodes.map(node => node.type));

    // Score nodes based on intent keywords
    for (const node of allNodes) {
      if (node.deprecated) continue;
      
      let relevanceScore = 0;
      let reasoning = '';

      // Keyword-based scoring
      const keywords = this.extractKeywords(intentLower);
      const nodeKeywords = this.getNodeKeywords(node);
      
      for (const keyword of keywords) {
        if (nodeKeywords.includes(keyword)) {
          relevanceScore += 10;
          reasoning += `Matches "${keyword}" requirement. `;
        }
      }

      // Boost score for missing node types that are commonly needed
      if (!currentNodeTypes.has(node.node_type)) {
        relevanceScore += 5;
        reasoning += 'Adds new capability. ';
      }

      // Pattern matching
      const matchingPatterns = this.findMatchingPatterns(intentLower);
      for (const pattern of matchingPatterns) {
        if (pattern.nodes.includes(node.node_type)) {
          relevanceScore += 15;
          reasoning += `Part of ${pattern.name} pattern. `;
        }
      }

      if (relevanceScore > 0) {
        recommendations.push({
          ...node,
          relevanceScore,
          reasoning: reasoning.trim()
        });
      }
    }

    // Sort by relevance score and return top recommendations
    return recommendations
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 6);
  }

  static extractKeywords(intent: string): string[] {
    const keywordMap = {
      'webhook': ['webhook', 'receive', 'incoming', 'trigger'],
      'api': ['api', 'rest', 'http', 'request', 'fetch', 'get', 'post'],
      'process': ['process', 'transform', 'manipulate', 'modify'],
      'condition': ['if', 'condition', 'check', 'validate', 'filter'],
      'code': ['code', 'script', 'javascript', 'custom', 'logic'],
      'schedule': ['schedule', 'cron', 'timer', 'periodic', 'recurring'],
      'data': ['data', 'json', 'object', 'field', 'property'],
      'email': ['email', 'mail', 'send', 'notify'],
      'database': ['database', 'db', 'sql', 'store', 'save'],
      'split': ['split', 'branch', 'route', 'switch'],
      'merge': ['merge', 'combine', 'join', 'aggregate']
    };

    const keywords: string[] = [];
    for (const [category, terms] of Object.entries(keywordMap)) {
      if (terms.some(term => intent.includes(term))) {
        keywords.push(category);
      }
    }
    return keywords;
  }

  static getNodeKeywords(node: NodeDefinition): string[] {
    const keywordMap: Record<string, string[]> = {
      'n8n-nodes-base.webhook': ['webhook', 'trigger', 'receive'],
      'n8n-nodes-base.httpRequest': ['api', 'http', 'request'],
      'n8n-nodes-base.code': ['code', 'process', 'script'],
      'n8n-nodes-base.if': ['condition', 'if', 'check'],
      'n8n-nodes-base.switch': ['split', 'route', 'condition'],
      'n8n-nodes-base.set': ['data', 'transform', 'modify'],
      'n8n-nodes-base.merge': ['merge', 'combine', 'join'],
      'n8n-nodes-base.cron': ['schedule', 'timer', 'cron'],
      'n8n-nodes-base.itemLists': ['data', 'process', 'split']
    };

    return keywordMap[node.node_type] || [];
  }

  static findMatchingPatterns(intent: string): WorkflowPattern[] {
    return this.WORKFLOW_PATTERNS.filter(pattern => {
      const patternKeywords = pattern.useCase.toLowerCase();
      return intent.split(' ').some(word => 
        patternKeywords.includes(word) && word.length > 3
      );
    });
  }

  static async suggestWorkflowStructure(intent: string): Promise<{
    suggestedNodes: string[];
    reasoning: string;
    pattern?: WorkflowPattern;
  }> {
    const keywords = this.extractKeywords(intent);
    const patterns = this.findMatchingPatterns(intent);
    
    if (patterns.length > 0) {
      const bestPattern = patterns[0];
      return {
        suggestedNodes: bestPattern.nodes,
        reasoning: `Based on "${intent}", this matches the ${bestPattern.name} pattern: ${bestPattern.description}`,
        pattern: bestPattern
      };
    }

    // Fallback: build structure from keywords
    const suggestedNodes: string[] = [];
    let reasoning = 'Basic workflow structure: ';

    if (keywords.includes('webhook')) {
      suggestedNodes.push('n8n-nodes-base.webhook');
      reasoning += 'Start with webhook trigger. ';
    }

    if (keywords.includes('condition')) {
      suggestedNodes.push('n8n-nodes-base.if');
      reasoning += 'Add conditional logic. ';
    }

    if (keywords.includes('process') || keywords.includes('code')) {
      suggestedNodes.push('n8n-nodes-base.code');
      reasoning += 'Process data with custom code. ';
    }

    if (keywords.includes('api')) {
      suggestedNodes.push('n8n-nodes-base.httpRequest');
      reasoning += 'Make API requests. ';
    }

    return {
      suggestedNodes,
      reasoning: reasoning.trim()
    };
  }
}
