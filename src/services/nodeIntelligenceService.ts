import { NodeService } from './nodeService';
import type { Database } from '@/integrations/supabase/types';

type NodeDefinition = Database['public']['Tables']['node_definitions']['Row'];

/**
 * Represents a node recommendation, extending a standard NodeDefinition
 * with intelligence-specific properties like relevance and reasoning.
 */
export interface NodeRecommendation extends NodeDefinition {
  /** The calculated relevance score for this recommendation. Higher is better. */
  relevanceScore: number;
  /** A human-readable string explaining why this node was recommended. */
  reasoning: string;
}

/**
 * Defines a known workflow pattern that can be used for recommendations or suggestions.
 */
export interface WorkflowPattern {
  /** The name of the workflow pattern. */
  name: string;
  /** A brief description of what the pattern does. */
  description: string;
  /** An array of node types typically involved in this pattern. */
  nodes: string[];
  /** Common use cases or problems this pattern solves. */
  useCase: string;
  /** The general complexity level of implementing this pattern. */
  complexity: 'simple' | 'medium' | 'complex';
}

/**
 * Provides services for intelligent node and workflow recommendations.
 * This includes suggesting nodes based on user intent and identifying potential workflow patterns.
 */
export class NodeIntelligenceService {
  /**
   * Predefined common workflow patterns.
   * @private
   * @static
   * @readonly
   */
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

  /**
   * Provides intelligent node recommendations based on user intent and current workflow nodes.
   * It scores nodes based on keyword matching, existing nodes, and workflow patterns.
   * @param {string} intent - The user's intent or goal (e.g., "process webhook data and send to API").
   * @param {any[]} [currentNodes=[]] - An array of nodes currently in the workflow.
   * @returns {Promise<NodeRecommendation[]>} A promise that resolves to an array of sorted node recommendations.
   */
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

  /**
   * Extracts relevant keywords (categories) from a user's intent string.
   * For example, "send an email" would extract "email".
   * @param {string} intent - The user's intent string.
   * @returns {string[]} An array of extracted keyword categories.
   */
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

  /**
   * Gets associated keywords (categories) for a given node definition.
   * These keywords help in matching nodes to user intent.
   * @param {NodeDefinition} node - The node definition object.
   * @returns {string[]} An array of keyword categories associated with the node.
   */
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

  /**
   * Finds workflow patterns that match the given user intent.
   * @param {string} intent - The user's intent string.
   * @returns {WorkflowPattern[]} An array of matching workflow patterns.
   */
  static findMatchingPatterns(intent: string): WorkflowPattern[] {
    return this.WORKFLOW_PATTERNS.filter(pattern => {
      const patternKeywords = pattern.useCase.toLowerCase();
      // Checks if any word (longer than 3 chars) from the intent is present in pattern's use case keywords
      return intent.split(' ').some(word => 
        word.length > 3 && patternKeywords.includes(word)
      );
    });
  }

  /**
   * Suggests a potential workflow structure (a list of node types) based on user intent.
   * It prioritizes matching known workflow patterns; otherwise, it falls back to a basic keyword-based structure.
   * @param {string} intent - The user's intent or goal.
   * @returns {Promise<{suggestedNodes: string[], reasoning: string, pattern?: WorkflowPattern}>}
   * A promise that resolves to an object containing suggested node types, reasoning for the suggestion,
   * and an optional matched workflow pattern.
   */
  static async suggestWorkflowStructure(intent: string): Promise<{
    suggestedNodes: string[];
    reasoning: string;
    pattern?: WorkflowPattern;
  }> {
    const keywords = this.extractKeywords(intent);
    const patterns = this.findMatchingPatterns(intent);
    
    if (patterns.length > 0) {
      const bestPattern = patterns[0]; // Simplistic: take the first matched pattern
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

    // Ensure at least one node is suggested if keywords were found but no specific structure built.
    // This part might need refinement based on desired fallback behavior.
    if (suggestedNodes.length === 0 && keywords.length > 0) {
        // A very generic fallback, perhaps suggest a 'Manual Trigger' or 'Code Node'
        suggestedNodes.push('n8n-nodes-base.manualTrigger');
        reasoning += 'Start with a Manual Trigger or define a starting point. ';
    }


    return {
      suggestedNodes,
      reasoning: reasoning.trim()
    };
  }
}
