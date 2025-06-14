
import { WorkflowUtils } from './workflowUtils';
import { CodeGenerators } from './codeGenerators';
import type { Database } from '@/integrations/supabase/types';

type NodeDefinition = Database['public']['Tables']['node_definitions']['Row'];

export interface GeneratedWorkflow {
  id: number;
  name: string;
  description: string;
  nodes: any[];
  connections: any;
  json: any;
}

export class WebhookWorkflowGenerator {
  static async generate(description: string, recommendedNodes: NodeDefinition[]): Promise<GeneratedWorkflow> {
    const nodes: any[] = [];
    let xPosition = 240;
    const yPosition = 300;

    // Webhook trigger
    const webhookNode = WorkflowUtils.createNode('Webhook', 'n8n-nodes-base.webhook', xPosition, yPosition, {
      path: CodeGenerators.generateWebhookPath(description),
      httpMethod: CodeGenerators.detectHttpMethod(description),
      responseMode: 'onReceived'
    });
    nodes.push(webhookNode);
    xPosition += 220;

    // Add processing based on description
    if (description.toLowerCase().includes('validate') || description.toLowerCase().includes('check')) {
      const ifNode = WorkflowUtils.createNode('Validate Input', 'n8n-nodes-base.if', xPosition, yPosition, {
        conditions: {
          options: {
            caseSensitive: true,
            leftValue: '={{ Object.keys($json).length }}',
            operation: 'larger',
            rightValue: 0
          }
        }
      });
      nodes.push(ifNode);
      xPosition += 220;
    }

    // Add data processing
    if (description.toLowerCase().includes('process') || description.toLowerCase().includes('transform')) {
      const codeNode = WorkflowUtils.createNode('Process Data', 'n8n-nodes-base.code', xPosition, yPosition, {
        jsCode: CodeGenerators.generateProcessingCode(description),
        mode: 'runOnceForAllItems'
      });
      nodes.push(codeNode);
      xPosition += 220;
    }

    // Response formatting
    const responseNode = WorkflowUtils.createNode('Format Response', 'n8n-nodes-base.set', xPosition, yPosition, {
      fields: {
        values: [
          {
            name: 'success',
            type: 'booleanValue',
            booleanValue: true
          },
          {
            name: 'message',
            type: 'stringValue',
            stringValue: 'Request processed successfully'
          },
          {
            name: 'timestamp',
            type: 'stringValue',
            stringValue: '={{ new Date().toISOString() }}'
          }
        ]
      }
    });
    nodes.push(responseNode);

    const workflowJson = {
      name: WorkflowUtils.generateWorkflowName(description),
      nodes,
      connections: WorkflowUtils.generateLinearConnections(nodes),
      active: false,
      settings: {}
    };

    return {
      id: Date.now(),
      name: WorkflowUtils.generateWorkflowName(description),
      description,
      nodes: WorkflowUtils.formatNodesForPreview(nodes),
      connections: WorkflowUtils.formatConnectionsForPreview(workflowJson.connections),
      json: workflowJson
    };
  }
}
