
import type { NodeWithParameters } from '@/types/nodeTypes';

export class NodeModernizationService {
  static async modernizeNode(node: any, nodeDefinition: NodeWithParameters | null): Promise<any | null> {
    if (!nodeDefinition) return null;

    // Handle known deprecated node modernization
    if (node.type === 'n8n-nodes-base.function') {
      const modernNode = { ...node };
      modernNode.type = 'n8n-nodes-base.code';
      modernNode.typeVersion = 2;
      if (node.parameters?.functionCode) {
        modernNode.parameters = { 
          ...node.parameters, 
          jsCode: node.parameters.functionCode, 
          mode: 'runOnceForAllItems' 
        };
        delete modernNode.parameters.functionCode;
      }
      return modernNode;
    }

    return null;
  }
}
