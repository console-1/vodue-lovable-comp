
import { N8N_NODE_TYPES, EXAMPLE_WORKFLOWS, type N8nWorkflow, type N8nNode } from '@/data/n8nNodeReference';
import { WorkflowValidator } from './workflowValidator';

export class WorkflowGenerator {
  private static nodeCounter = 0;

  static generateWorkflow(description: string): any {
    const workflow = this.analyzeDescription(description);
    const validatedWorkflow = this.validateAndFix(workflow);
    
    return {
      id: Date.now(),
      name: this.generateWorkflowName(description),
      description,
      nodes: validatedWorkflow.nodes.map(node => ({
        id: node.name,
        name: node.name,
        type: this.getNodeDisplayName(node.type),
        position: node.position
      })),
      connections: this.formatConnectionsForPreview(validatedWorkflow.connections),
      json: validatedWorkflow
    };
  }

  private static analyzeDescription(description: string): N8nWorkflow {
    const lowerDesc = description.toLowerCase();
    
    // Detect workflow type and generate appropriate structure
    if (lowerDesc.includes('webhook') || lowerDesc.includes('api') || lowerDesc.includes('receive')) {
      return this.generateWebhookWorkflow(description);
    } else if (lowerDesc.includes('schedule') || lowerDesc.includes('cron') || lowerDesc.includes('timer')) {
      return this.generateScheduledWorkflow(description);
    } else if (lowerDesc.includes('condition') || lowerDesc.includes('if') || lowerDesc.includes('check')) {
      return this.generateConditionalWorkflow(description);
    } else {
      return this.generateBasicWorkflow(description);
    }
  }

  private static generateWebhookWorkflow(description: string): N8nWorkflow {
    const nodes: N8nNode[] = [];
    let xPosition = 240;
    const yPosition = 300;

    // Webhook trigger
    nodes.push({
      name: 'Webhook',
      type: N8N_NODE_TYPES.WEBHOOK.name,
      typeVersion: N8N_NODE_TYPES.WEBHOOK.typeVersion,
      position: [xPosition, yPosition],
      parameters: {
        ...N8N_NODE_TYPES.WEBHOOK.defaultParameters,
        path: this.generateWebhookPath(description),
        httpMethod: this.detectHttpMethod(description)
      },
      webhookId: `webhook-${++this.nodeCounter}`
    });
    xPosition += 220;

    // Processing logic
    if (description.toLowerCase().includes('process') || description.toLowerCase().includes('transform')) {
      nodes.push({
        name: 'Process Data',
        type: N8N_NODE_TYPES.CODE.name,
        typeVersion: N8N_NODE_TYPES.CODE.typeVersion,
        position: [xPosition, yPosition],
        parameters: {
          ...N8N_NODE_TYPES.CODE.defaultParameters,
          jsCode: this.generateProcessingCode(description)
        }
      });
      xPosition += 220;
    }

    // Response formatting
    nodes.push({
      name: 'Format Response',
      type: N8N_NODE_TYPES.EDIT_FIELDS.name,
      typeVersion: N8N_NODE_TYPES.EDIT_FIELDS.typeVersion,
      position: [xPosition, yPosition],
      parameters: {
        ...N8N_NODE_TYPES.EDIT_FIELDS.defaultParameters,
        fields: {
          values: [
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
      }
    });

    return {
      name: this.generateWorkflowName(description),
      nodes,
      connections: this.generateConnections(nodes),
      active: false,
      settings: {}
    };
  }

  private static generateScheduledWorkflow(description: string): N8nWorkflow {
    const nodes: N8nNode[] = [];
    let xPosition = 240;
    const yPosition = 300;

    // Cron trigger
    nodes.push({
      name: 'Schedule Trigger',
      type: 'n8n-nodes-base.cron',
      typeVersion: 1,
      position: [xPosition, yPosition],
      parameters: {
        triggerTimes: {
          item: [{ mode: 'everyMinute' }]
        }
      }
    });
    xPosition += 220;

    // HTTP Request if API is mentioned
    if (description.toLowerCase().includes('api') || description.toLowerCase().includes('fetch')) {
      nodes.push({
        name: 'Fetch Data',
        type: N8N_NODE_TYPES.HTTP_REQUEST.name,
        typeVersion: N8N_NODE_TYPES.HTTP_REQUEST.typeVersion,
        position: [xPosition, yPosition],
        parameters: {
          ...N8N_NODE_TYPES.HTTP_REQUEST.defaultParameters,
          url: 'https://api.example.com/data',
          method: 'GET'
        }
      });
      xPosition += 220;
    }

    // Processing
    nodes.push({
      name: 'Process Data',
      type: N8N_NODE_TYPES.CODE.name,
      typeVersion: N8N_NODE_TYPES.CODE.typeVersion,
      position: [xPosition, yPosition],
      parameters: {
        ...N8N_NODE_TYPES.CODE.defaultParameters,
        jsCode: this.generateProcessingCode(description)
      }
    });

    return {
      name: this.generateWorkflowName(description),
      nodes,
      connections: this.generateConnections(nodes),
      active: false,
      settings: {}
    };
  }

  private static generateConditionalWorkflow(description: string): N8nWorkflow {
    const nodes: N8nNode[] = [];
    let xPosition = 240;
    const yPosition = 300;

    // Start with webhook
    nodes.push({
      name: 'Webhook',
      type: N8N_NODE_TYPES.WEBHOOK.name,
      typeVersion: N8N_NODE_TYPES.WEBHOOK.typeVersion,
      position: [xPosition, yPosition],
      parameters: {
        ...N8N_NODE_TYPES.WEBHOOK.defaultParameters,
        path: this.generateWebhookPath(description)
      },
      webhookId: `webhook-${++this.nodeCounter}`
    });
    xPosition += 220;

    // Add If condition
    nodes.push({
      name: 'Check Condition',
      type: N8N_NODE_TYPES.IF.name,
      typeVersion: N8N_NODE_TYPES.IF.typeVersion,
      position: [xPosition, yPosition],
      parameters: {
        conditions: {
          options: {
            caseSensitive: true,
            leftValue: '={{ $json.status }}',
            operation: 'equal',
            rightValue: 'active'
          }
        }
      }
    });
    xPosition += 220;

    // True branch
    nodes.push({
      name: 'Handle True',
      type: N8N_NODE_TYPES.EDIT_FIELDS.name,
      typeVersion: N8N_NODE_TYPES.EDIT_FIELDS.typeVersion,
      position: [xPosition, yPosition - 100],
      parameters: {
        ...N8N_NODE_TYPES.EDIT_FIELDS.defaultParameters,
        fields: {
          values: [
            {
              name: 'result',
              type: 'stringValue',
              stringValue: 'Condition met - processing...'
            }
          ]
        }
      }
    });

    // False branch
    nodes.push({
      name: 'Handle False',
      type: N8N_NODE_TYPES.EDIT_FIELDS.name,
      typeVersion: N8N_NODE_TYPES.EDIT_FIELDS.typeVersion,
      position: [xPosition, yPosition + 100],
      parameters: {
        ...N8N_NODE_TYPES.EDIT_FIELDS.defaultParameters,
        fields: {
          values: [
            {
              name: 'result',
              type: 'stringValue',
              stringValue: 'Condition not met - skipping...'
            }
          ]
        }
      }
    });

    return {
      name: this.generateWorkflowName(description),
      nodes,
      connections: this.generateConditionalConnections(nodes),
      active: false,
      settings: {}
    };
  }

  private static generateBasicWorkflow(description: string): N8nWorkflow {
    return EXAMPLE_WORKFLOWS.SIMPLE_DATA_PROCESSING as N8nWorkflow;
  }

  private static generateConnections(nodes: N8nNode[]): Record<string, any> {
    const connections: Record<string, any> = {};
    
    for (let i = 0; i < nodes.length - 1; i++) {
      connections[nodes[i].name] = {
        main: [[{ node: nodes[i + 1].name, type: 'main', index: 0 }]]
      };
    }
    
    return connections;
  }

  private static generateConditionalConnections(nodes: N8nNode[]): Record<string, any> {
    return {
      [nodes[0].name]: {
        main: [[{ node: nodes[1].name, type: 'main', index: 0 }]]
      },
      [nodes[1].name]: {
        main: [
          [{ node: nodes[2].name, type: 'main', index: 0 }],
          [{ node: nodes[3].name, type: 'main', index: 0 }]
        ]
      }
    };
  }

  private static generateWebhookPath(description: string): string {
    const words = description.toLowerCase().split(' ').filter(word => 
      word.length > 3 && !['the', 'and', 'for', 'with', 'that'].includes(word)
    );
    return words.slice(0, 2).join('-') || 'webhook';
  }

  private static detectHttpMethod(description: string): string {
    const desc = description.toLowerCase();
    if (desc.includes('post') || desc.includes('send') || desc.includes('submit')) return 'POST';
    if (desc.includes('put') || desc.includes('update')) return 'PUT';
    if (desc.includes('delete') || desc.includes('remove')) return 'DELETE';
    return 'GET';
  }

  private static generateProcessingCode(description: string): string {
    return `// Process data based on: ${description}
for (const item of $input.all()) {
  // Add your processing logic here
  item.json.processed = true;
  item.json.processedAt = new Date().toISOString();
  item.json.description = "${description}";
}
return $input.all();`;
  }

  private static generateWorkflowName(description: string): string {
    const words = description.split(' ').slice(0, 4);
    return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  private static getNodeDisplayName(nodeType: string): string {
    const nodeTypeMap: Record<string, string> = {
      'n8n-nodes-base.webhook': 'Webhook',
      'n8n-nodes-base.code': 'Code',
      'n8n-nodes-base.set': 'Edit Fields (Set)',
      'n8n-nodes-base.httpRequest': 'HTTP Request',
      'n8n-nodes-base.if': 'If',
      'n8n-nodes-base.switch': 'Switch',
      'n8n-nodes-base.cron': 'Schedule Trigger'
    };
    return nodeTypeMap[nodeType] || nodeType;
  }

  private static formatConnectionsForPreview(connections: Record<string, any>): Array<{from: string, to: string}> {
    const result: Array<{from: string, to: string}> = [];
    
    Object.entries(connections).forEach(([from, connection]) => {
      connection.main?.forEach((connectionArray: any[]) => {
        connectionArray.forEach((conn: any) => {
          result.push({ from, to: conn.node });
        });
      });
    });
    
    return result;
  }

  private static validateAndFix(workflow: N8nWorkflow): N8nWorkflow {
    const validation = WorkflowValidator.validateWorkflow(workflow);
    
    if (!validation.isValid) {
      console.warn('Workflow validation failed:', validation.errors);
      return WorkflowValidator.fixDeprecatedNodes(workflow);
    }
    
    return workflow;
  }
}
