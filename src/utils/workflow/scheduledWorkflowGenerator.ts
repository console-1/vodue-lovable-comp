
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

export class ScheduledWorkflowGenerator {
  static async generate(description: string, recommendedNodes: NodeDefinition[]): Promise<GeneratedWorkflow> {
    const nodes: any[] = [];
    let xPosition = 240;
    const yPosition = 300;

    // Cron trigger
    const cronNode = WorkflowUtils.createNode('Schedule Trigger', 'n8n-nodes-base.cron', xPosition, yPosition, {
      triggerTimes: {
        item: [{ mode: 'everyMinute' }]
      }
    });
    nodes.push(cronNode);
    xPosition += 220;

    // Data fetching if API mentioned
    if (description.toLowerCase().includes('api') || description.toLowerCase().includes('fetch')) {
      const httpNode = WorkflowUtils.createNode('Fetch Data', 'n8n-nodes-base.httpRequest', xPosition, yPosition, {
        url: 'https://api.example.com/data',
        method: 'GET',
        authentication: 'none'
      });
      nodes.push(httpNode);
      xPosition += 220;
    }

    // Processing
    const processingNode = WorkflowUtils.createNode('Process Scheduled Task', 'n8n-nodes-base.code', xPosition, yPosition, {
      jsCode: CodeGenerators.generateScheduledProcessingCode(description),
      mode: 'runOnceForAllItems'
    });
    nodes.push(processingNode);

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
