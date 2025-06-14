
import { NodeRecommender, type NodeRecommendation } from './intelligence/nodeRecommender';
import { WorkflowStructureAnalyzer } from './intelligence/workflowStructureAnalyzer';
import { PatternRecognizer, type WorkflowPattern } from './intelligence/patternRecognizer';
import { KeywordAnalyzer } from './intelligence/keywordAnalyzer';

/**
 * Main service class that coordinates all node intelligence functionality.
 * This acts as a facade for the various intelligence modules.
 */
export class NodeIntelligenceService {
  /**
   * Provides intelligent node recommendations based on user intent and current workflow nodes.
   * @param {string} intent - The user's intent or goal.
   * @param {any[]} [currentNodes=[]] - An array of nodes currently in the workflow.
   * @returns {Promise<NodeRecommendation[]>} A promise that resolves to an array of sorted node recommendations.
   */
  static async getIntelligentRecommendations(
    intent: string, 
    currentNodes: any[] = []
  ): Promise<NodeRecommendation[]> {
    return NodeRecommender.getIntelligentRecommendations(intent, currentNodes);
  }

  /**
   * Extracts relevant keywords from a user's intent string.
   * @param {string} intent - The user's intent string.
   * @returns {string[]} An array of extracted keyword categories.
   */
  static extractKeywords(intent: string): string[] {
    return KeywordAnalyzer.extractKeywords(intent);
  }

  /**
   * Gets associated keywords for a given node type.
   * @param {string} nodeType - The node type.
   * @returns {string[]} An array of keyword categories associated with the node.
   */
  static getNodeKeywords(nodeType: string): string[] {
    return KeywordAnalyzer.getNodeKeywords(nodeType);
  }

  /**
   * Finds workflow patterns that match the given user intent.
   * @param {string} intent - The user's intent string.
   * @returns {WorkflowPattern[]} An array of matching workflow patterns.
   */
  static findMatchingPatterns(intent: string): WorkflowPattern[] {
    return PatternRecognizer.findMatchingPatterns(intent);
  }

  /**
   * Suggests a potential workflow structure based on user intent.
   * @param {string} intent - The user's intent or goal.
   * @returns {Promise<{suggestedNodes: string[], reasoning: string, pattern?: WorkflowPattern}>}
   */
  static async suggestWorkflowStructure(intent: string): Promise<{
    suggestedNodes: string[];
    reasoning: string;
    pattern?: WorkflowPattern;
  }> {
    return WorkflowStructureAnalyzer.suggestWorkflowStructure(intent);
  }
}

// Re-export types for backward compatibility
export type { NodeRecommendation, WorkflowPattern };
