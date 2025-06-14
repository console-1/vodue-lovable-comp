
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

export class DataProcessingWorkflowGenerator {
  static async generate(description: string, recommendedNodes: NodeDefinition[]): Promise<GeneratedWorkflow> {
    const nodes: any[] = [];
    let xPosition = 240;
    const yPosition = 300;

    // Start with webhook or manual trigger
    const triggerNode = WorkflowUtils.createNode('Manual Trigger', 'n8n-nodes-base.manualTrigger', xPosition, yPosition, {});
    nodes.push(triggerNode);
    xPosition += 220;

    // Data input (HTTP Request if API mentioned)
    if (description.toLowerCase().includes('api') || description.toLowerCase().includes('fetch')) {
      const httpNode = WorkflowUtils.createNode('Fetch Data', 'n8n-nodes-base.httpRequest', xPosition, yPosition, {
        url: 'https://api.example.com/data',
        method: 'GET',
        authentication: 'none'
      });
      nodes.push(httpNode);
      xPosition += 220;
    }

    // Main processing with Code node
    const processingNode = WorkflowUtils.createNode('Process Data', 'n8n-nodes-base.code', xPosition, yPosition, {
      jsCode: CodeGenerators.generateAdvancedProcessingCode(description),
      mode: 'runOnceForAllItems'
    });
    nodes.push(processingNode);
    xPosition += 220;

    // Output formatting
    const outputNode = WorkflowUtils.createNode('Format Output', 'n8n-nodes-base.set', xPosition, yPosition, {
      fields: {
        values: [
          {
            name: 'processed_data',
            type: 'stringValue',
            stringValue: '={{ JSON.stringify($json) }}'
          },
          {
            name: 'processing_time',
            type: 'stringValue',
            stringValue: '={{ new Date().toISOString() }}'
          }
        ]
      }
    });
    nodes.push(outputNode);

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
