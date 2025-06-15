
import { supabase } from '@/integrations/supabase/client';

interface NodeDefinition {
  id: string;
  name: string;
  display_name: string;
  description: string;
  icon: string;
  default_version: number;
  code_base_version: string;
  node_group: string;
  subtitle: string;
  created_at: string;
  updated_at: string;
}

interface NodeSuggestion {
  node_type: string;
  node_display_name: string;
  compatibility_score: number;
  usage_frequency: number;
  reasoning: string;
}

export class WorkflowArchitect {
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
    
    // Get node recommendations based on intent - using local implementation
    const nodeTypes = suggestedNodes.map(n => n.name);
    const recommendations = await this.getNodeSuggestionsLocal(nodeTypes);
    
    return {
      nodes: nodeTypes,
      flow: this.determineWorkflowFlow(intentKeywords),
      complexity,
      recommendations
    };
  }

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

  private static async getNodeSuggestionsLocal(currentNodes: string[]): Promise<NodeSuggestion[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_workflow_suggestions', { current_node_ids: [] });
      
      if (error) {
        console.error('Error getting node suggestions:', error);
        return this.getMockNodeSuggestions(currentNodes);
      }
      
      const suggestions = (data as any[] || []).map((item: any) => ({
        node_type: item.node_name || 'unknown',
        node_display_name: item.display_name || 'Unknown Node',
        compatibility_score: item.compatibility_score || 0.5,
        usage_frequency: item.usage_popularity || 0.0,
        reasoning: `Compatible with current workflow pattern`
      }));
      
      return suggestions.slice(0, 5);
    } catch (error) {
      console.error('Database error getting suggestions:', error);
      return this.getMockNodeSuggestions(currentNodes);
    }
  }

  private static getMockNodeSuggestions(currentNodes: string[]): NodeSuggestion[] {
    const mockSuggestions = [
      {
        node_type: 'n8n-nodes-base.code',
        node_display_name: 'Code',
        compatibility_score: 0.9,
        usage_frequency: 0.8,
        reasoning: 'Highly versatile for data processing'
      },
      {
        node_type: 'n8n-nodes-base.httpRequest',
        node_display_name: 'HTTP Request',
        compatibility_score: 0.8,
        usage_frequency: 0.7,
        reasoning: 'Essential for API integrations'
      },
      {
        node_type: 'n8n-nodes-base.set',
        node_display_name: 'Edit Fields (Set)',
        compatibility_score: 0.7,
        usage_frequency: 0.6,
        reasoning: 'Useful for data transformation'
      }
    ];

    return mockSuggestions.filter(s => !currentNodes.includes(s.node_type));
  }

  private static assessComplexity(description: string, nodes: NodeDefinition[]): 'simple' | 'medium' | 'complex' {
    const indicators = {
      simple: ['send', 'get', 'fetch', 'simple'],
      medium: ['process', 'transform', 'condition', 'filter'],
      complex: ['multiple', 'complex', 'integration', 'workflow', 'automation']
    };
    
    const lower = description.toLowerCase();
    let complexityScore = nodes.length;
    
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
}
