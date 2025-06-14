
import { NodeService } from '@/services/nodeService';
import { EnhancedWorkflowValidator } from './enhancedWorkflowValidator';
import type { Database } from '@/integrations/supabase/types';

type NodeDefinition = Database['public']['Tables']['node_definitions']['Row'];

export interface GeneratedWorkflow {
  id: number;
  name: string;
  description: string;
  nodes: any[];
  connections: any;
  json: any;
  validationResult?: any;
  recommendations?: string[];
}

export class ModernWorkflowGenerator {
  private static nodeCounter = 0;

  static async generateWorkflow(description: string): Promise<GeneratedWorkflow> {
    console.log('Generating workflow for:', description);
    
    // Get node recommendations first
    const recommendedNodes = await NodeService.recommendNodes(description);
    console.log('Recommended nodes:', recommendedNodes);
    
    // Generate workflow structure based on description and recommendations
    const workflow = await this.analyzeAndGenerate(description, recommendedNodes);
    
    // Validate the generated workflow
    const validationResult = await EnhancedWorkflowValidator.validateWorkflowComprehensive(workflow.json);
    
    // Auto-fix if needed
    if (!validationResult.isValid) {
      const { fixed } = await EnhancedWorkflowValidator.autoFixWorkflow(workflow.json);
      workflow.json = fixed;
    }
    
    return {
      ...workflow,
      validationResult,
      recommendations: validationResult.recommendations
    };
  }

  private static async analyzeAndGenerate(description: string, recommendedNodes: NodeDefinition[]): Promise<Omit<GeneratedWorkflow, 'validationResult' | 'recommendations'>> {
    const lowerDesc = description.toLowerCase();
    
    // Determine workflow type and generate appropriate structure
    if (this.isWebhookWorkflow(lowerDesc)) {
      return this.generateWebhookWorkflow(description, recommendedNodes);
    } else if (this.isScheduledWorkflow(lowerDesc)) {
      return this.generateScheduledWorkflow(description, recommendedNodes);
    } else if (this.isConditionalWorkflow(lowerDesc)) {
      return this.generateConditionalWorkflow(description, recommendedNodes);
    } else if (this.isDataProcessingWorkflow(lowerDesc)) {
      return this.generateDataProcessingWorkflow(description, recommendedNodes);
    } else {
      return this.generateBasicWorkflow(description, recommendedNodes);
    }
  }

  private static isWebhookWorkflow(description: string): boolean {
    return /webhook|api|receive|endpoint|trigger/i.test(description);
  }

  private static isScheduledWorkflow(description: string): boolean {
    return /schedule|cron|timer|daily|hourly|periodic/i.test(description);
  }

  private static isConditionalWorkflow(description: string): boolean {
    return /condition|if|when|check|validate|filter/i.test(description);
  }

  private static isDataProcessingWorkflow(description: string): boolean {
    return /process|transform|convert|format|parse|extract/i.test(description);
  }

  private static async generateWebhookWorkflow(description: string, recommendedNodes: NodeDefinition[]): Promise<Omit<GeneratedWorkflow, 'validationResult' | 'recommendations'>> {
    const nodes: any[] = [];
    let xPosition = 240;
    const yPosition = 300;

    // Webhook trigger
    const webhookNode = this.createNode('Webhook', 'n8n-nodes-base.webhook', xPosition, yPosition, {
      path: this.generateWebhookPath(description),
      httpMethod: this.detectHttpMethod(description),
      responseMode: 'onReceived'
    });
    nodes.push(webhookNode);
    xPosition += 220;

    // Add processing based on description
    if (description.toLowerCase().includes('validate') || description.toLowerCase().includes('check')) {
      const ifNode = this.createNode('Validate Input', 'n8n-nodes-base.if', xPosition, yPosition, {
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
      const codeNode = this.createNode('Process Data', 'n8n-nodes-base.code', xPosition, yPosition, {
        jsCode: this.generateProcessingCode(description),
        mode: 'runOnceForAllItems'
      });
      nodes.push(codeNode);
      xPosition += 220;
    }

    // Response formatting
    const responseNode = this.createNode('Format Response', 'n8n-nodes-base.set', xPosition, yPosition, {
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
      connections: this.generateLinearConnections(nodes),
      active: false,
      settings: {}
    };

    return {
      id: Date.now(),
      name: this.generateWorkflowName(description),
      description,
      nodes: this.formatNodesForPreview(nodes),
      connections: this.formatConnectionsForPreview(workflowJson.connections),
      json: workflowJson
    };
  }

  private static async generateDataProcessingWorkflow(description: string, recommendedNodes: NodeDefinition[]): Promise<Omit<GeneratedWorkflow, 'validationResult' | 'recommendations'>> {
    const nodes: any[] = [];
    let xPosition = 240;
    const yPosition = 300;

    // Start with webhook or manual trigger
    const triggerNode = this.createNode('Manual Trigger', 'n8n-nodes-base.manualTrigger', xPosition, yPosition, {});
    nodes.push(triggerNode);
    xPosition += 220;

    // Data input (HTTP Request if API mentioned)
    if (description.toLowerCase().includes('api') || description.toLowerCase().includes('fetch')) {
      const httpNode = this.createNode('Fetch Data', 'n8n-nodes-base.httpRequest', xPosition, yPosition, {
        url: 'https://api.example.com/data',
        method: 'GET',
        authentication: 'none'
      });
      nodes.push(httpNode);
      xPosition += 220;
    }

    // Main processing with Code node
    const processingNode = this.createNode('Process Data', 'n8n-nodes-base.code', xPosition, yPosition, {
      jsCode: this.generateAdvancedProcessingCode(description),
      mode: 'runOnceForAllItems'
    });
    nodes.push(processingNode);
    xPosition += 220;

    // Output formatting
    const outputNode = this.createNode('Format Output', 'n8n-nodes-base.set', xPosition, yPosition, {
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
      connections: this.generateLinearConnections(nodes),
      active: false,
      settings: {}
    };

    return {
      id: Date.now(),
      name: this.generateWorkflowName(description),
      description,
      nodes: this.formatNodesForPreview(nodes),
      connections: this.formatConnectionsForPreview(workflowJson.connections),
      json: workflowJson
    };
  }

  private static async generateConditionalWorkflow(description: string, recommendedNodes: NodeDefinition[]): Promise<Omit<GeneratedWorkflow, 'validationResult' | 'recommendations'>> {
    const nodes: any[] = [];
    let xPosition = 240;
    const yPosition = 300;

    // Webhook trigger
    const webhookNode = this.createNode('Webhook', 'n8n-nodes-base.webhook', xPosition, yPosition, {
      path: this.generateWebhookPath(description),
      httpMethod: 'POST'
    });
    nodes.push(webhookNode);
    xPosition += 220;

    // Condition check
    const ifNode = this.createNode('Check Condition', 'n8n-nodes-base.if', xPosition, yPosition, {
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
    const trueBranchNode = this.createNode('Handle True Case', 'n8n-nodes-base.set', xPosition, yPosition - 100, {
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
    const falseBranchNode = this.createNode('Handle False Case', 'n8n-nodes-base.set', xPosition, yPosition + 100, {
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
      connections: this.generateConditionalConnections(nodes),
      active: false,
      settings: {}
    };

    return {
      id: Date.now(),
      name: this.generateWorkflowName(description),
      description,
      nodes: this.formatNodesForPreview(nodes),
      connections: this.formatConnectionsForPreview(workflowJson.connections),
      json: workflowJson
    };
  }

  private static async generateScheduledWorkflow(description: string, recommendedNodes: NodeDefinition[]): Promise<Omit<GeneratedWorkflow, 'validationResult' | 'recommendations'>> {
    const nodes: any[] = [];
    let xPosition = 240;
    const yPosition = 300;

    // Cron trigger
    const cronNode = this.createNode('Schedule Trigger', 'n8n-nodes-base.cron', xPosition, yPosition, {
      triggerTimes: {
        item: [{ mode: 'everyMinute' }]
      }
    });
    nodes.push(cronNode);
    xPosition += 220;

    // Data fetching if API mentioned
    if (description.toLowerCase().includes('api') || description.toLowerCase().includes('fetch')) {
      const httpNode = this.createNode('Fetch Data', 'n8n-nodes-base.httpRequest', xPosition, yPosition, {
        url: 'https://api.example.com/data',
        method: 'GET',
        authentication: 'none'
      });
      nodes.push(httpNode);
      xPosition += 220;
    }

    // Processing
    const processingNode = this.createNode('Process Scheduled Task', 'n8n-nodes-base.code', xPosition, yPosition, {
      jsCode: this.generateScheduledProcessingCode(description),
      mode: 'runOnceForAllItems'
    });
    nodes.push(processingNode);

    const workflowJson = {
      name: this.generateWorkflowName(description),
      nodes,
      connections: this.generateLinearConnections(nodes),
      active: false,
      settings: {}
    };

    return {
      id: Date.now(),
      name: this.generateWorkflowName(description),
      description,
      nodes: this.formatNodesForPreview(nodes),
      connections: this.formatConnectionsForPreview(workflowJson.connections),
      json: workflowJson
    };
  }

  private static async generateBasicWorkflow(description: string, recommendedNodes: NodeDefinition[]): Promise<Omit<GeneratedWorkflow, 'validationResult' | 'recommendations'>> {
    const nodes: any[] = [];
    let xPosition = 240;
    const yPosition = 300;

    // Manual trigger
    const triggerNode = this.createNode('Manual Trigger', 'n8n-nodes-base.manualTrigger', xPosition, yPosition, {});
    nodes.push(triggerNode);
    xPosition += 220;

    // Basic processing
    const processingNode = this.createNode('Process Data', 'n8n-nodes-base.code', xPosition, yPosition, {
      jsCode: this.generateBasicProcessingCode(description),
      mode: 'runOnceForAllItems'
    });
    nodes.push(processingNode);

    const workflowJson = {
      name: this.generateWorkflowName(description),
      nodes,
      connections: this.generateLinearConnections(nodes),
      active: false,
      settings: {}
    };

    return {
      id: Date.now(),
      name: this.generateWorkflowName(description),
      description,
      nodes: this.formatNodesForPreview(nodes),
      connections: this.formatConnectionsForPreview(workflowJson.connections),
      json: workflowJson
    };
  }

  // Helper methods
  private static createNode(name: string, type: string, x: number, y: number, parameters: any): any {
    return {
      name,
      type,
      typeVersion: this.getNodeTypeVersion(type),
      position: [x, y],
      parameters,
      id: `${name.replace(/\s+/g, '')}_${++this.nodeCounter}`
    };
  }

  private static getNodeTypeVersion(nodeType: string): number {
    const versionMap: Record<string, number> = {
      'n8n-nodes-base.webhook': 2,
      'n8n-nodes-base.code': 2,
      'n8n-nodes-base.set': 3,
      'n8n-nodes-base.httpRequest': 4,
      'n8n-nodes-base.if': 2,
      'n8n-nodes-base.switch': 3,
      'n8n-nodes-base.cron': 1,
      'n8n-nodes-base.manualTrigger': 1
    };
    return versionMap[nodeType] || 1;
  }

  private static generateLinearConnections(nodes: any[]): Record<string, any> {
    const connections: Record<string, any> = {};
    
    for (let i = 0; i < nodes.length - 1; i++) {
      connections[nodes[i].name] = {
        main: [[{ node: nodes[i + 1].name, type: 'main', index: 0 }]]
      };
    }
    
    return connections;
  }

  private static generateConditionalConnections(nodes: any[]): Record<string, any> {
    const connections: Record<string, any> = {};
    
    // Connect first to second node
    if (nodes.length >= 2) {
      connections[nodes[0].name] = {
        main: [[{ node: nodes[1].name, type: 'main', index: 0 }]]
      };
    }
    
    // Connect If node to both branches
    if (nodes.length >= 4) {
      connections[nodes[1].name] = {
        main: [
          [{ node: nodes[2].name, type: 'main', index: 0 }], // True branch
          [{ node: nodes[3].name, type: 'main', index: 0 }]  // False branch
        ]
      };
    }
    
    return connections;
  }

  private static formatNodesForPreview(nodes: any[]): any[] {
    return nodes.map(node => ({
      id: node.id || node.name,
      name: node.name,
      type: this.getNodeDisplayName(node.type),
      position: node.position
    }));
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

  private static getNodeDisplayName(nodeType: string): string {
    const displayNames: Record<string, string> = {
      'n8n-nodes-base.webhook': 'Webhook',
      'n8n-nodes-base.code': 'Code',
      'n8n-nodes-base.set': 'Edit Fields (Set)',
      'n8n-nodes-base.httpRequest': 'HTTP Request',
      'n8n-nodes-base.if': 'If',
      'n8n-nodes-base.switch': 'Switch',
      'n8n-nodes-base.cron': 'Schedule Trigger',
      'n8n-nodes-base.manualTrigger': 'Manual Trigger'
    };
    return displayNames[nodeType] || nodeType.split('.').pop() || nodeType;
  }

  // Code generation methods
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

  private static generateProcessingCode(description: string): string {
    return `// Process webhook data for: ${description}
for (const item of $input.all()) {
  // Validate input
  if (!item.json || typeof item.json !== 'object') {
    item.json = { error: 'Invalid input data' };
    continue;
  }
  
  // Add processing timestamp
  item.json.processed_at = new Date().toISOString();
  item.json.workflow_description = "${description}";
  
  // Add your custom processing logic here
  console.log('Processing item:', item.json);
}

return $input.all();`;
  }

  private static generateAdvancedProcessingCode(description: string): string {
    return `// Advanced data processing for: ${description}
const processedItems = [];

for (const item of $input.all()) {
  try {
    // Create processed version of the item
    const processed = {
      original: item.json,
      processed_at: new Date().toISOString(),
      description: "${description}",
      processing_steps: []
    };
    
    // Step 1: Data validation
    if (item.json && typeof item.json === 'object') {
      processed.processing_steps.push('validation_passed');
      
      // Step 2: Data transformation
      processed.transformed_data = {
        ...item.json,
        enhanced: true,
        processing_id: Math.random().toString(36).substr(2, 9)
      };
      processed.processing_steps.push('transformation_complete');
      
      // Step 3: Add metadata
      processed.metadata = {
        keys_count: Object.keys(item.json).length,
        has_arrays: Object.values(item.json).some(val => Array.isArray(val)),
        data_size_estimate: JSON.stringify(item.json).length
      };
      processed.processing_steps.push('metadata_added');
      
    } else {
      processed.error = 'Invalid input format';
      processed.processing_steps.push('validation_failed');
    }
    
    processedItems.push({ json: processed });
    
  } catch (error) {
    processedItems.push({ 
      json: { 
        error: error.message,
        original: item.json,
        processing_failed_at: new Date().toISOString()
      }
    });
  }
}

return processedItems;`;
  }

  private static generateScheduledProcessingCode(description: string): string {
    return `// Scheduled task processing for: ${description}
const taskResults = [];

console.log('Starting scheduled task:', "${description}");
console.log('Execution time:', new Date().toISOString());

for (const item of $input.all()) {
  const taskResult = {
    task_id: Math.random().toString(36).substr(2, 9),
    execution_time: new Date().toISOString(),
    description: "${description}",
    input_data: item.json || {},
    status: 'pending'
  };
  
  try {
    // Simulate task processing
    taskResult.processing_start = new Date().toISOString();
    
    // Add your scheduled task logic here
    // Example: Check conditions, process data, send notifications, etc.
    
    taskResult.result = {
      processed: true,
      message: 'Scheduled task completed successfully'
    };
    taskResult.status = 'completed';
    
  } catch (error) {
    taskResult.error = error.message;
    taskResult.status = 'failed';
  }
  
  taskResult.processing_end = new Date().toISOString();
  taskResults.push({ json: taskResult });
}

console.log('Scheduled task completed. Results:', taskResults.length);
return taskResults;`;
  }

  private static generateBasicProcessingCode(description: string): string {
    return `// Basic processing for: ${description}
for (const item of $input.all()) {
  // Basic data processing
  item.json.processed = true;
  item.json.processed_at = new Date().toISOString();
  item.json.description = "${description}";
  
  // Add your custom logic here
  console.log('Processing:', item.json);
}

return $input.all();`;
  }

  private static generateWorkflowName(description: string): string {
    const words = description.split(' ')
      .filter(word => word.length > 2)
      .slice(0, 4)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1));
    
    return words.join(' ') || 'Generated Workflow';
  }
}
