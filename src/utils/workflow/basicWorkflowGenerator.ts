
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

export class BasicWorkflowGenerator {
  static async generate(description: string, recommendedNodes: NodeDefinition[]): Promise<GeneratedWorkflow> {
    const nodes: any[] = [];
    let xPosition = 240;
    const yPosition = 300;

    // Manual trigger
    const triggerNode = WorkflowUtils.createNode('Manual Trigger', 'n8n-nodes-base.manualTrigger', xPosition, yPosition, {});
    nodes.push(triggerNode);
    xPosition += 220;

    // Basic processing
    const processingNode = WorkflowUtils.createNode('Process Data', 'n8n-nodes-base.code', xPosition, yPosition, {
      jsCode: CodeGenerators.generateBasicProcessingCode(description),
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
