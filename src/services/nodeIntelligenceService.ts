import { NodeService } from './nodeService';

/**
 * Enhanced NodeRecommendation interface that matches our component usage
 */
export interface NodeRecommendation {
  id: string;
  nodeType: string;
  displayName: string;
  description: string;
  reasoning: string;
  relevanceScore: number;
  category?: string;
  deprecated?: boolean;
}

/**
 * Service providing intelligent node recommendations and workflow analysis
 */
export class NodeIntelligenceService {
  /** Cache for node definitions to reduce database calls. */
  private static nodeDefinitionsCache: any[] = [];
  /** Duration for which the cache is considered valid (5 minutes). */
  private static cacheExpiry = 5 * 60 * 1000;
  /** Timestamp of the last cache update. */
  private static lastCacheUpdate = 0;

  /**
   * Gets intelligent node recommendations based on user intent and current workflow state
   */
  static async getIntelligentRecommendations(
    intent: string, 
    currentNodes: any[] = []
  ): Promise<NodeRecommendation[]> {
    console.log('🧠 Getting intelligent recommendations for:', intent);
    
    try {
      const nodeDefinitions = await this.getCachedNodeDefinitions();
      const recommendations: NodeRecommendation[] = [];
      
      // Extract keywords and analyze intent
      const keywords = this.extractKeywords(intent.toLowerCase());
      const intentType = this.analyzeIntentType(intent.toLowerCase());
      
      // Get current node types for context
      const currentNodeTypes = new Set(currentNodes.map(node => node.type || node.nodeType));
      
      for (const nodeDef of nodeDefinitions) {
        const score = this.calculateRelevanceScore(nodeDef, keywords, intentType, currentNodeTypes);
        
        if (score > 5) {
          recommendations.push({
            id: nodeDef.id,
            nodeType: nodeDef.name, // Use 'name' field from database
            displayName: nodeDef.display_name,
            description: nodeDef.description || 'No description available',
            reasoning: this.generateReasoning(nodeDef, keywords, intentType, score),
            relevanceScore: score,
            category: nodeDef.node_group || 'General',
            deprecated: false // Since we don't have this field, default to false
          });
        }
      }
      
      // Sort by relevance and return top recommendations
      return recommendations
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 8);
        
    } catch (error) {
      console.error('Error in getIntelligentRecommendations:', error);
      return this.getFallbackRecommendations();
    }
  }

  /**
   * Suggests a high-level workflow structure based on the user's intent
   */
  static async suggestWorkflowStructure(intent: string): Promise<any> {
    console.log('💡 Suggesting workflow structure for:', intent);
    
    // Simplified logic for suggesting workflow structure
    if (intent.includes('email')) {
      return {
        reasoning: 'Based on your intent, a common pattern involves triggering on new emails, extracting information, and then acting on it.',
        suggestedNodes: ['n8n-nodes-base.imap', 'n8n-nodes-base.itemLists', 'n8n-nodes-base.sendEmail'],
        pattern: { name: 'Email Automation', complexity: 'Intermediate' }
      };
    } else if (intent.includes('webhook')) {
      return {
        reasoning: 'Webhooks are often used to trigger workflows. After receiving data, you might want to transform or store it.',
        suggestedNodes: ['n8n-nodes-base.webhook', 'n8n-nodes-base.set', 'n8n-nodes-base.googleSheets'],
        pattern: { name: 'Webhook Processing', complexity: 'Basic' }
      };
    } else if (intent.includes('data')) {
      return {
        reasoning: 'Data transformation workflows typically involve reading data, manipulating it, and then writing it somewhere else.',
        suggestedNodes: ['n8n-nodes-base.readCsv', 'n8n-nodes-base.itemLists', 'n8n-nodes-base.writeCsv'],
        pattern: { name: 'Data Transformation', complexity: 'Advanced' }
      };
    }
    
    return null;
  }

  /**
   * Extracts keywords from the user's intent
   */
  private static extractKeywords(intent: string): string[] {
    // Basic keyword extraction (can be enhanced with NLP techniques)
    const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'of', 'in', 'to', 'for', 'with']);
    return intent
      .split(/\s+/)
      .filter(word => !stopWords.has(word))
      .slice(0, 5);
  }

  /**
   * Analyzes the type of intent (e.g., trigger, action, data processing)
   */
  private static analyzeIntentType(intent: string): string {
    if (intent.includes('trigger') || intent.includes('when')) {
      return 'trigger';
    } else if (intent.includes('send') || intent.includes('create')) {
      return 'action';
    } else if (intent.includes('process') || intent.includes('transform')) {
      return 'data';
    }
    return 'general';
  }

  /**
   * Checks if the node category matches the intent type
   */
  private static matchesIntentCategory(intentType: string, nodeCategory: string): boolean {
    if (intentType === 'trigger' && nodeCategory.includes('trigger')) {
      return true;
    } else if (intentType === 'action' && nodeCategory.includes('action')) {
      return true;
    } else if (intentType === 'data' && nodeCategory.includes('data')) {
      return true;
    }
    return false;
  }

  /**
   * Checks if a node is commonly used (based on some criteria)
   */
  private static isCommonlyUsedNode(nodeType: string): boolean {
    const commonNodes = new Set(['n8n-nodes-base.set', 'n8n-nodes-base.if', 'n8n-nodes-base.code']);
    return commonNodes.has(nodeType);
  }

  /**
   * Gets fallback recommendations in case of an error
   */
  private static getFallbackRecommendations(): NodeRecommendation[] {
    return [
      {
        id: 'fallback-1',
        nodeType: 'n8n-nodes-base.set',
        displayName: 'Set',
        description: 'Set values for use in a workflow.',
        reasoning: 'A versatile node for setting variables.',
        relevanceScore: 50,
        category: 'Core',
        deprecated: false
      },
      {
        id: 'fallback-2',
        nodeType: 'n8n-nodes-base.if',
        displayName: 'If',
        description: 'Conditionally execute branches in a workflow.',
        reasoning: 'Essential for decision-making in workflows.',
        relevanceScore: 40,
        category: 'Core',
        deprecated: false
      }
    ];
  }

  /**
   * Gets cached node definitions (refreshes if needed)
   */
  private static async getCachedNodeDefinitions(): Promise<any[]> {
    if (this.nodeDefinitionsCache.length === 0 || Date.now() - this.lastCacheUpdate > this.cacheExpiry) {
      console.log('Refreshing node definitions cache...');
      const nodeDefinitions = await NodeService.getNodeDefinitions();
      this.nodeDefinitionsCache = nodeDefinitions;
      this.lastCacheUpdate = Date.now();
    }
    return this.nodeDefinitionsCache;
  }

  /**
   * Calculates relevance score for a node based on intent analysis
   */
  private static calculateRelevanceScore(
    nodeDef: any,
    keywords: string[],
    intentType: string,
    currentNodeTypes: Set<string>
  ): number {
    let score = 0;
    
    const nodeText = `${nodeDef.display_name} ${nodeDef.description || ''}`.toLowerCase();
    
    // Keyword matching
    keywords.forEach(keyword => {
      if (nodeText.includes(keyword)) {
        score += 15;
      }
    });
    
    // Intent type matching
    const nodeCategory = (nodeDef.node_group || '').toLowerCase();
    if (this.matchesIntentCategory(intentType, nodeCategory)) {
      score += 20;
    }
    
    // Avoid duplicates
    if (currentNodeTypes.has(nodeDef.name)) {
      score -= 10;
    }
    
    // Boost commonly used nodes
    if (this.isCommonlyUsedNode(nodeDef.name)) {
      score += 5;
    }
    
    return Math.max(0, score);
  }

  /**
   * Generates reasoning for why a node was recommended
   */
  private static generateReasoning(
    nodeDef: any,
    keywords: string[],
    intentType: string,
    score: number
  ): string {
    const reasons = [];
    
    if (keywords.some(k => nodeDef.display_name.toLowerCase().includes(k))) {
      reasons.push('matches your keywords');
    }
    
    if (this.matchesIntentCategory(intentType, nodeDef.node_group?.toLowerCase() || '')) {
      reasons.push(`fits ${intentType} workflows`);
    }
    
    if (score > 25) {
      reasons.push('highly relevant');
    } else if (score > 15) {
      reasons.push('good match');
    }
    
    return reasons.length > 0 ? 
      `Recommended because it ${reasons.join(' and ')}.` :
      'Suggested based on workflow patterns.';
  }
}
