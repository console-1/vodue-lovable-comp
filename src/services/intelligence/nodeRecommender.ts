
import { NodeService } from '../nodeService';
import { KeywordAnalyzer } from './keywordAnalyzer';
import { PatternRecognizer } from './patternRecognizer';
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
 * Generates intelligent node recommendations based on user intent and context.
 */
export class NodeRecommender {
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
    
    const currentNodeTypes = new Set(currentNodes.map(node => node.type));

    // Score nodes based on intent keywords and patterns
    for (const node of allNodes) {
      if (node.deprecated) continue;
      
      let relevanceScore = 0;
      let reasoning = '';

      // Keyword-based scoring
      const keywordResult = KeywordAnalyzer.calculateKeywordScore(intent, node.node_type);
      relevanceScore += keywordResult.score;
      reasoning += keywordResult.reasoning;

      // Boost score for missing node types that are commonly needed
      if (!currentNodeTypes.has(node.node_type)) {
        relevanceScore += 5;
        reasoning += reasoning ? ' Adds new capability. ' : 'Adds new capability. ';
      }

      // Pattern matching
      const patternResult = PatternRecognizer.calculatePatternScore(intent, node.node_type);
      relevanceScore += patternResult.score;
      if (patternResult.reasoning) {
        reasoning += reasoning ? ' ' + patternResult.reasoning : patternResult.reasoning;
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
}
