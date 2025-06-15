
/**
 * Factory for creating n8n workflow nodes with proper configuration
 */
export class NodeFactory {
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
}
