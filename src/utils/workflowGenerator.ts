
import { EnhancedBuildMode } from './enhancedBuildMode';

export class WorkflowGenerator {
  static async generateWorkflow(description: string): Promise<any> {
    console.log('🔄 Legacy workflow generator redirecting to Enhanced Build Mode for:', description);
    
    try {
      // Use the new enhanced build mode
      const result = await EnhancedBuildMode.generateIntelligentWorkflow(description);
      
      // Return in the expected legacy format for compatibility
      return {
        ...result.workflow,
        validation: result.validation,
        insights: result.insights
      };
    } catch (error) {
      console.error('Enhanced workflow generation failed, falling back to basic generation:', error);
      
      // Fallback to basic workflow structure
      return this.generateBasicWorkflow(description);
    }
  }
  
  private static generateBasicWorkflow(description: string): any {
    console.log('⚠️ Using basic fallback workflow generation');
    
    const name = description.substring(0, 30).trim() || 'Basic Workflow';
    
    return {
      id: Math.floor(Math.random() * 1000000),
      name,
      description,
      nodes: [
        {
          id: 'webhook_0',
          name: 'Webhook',
          type: 'n8n-nodes-base.webhook',
          position: [100, 100]
        },
        {
          id: 'code_1',
          name: 'Process Data',
          type: 'n8n-nodes-base.code',
          position: [300, 100]
        }
      ],
      connections: [
        {
          from: 'webhook_0',
          to: 'code_1'
        }
      ],
      json: {
        name,
        nodes: [
          {
            id: 'webhook_0',
            name: 'Webhook',
            type: 'n8n-nodes-base.webhook',
            parameters: {
              path: 'basic-webhook',
              httpMethod: 'POST'
            }
          },
          {
            id: 'code_1',
            name: 'Process Data',
            type: 'n8n-nodes-base.code',
            parameters: {
              jsCode: '// Basic data processing\nreturn $input.all();'
            }
          }
        ],
        connections: {
          'Webhook': {
            main: [[{
              node: 'Process Data',
              type: 'main',
              index: 0
            }]]
          }
        }
      }
    };
  }
}
