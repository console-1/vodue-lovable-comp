
import { supabase } from '@/integrations/supabase/client';

interface NodeDefinition {
  id: string;
  name: string;
  display_name: string;
  description: string;
  icon: string;
  default_version: number;
  code_base_version: string;
  node_group: string;
  subtitle: string;
  created_at: string;
  updated_at: string;
}

export class WorkflowBuilder {
  /**
   * Layer 2: The Builder - Smart Assembly
   * Translates architect's blueprint into actual n8n JSON
   */
  static async buildWorkflow(
    name: string,
    description: string,
    blueprint: any
  ): Promise<any> {
    console.log('🔨 Builder Layer: Assembling workflow from blueprint');
    
    const nodes = [];
    const connections: any = {};
    let nodeId = 0;
    
    // Get actual node definitions from database
    const nodeDefinitions = await this.getNodeDefinitions(blueprint.nodes);
    
    // Create trigger node if needed
    if (this.needsTrigger(description)) {
      const webhookNode = await this.createWebhookNode(nodeId++);
      nodes.push(webhookNode);
    }
    
    // Build main processing nodes
    for (const nodeType of blueprint.nodes) {
      const nodeDef = nodeDefinitions.find(n => n.name === nodeType);
      if (nodeDef) {
        const node = await this.createNodeFromDefinition(nodeDef, nodeId++, description);
        nodes.push(node);
      }
    }
    
    // Create connections based on flow logic
    this.createConnections(nodes, connections);
    
    const workflow = {
      id: Math.floor(Math.random() * 1000000),
      name,
      description,
      nodes: nodes.map((node, index) => ({
        ...node,
        position: [100 + (index * 200), 100 + (index % 2) * 150]
      })),
      connections,
      json: {
        name,
        nodes,
        connections,
        active: false,
        settings: {},
        staticData: null
      }
    };
    
    console.log('✅ Builder Layer: Workflow assembled with', nodes.length, 'nodes');
    return workflow;
  }

  private static async getNodeDefinitions(nodeTypes: string[]): Promise<NodeDefinition[]> {
    try {
      const { data, error } = await supabase
        .from('current_node_definitions')
        .select('*')
        .in('name', nodeTypes);
      
      if (error) {
        console.error('Error fetching node definitions:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Database error fetching node definitions:', error);
      return [];
    }
  }

  private static needsTrigger(description: string): boolean {
    const triggerWords = ['webhook', 'receive', 'trigger', 'incoming', 'listen'];
    return triggerWords.some(word => description.toLowerCase().includes(word));
  }

  private static async createWebhookNode(id: number): Promise<any> {
    return {
      id: `webhook_${id}`,
      name: 'Webhook',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2,
      position: [100, 100],
      parameters: {
        path: 'vodue-webhook',
        httpMethod: 'POST',
        responseMode: 'onReceived'
      }
    };
  }

  private static async createNodeFromDefinition(
    nodeDef: NodeDefinition, 
    id: number, 
    context: string
  ): Promise<any> {
    const baseNode = {
      id: `node_${id}`,
      name: nodeDef.display_name,
      type: nodeDef.name,
      typeVersion: nodeDef.default_version || 1,
      position: [100 + (id * 200), 100],
      parameters: {}
    };

    // Add context-specific parameters based on node type
    if (nodeDef.name === 'n8n-nodes-base.code') {
      baseNode.parameters = {
        jsCode: `// Process your data here\nconst items = $input.all();\n\n// Add your logic\nfor (const item of items) {\n  item.json.processed = true;\n  item.json.timestamp = new Date().toISOString();\n}\n\nreturn items;`,
        mode: 'runOnceForAllItems'
      };
    } else if (nodeDef.name === 'n8n-nodes-base.httpRequest') {
      baseNode.parameters = {
        url: '={{$json.url}}',
        method: 'GET',
        authentication: 'none'
      };
    } else if (nodeDef.name === 'n8n-nodes-base.set') {
      baseNode.parameters = {
        fields: {
          values: [
            {
              name: 'processed',
              type: 'booleanValue',
              booleanValue: true
            }
          ]
        }
      };
    }

    return baseNode;
  }

  private static createConnections(nodes: any[], connections: any): void {
    // Create simple linear connections for now
    for (let i = 0; i < nodes.length - 1; i++) {
      const sourceNode = nodes[i];
      const targetNode = nodes[i + 1];
      
      if (!connections[sourceNode.name]) {
        connections[sourceNode.name] = {};
      }
      
      connections[sourceNode.name].main = [[{
        node: targetNode.name,
        type: 'main',
        index: 0
      }]];
    }
  }
}
