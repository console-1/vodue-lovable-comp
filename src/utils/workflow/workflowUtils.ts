
export class WorkflowUtils {
  private static nodeCounter = 0;

  static createNode(name: string, type: string, x: number, y: number, parameters: any): any {
    return {
      name,
      type,
      typeVersion: this.getNodeTypeVersion(type),
      position: [x, y],
      parameters,
      id: `${name.replace(/\s+/g, '')}_${++this.nodeCounter}`
    };
  }

  static getNodeTypeVersion(nodeType: string): number {
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

  static generateLinearConnections(nodes: any[]): Record<string, any> {
    const connections: Record<string, any> = {};
    
    for (let i = 0; i < nodes.length - 1; i++) {
      connections[nodes[i].name] = {
        main: [[{ node: nodes[i + 1].name, type: 'main', index: 0 }]]
      };
    }
    
    return connections;
  }

  static generateConditionalConnections(nodes: any[]): Record<string, any> {
    const connections: Record<string, any> = {};
    
    if (nodes.length >= 2) {
      connections[nodes[0].name] = {
        main: [[{ node: nodes[1].name, type: 'main', index: 0 }]]
      };
    }
    
    if (nodes.length >= 4) {
      connections[nodes[1].name] = {
        main: [
          [{ node: nodes[2].name, type: 'main', index: 0 }],
          [{ node: nodes[3].name, type: 'main', index: 0 }]
        ]
      };
    }
    
    return connections;
  }

  static formatNodesForPreview(nodes: any[]): any[] {
    return nodes.map(node => ({
      id: node.id || node.name,
      name: node.name,
      type: this.getNodeDisplayName(node.type),
      position: node.position
    }));
  }

  static formatConnectionsForPreview(connections: Record<string, any>): Array<{from: string, to: string}> {
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

  static getNodeDisplayName(nodeType: string): string {
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

  static generateWorkflowName(description: string): string {
    const words = description.split(' ')
      .filter(word => word.length > 2)
      .slice(0, 4)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1));
    
    return words.join(' ') || 'Generated Workflow';
  }
}
