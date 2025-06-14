
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

export class ConditionalWorkflowGenerator {
  static async generate(description: string, recommendedNodes: NodeDefinition[]): Promise<GeneratedWorkflow> {
    const nodes: any[] = [];
    let xPosition = 240;
    const yPosition = 300;

    // Webhook trigger
    const webhookNode = WorkflowUtils.createNode('Webhook', 'n8n-nodes-base.webhook', xPosition, yPosition, {
      path: CodeGenerators.generateWebhookPath(description),
      httpMethod: 'POST'
    });
    nodes.push(webhookNode);
    xPosition += 220;

    // Condition check
    const ifNode = WorkflowUtils.createNode('Check Condition', 'n8n-nodes-base.if', xPosition, yPosition, {
      conditions: {
        options: {
          caseSensitive: true,
          leftValue: '={{ $json.status }}',
          operation: 'equal',
          rightValue: 'active'
        }
      }
    });
    nodes.push(ifNode);
    xPosition += 220;

    // True branch
    const trueBranchNode = WorkflowUtils.createNode('Handle True Case', 'n8n-nodes-base.set', xPosition, yPosition - 100, {
      fields: {
        values: [
          {
            name: 'result',
            type: 'stringValue',
            stringValue: 'Condition met - processing approved'
          },
          {
            name: 'action',
            type: 'stringValue',
            stringValue: 'approved'
          }
        ]
      }
    });
    nodes.push(trueBranchNode);

    // False branch
    const falseBranchNode = WorkflowUtils.createNode('Handle False Case', 'n8n-nodes-base.set', xPosition, yPosition + 100, {
      fields: {
        values: [
          {
            name: 'result',
            type: 'stringValue',
            stringValue: 'Condition not met - processing rejected'
          },
          {
            name: 'action',
            type: 'stringValue',
            stringValue: 'rejected'
          }
        ]
      }
    });
    nodes.push(falseBranchNode);

    const workflowJson = {
      name: WorkflowUtils.generateWorkflowName(description),
      nodes,
      connections: WorkflowUtils.generateConditionalConnections(nodes),
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
