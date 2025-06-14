
import { PatternRecognizer, type WorkflowPattern } from './patternRecognizer';
import { KeywordAnalyzer } from './keywordAnalyzer';

/**
 * Analyzes and suggests workflow structures based on user intent.
 */
export class WorkflowStructureAnalyzer {
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
    const keywords = KeywordAnalyzer.extractKeywords(intent);
    const patterns = PatternRecognizer.findMatchingPatterns(intent);
    
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
    if (suggestedNodes.length === 0 && keywords.length > 0) {
      suggestedNodes.push('n8n-nodes-base.manualTrigger');
      reasoning += 'Start with a Manual Trigger or define a starting point. ';
    }

    return {
      suggestedNodes,
      reasoning: reasoning.trim()
    };
  }
}
