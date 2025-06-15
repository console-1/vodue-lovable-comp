
/**
 * Manages workflow node connections and formatting
 */
export class ConnectionManager {
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

  static formatNodesForPreview(nodes: any[]): any[] {
    return nodes.map(node => ({
      id: node.id || node.name,
      name: node.name,
      type: node.type.split('.').pop() || node.type,
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
}
