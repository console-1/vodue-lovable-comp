
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
 * Handles workflow pattern recognition and matching.
 */
export class PatternRecognizer {
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
   * Finds workflow patterns that match the given user intent.
   * @param {string} intent - The user's intent string.
   * @returns {WorkflowPattern[]} An array of matching workflow patterns.
   */
  static findMatchingPatterns(intent: string): WorkflowPattern[] {
    const intentLower = intent.toLowerCase();
    
    return this.WORKFLOW_PATTERNS.filter(pattern => {
      const patternKeywords = pattern.useCase.toLowerCase();
      // Checks if any word (longer than 3 chars) from the intent is present in pattern's use case keywords
      return intentLower.split(' ').some(word => 
        word.length > 3 && patternKeywords.includes(word)
      );
    });
  }

  /**
   * Calculates pattern-based relevance score for a node type.
   * @param {string} intent - The user's intent string.
   * @param {string} nodeType - The node type to score.
   * @returns {{score: number, reasoning: string}} Score and reasoning for pattern matches.
   */
  static calculatePatternScore(intent: string, nodeType: string): {score: number, reasoning: string} {
    const matchingPatterns = this.findMatchingPatterns(intent);
    let score = 0;
    let reasoning = '';

    for (const pattern of matchingPatterns) {
      if (pattern.nodes.includes(nodeType)) {
        score += 15;
        reasoning += `Part of ${pattern.name} pattern. `;
      }
    }

    return { score, reasoning: reasoning.trim() };
  }

  /**
   * Gets all available workflow patterns.
   * @returns {WorkflowPattern[]} Array of all workflow patterns.
   */
  static getAllPatterns(): WorkflowPattern[] {
    return [...this.WORKFLOW_PATTERNS];
  }
}
