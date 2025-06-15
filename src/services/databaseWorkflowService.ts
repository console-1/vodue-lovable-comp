
import { supabase } from '@/integrations/supabase/client';
import { NodeIntelligenceService } from './nodeIntelligenceService';
import type { WorkflowData, CreateWorkflowInput } from '@/types/workflowTypes';

export class DatabaseWorkflowService {
  /**
   * Generate a workflow using database-driven node intelligence
   */
  static async generateWorkflow(
    userIntent: string,
    userId: string,
    conversationId?: string
  ): Promise<{
    workflow: WorkflowData;
    validation: any;
    insights: any;
  }> {
    try {
      console.log('🔍 Analyzing user intent:', userIntent);
      
      // Get relevant nodes from database
      const nodeRecommendations = await this.getNodeRecommendations(userIntent);
      console.log('📊 Node recommendations:', nodeRecommendations);
      
      // Use node intelligence to build workflow
      const workflowResult = await NodeIntelligenceService.generateWorkflowFromIntent(
        userIntent,
        nodeRecommendations
      );
      
      console.log('🏗️ Generated workflow:', workflowResult);
      
      return workflowResult;
    } catch (error) {
      console.error('❌ Database workflow generation failed:', error);
      throw new Error(`Failed to generate workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get node recommendations from database based on user intent
   */
  private static async getNodeRecommendations(userIntent: string): Promise<any[]> {
    try {
      // Get all available nodes from database
      const { data: nodes, error } = await supabase
        .from('node_definitions')
        .select(`
          *,
          node_parameters (*)
        `)
        .eq('deprecated', false)
        .order('display_name');

      if (error) {
        console.error('❌ Failed to fetch nodes:', error);
        throw new Error(`Database query failed: ${error.message}`);
      }

      if (!nodes || nodes.length === 0) {
        console.warn('⚠️ No nodes found in database, using fallback');
        return this.getFallbackNodes();
      }

      // Filter nodes based on user intent keywords
      const intentKeywords = userIntent.toLowerCase().split(' ');
      const relevantNodes = nodes.filter(node => {
        const searchText = `${node.display_name} ${node.description} ${node.category}`.toLowerCase();
        return intentKeywords.some(keyword => 
          keyword.length > 2 && searchText.includes(keyword)
        );
      });

      console.log('🎯 Found relevant nodes:', relevantNodes.length);
      
      // Return top nodes or all if few relevant ones found
      return relevantNodes.length > 0 ? relevantNodes.slice(0, 10) : nodes.slice(0, 8);
    } catch (error) {
      console.error('❌ Node recommendation query failed:', error);
      return this.getFallbackNodes();
    }
  }

  /**
   * Fallback nodes when database query fails
   */
  private static getFallbackNodes() {
    return [
      {
        node_type: 'n8n-nodes-base.webhook',
        display_name: 'Webhook',
        category: 'Trigger Nodes',
        description: 'Receive HTTP requests',
        parameters_schema: {
          path: { type: 'string', required: true },
          httpMethod: { type: 'options', options: ['GET', 'POST', 'PUT', 'DELETE'] }
        }
      },
      {
        node_type: 'n8n-nodes-base.code',
        display_name: 'Code',
        category: 'Core Nodes',
        description: 'Execute custom JavaScript code',
        parameters_schema: {
          jsCode: { type: 'string', required: true },
          mode: { type: 'options', options: ['runOnceForAllItems', 'runOnceForEachItem'] }
        }
      },
      {
        node_type: 'n8n-nodes-base.httpRequest',
        display_name: 'HTTP Request',
        category: 'Regular Nodes',
        description: 'Make HTTP requests to any URL',
        parameters_schema: {
          url: { type: 'string', required: true },
          method: { type: 'options', options: ['GET', 'POST', 'PUT', 'DELETE'] }
        }
      }
    ];
  }

  /**
   * Save workflow to database with proper relationships
   */
  static async saveWorkflow(
    workflow: WorkflowData,
    userId: string,
    conversationId?: string
  ): Promise<string> {
    try {
      const workflowInput: CreateWorkflowInput = {
        name: workflow.name,
        description: workflow.description,
        n8n_json: workflow.json,
        conversation_id: conversationId,
        status: 'draft',
        is_public: false
      };

      const { data, error } = await supabase
        .from('workflows')
        .insert({
          ...workflowInput,
          user_id: userId
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to save workflow: ${error.message}`);
      }

      console.log('✅ Workflow saved to database:', data.id);
      return data.id;
    } catch (error) {
      console.error('❌ Failed to save workflow:', error);
      throw error;
    }
  }

  /**
   * Get workflow patterns from database for better recommendations
   */
  static async getWorkflowPatterns(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('popular_node_patterns')
        .select('*')
        .limit(10);

      if (error) {
        console.error('❌ Failed to fetch patterns:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Pattern query failed:', error);
      return [];
    }
  }
}
