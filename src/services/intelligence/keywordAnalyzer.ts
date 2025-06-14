
/**
 * Handles keyword extraction and analysis for node intelligence.
 */
export class KeywordAnalyzer {
  /**
   * Mapping of keyword categories to related terms.
   * @private
   * @static
   * @readonly
   */
  private static readonly KEYWORD_MAP = {
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

  /**
   * Node type to keyword mapping for better matching.
   * @private
   * @static
   * @readonly
   */
  private static readonly NODE_KEYWORD_MAP: Record<string, string[]> = {
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

  /**
   * Extracts relevant keywords (categories) from a user's intent string.
   * For example, "send an email" would extract "email".
   * @param {string} intent - The user's intent string.
   * @returns {string[]} An array of extracted keyword categories.
   */
  static extractKeywords(intent: string): string[] {
    const keywords: string[] = [];
    const intentLower = intent.toLowerCase();
    
    for (const [category, terms] of Object.entries(this.KEYWORD_MAP)) {
      if (terms.some(term => intentLower.includes(term))) {
        keywords.push(category);
      }
    }
    return keywords;
  }

  /**
   * Gets associated keywords (categories) for a given node type.
   * These keywords help in matching nodes to user intent.
   * @param {string} nodeType - The node type (e.g., 'n8n-nodes-base.webhook').
   * @returns {string[]} An array of keyword categories associated with the node.
   */
  static getNodeKeywords(nodeType: string): string[] {
    return this.NODE_KEYWORD_MAP[nodeType] || [];
  }

  /**
   * Calculates keyword-based relevance score for a node against user intent.
   * @param {string} intent - The user's intent string.
   * @param {string} nodeType - The node type to score.
   * @returns {{score: number, reasoning: string}} Score and reasoning for the match.
   */
  static calculateKeywordScore(intent: string, nodeType: string): {score: number, reasoning: string} {
    const intentKeywords = this.extractKeywords(intent.toLowerCase());
    const nodeKeywords = this.getNodeKeywords(nodeType);
    
    let score = 0;
    let reasoning = '';

    for (const keyword of intentKeywords) {
      if (nodeKeywords.includes(keyword)) {
        score += 10;
        reasoning += `Matches "${keyword}" requirement. `;
      }
    }

    return { score, reasoning: reasoning.trim() };
  }
}
