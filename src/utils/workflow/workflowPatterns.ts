
import { NodeFactory } from './nodeFactory';
import { ConnectionManager } from './connectionManager';
import { CodeGenerator } from './codeGenerator';
import type { GeneratedWorkflow } from '../modernWorkflowGenerator';

/**
 * Pre-built workflow patterns for different use cases
 */
export class WorkflowPatterns {
  static generateWebhookWorkflow(description: string): Omit<GeneratedWorkflow, 'validationResult' | 'recommendations'> {
    const nodes: any[] = [];
    let xPosition = 240;
    const yPosition = 300;

    // Webhook trigger
    const webhookNode = NodeFactory.createNode('Webhook', 'n8n-nodes-base.webhook', xPosition, yPosition, {
      path: this.generateWebhookPath(description),
      httpMethod: this.detectHttpMethod(description),
      responseMode: 'onReceived'
    });
    nodes.push(webhookNode);
    xPosition += 220;

    // Add processing based on description
    if (description.toLowerCase().includes('validate') || description.toLowerCase().includes('check')) {
      const ifNode = NodeFactory.createNode('Validate Input', 'n8n-nodes-base.if', xPosition, yPosition, {
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
      const codeNode = NodeFactory.createNode('Process Data', 'n8n-nodes-base.code', xPosition, yPosition, {
        jsCode: CodeGenerator.generateProcessingCode(description),
        mode: 'runOnceForAllItems'
      });
      nodes.push(codeNode);
      xPosition += 220;
    }

    // Response formatting
    const responseNode = NodeFactory.createNode('Format Response', 'n8n-nodes-base.set', xPosition, yPosition, {
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
      name: this.generateWorkflowName(description),
      nodes,
      connections: ConnectionManager.generateLinearConnections(nodes),
      active: false,
      settings: {}
    };

    return {
      id: Date.now(),
      name: this.generateWorkflowName(description),
      description,
      nodes: ConnectionManager.formatNodesForPreview(nodes),
      connections: ConnectionManager.formatConnectionsForPreview(workflowJson.connections),
      json: workflowJson
    };
  }

  static generateDataProcessingWorkflow(description: string): Omit<GeneratedWorkflow, 'validationResult' | 'recommendations'> {
    const nodes: any[] = [];
    let xPosition = 240;
    const yPosition = 300;

    // Start with webhook or manual trigger
    const triggerNode = NodeFactory.createNode('Manual Trigger', 'n8n-nodes-base.manualTrigger', xPosition, yPosition, {});
    nodes.push(triggerNode);
    xPosition += 220;

    // Data input (HTTP Request if API mentioned)
    if (description.toLowerCase().includes('api') || description.toLowerCase().includes('fetch')) {
      const httpNode = NodeFactory.createNode('Fetch Data', 'n8n-nodes-base.httpRequest', xPosition, yPosition, {
        url: 'https://api.example.com/data',
        method: 'GET',
        authentication: 'none'
      });
      nodes.push(httpNode);
      xPosition += 220;
    }

    // Main processing with Code node
    const processingNode = NodeFactory.createNode('Process Data', 'n8n-nodes-base.code', xPosition, yPosition, {
      jsCode: CodeGenerator.generateAdvancedProcessingCode(description),
      mode: 'runOnceForAllItems'
    });
    nodes.push(processingNode);
    xPosition += 220;

    // Output formatting
    const outputNode = NodeFactory.createNode('Format Output', 'n8n-nodes-base.set', xPosition, yPosition, {
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
      name: this.generateWorkflowName(description),
      nodes,
      connections: ConnectionManager.generateLinearConnections(nodes),
      active: false,
      settings: {}
    };

    return {
      id: Date.now(),
      name: this.generateWorkflowName(description),
      description,
      nodes: ConnectionManager.formatNodesForPreview(nodes),
      connections: ConnectionManager.formatConnectionsForPreview(workflowJson.connections),
      json: workflowJson
    };
  }

  static generateConditionalWorkflow(description: string): Omit<GeneratedWorkflow, 'validationResult' | 'recommendations'> {
    const nodes: any[] = [];
    let xPosition = 240;
    const yPosition = 300;

    // Webhook trigger
    const webhookNode = NodeFactory.createNode('Webhook', 'n8n-nodes-base.webhook', xPosition, yPosition, {
      path: this.generateWebhookPath(description),
      httpMethod: 'POST'
    });
    nodes.push(webhookNode);
    xPosition += 220;

    // Condition check
    const ifNode = NodeFactory.createNode('Check Condition', 'n8n-nodes-base.if', xPosition, yPosition, {
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
    const trueBranchNode = NodeFactory.createNode('Handle True Case', 'n8n-nodes-base.set', xPosition, yPosition - 100, {
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
    const falseBranchNode = NodeFactory.createNode('Handle False Case', 'n8n-nodes-base.set', xPosition, yPosition + 100, {
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
      name: this.generateWorkflowName(description),
      nodes,
      connections: ConnectionManager.generateConditionalConnections(nodes),
      active: false,
      settings: {}
    };

    return {
      id: Date.now(),
      name: this.generateWorkflowName(description),
      description,
      nodes: ConnectionManager.formatNodesForPreview(nodes),
      connections: ConnectionManager.formatConnectionsForPreview(workflowJson.connections),
      json: workflowJson
    };
  }

  static generateScheduledWorkflow(description: string): Omit<GeneratedWorkflow, 'validationResult' | 'recommendations'> {
    const nodes: any[] = [];
    let xPosition = 240;
    const yPosition = 300;

    // Cron trigger
    const cronNode = NodeFactory.createNode('Schedule Trigger', 'n8n-nodes-base.cron', xPosition, yPosition, {
      triggerTimes: {
        item: [{ mode: 'everyMinute' }]
      }
    });
    nodes.push(cronNode);
    xPosition += 220;

    // Data fetching if API mentioned
    if (description.toLowerCase().includes('api') || description.toLowerCase().includes('fetch')) {
      const httpNode = NodeFactory.createNode('Fetch Data', 'n8n-nodes-base.httpRequest', xPosition, yPosition, {
        url: 'https://api.example.com/data',
        method: 'GET',
        authentication: 'none'
      });
      nodes.push(httpNode);
      xPosition += 220;
    }

    // Processing
    const processingNode = NodeFactory.createNode('Process Scheduled Task', 'n8n-nodes-base.code', xPosition, yPosition, {
      jsCode: CodeGenerator.generateScheduledProcessingCode(description),
      mode: 'runOnceForAllItems'
    });
    nodes.push(processingNode);

    const workflowJson = {
      name: this.generateWorkflowName(description),
      nodes,
      connections: ConnectionManager.generateLinearConnections(nodes),
      active: false,
      settings: {}
    };

    return {
      id: Date.now(),
      name: this.generateWorkflowName(description),
      description,
      nodes: ConnectionManager.formatNodesForPreview(nodes),
      connections: ConnectionManager.formatConnectionsForPreview(workflowJson.connections),
      json: workflowJson
    };
  }

  static generateBasicWorkflow(description: string): Omit<GeneratedWorkflow, 'validationResult' | 'recommendations'> {
    const nodes: any[] = [];
    let xPosition = 240;
    const yPosition = 300;

    // Manual trigger
    const triggerNode = NodeFactory.createNode('Manual Trigger', 'n8n-nodes-base.manualTrigger', xPosition, yPosition, {});
    nodes.push(triggerNode);
    xPosition += 220;

    // Basic processing
    const processingNode = NodeFactory.createNode('Process Data', 'n8n-nodes-base.code', xPosition, yPosition, {
      jsCode: CodeGenerator.generateBasicProcessingCode(description),
      mode: 'runOnceForAllItems'
    });
    nodes.push(processingNode);

    const workflowJson = {
      name: this.generateWorkflowName(description),
      nodes,
      connections: ConnectionManager.generateLinearConnections(nodes),
      active: false,
      settings: {}
    };

    return {
      id: Date.now(),
      name: this.generateWorkflowName(description),
      description,
      nodes: ConnectionManager.formatNodesForPreview(nodes),
      connections: ConnectionManager.formatConnectionsForPreview(workflowJson.connections),
      json: workflowJson
    };
  }

  // Helper methods
  private static generateWebhookPath(description: string): string {
    const words = description.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(' ')
      .filter(word => word.length > 2)
      .slice(0, 2);
    return words.join('-') || 'webhook';
  }

  private static detectHttpMethod(description: string): string {
    const desc = description.toLowerCase();
    if (desc.includes('post') || desc.includes('create') || desc.includes('submit')) return 'POST';
    if (desc.includes('put') || desc.includes('update')) return 'PUT';
    if (desc.includes('delete') || desc.includes('remove')) return 'DELETE';
    return 'GET';
  }

  private static generateWorkflowName(description: string): string {
    const words = description.split(' ')
      .filter(word => word.length > 2)
      .slice(0, 4)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1));

    return words.join(' ') || 'Generated Workflow';
  }
}
