
import { NodeCacheService } from './nodeCacheService';
import { NodeValidationService } from './nodeValidationService';
import { NodeModernizationService } from './nodeModernizationService';
import { WorkflowTemplateService } from './workflowTemplateService';

// Re-export types and interfaces for backward compatibility
export type { 
  NodeWithParameters, 
  ValidationIssue, 
  WorkflowValidationResult 
} from '@/types/nodeTypes';

/**
 * Main NodeService that delegates to specialized services
 */
export class NodeService {
  // Cache management
  static async getNodeDefinitions() {
    return NodeCacheService.getNodeDefinitions();
  }

  static async getNodeDefinition(nodeName: string) {
    return NodeCacheService.getNodeDefinition(nodeName);
  }

  static async refreshCacheIfNeeded() {
    return NodeCacheService.refreshCacheIfNeeded();
  }

  static async loadNodeDefinitions() {
    return NodeCacheService.loadNodeDefinitions();
  }

  // Validation
  static async validateWorkflow(workflow: any) {
    return NodeValidationService.validateWorkflow(workflow);
  }

  static async validateNode(node: any) {
    return NodeValidationService.validateNode(node);
  }

  static async validateNodeParameters(node: any, nodeDefinition: any) {
    return NodeValidationService.validateNodeParameters(node, nodeDefinition);
  }

  static validateParameterValue(value: any, parameter: any) {
    return NodeValidationService.validateParameterValue(value, parameter);
  }

  static validateConnections(workflow: any) {
    return NodeValidationService.validateConnections(workflow);
  }

  static async suggestImprovements(workflow: any) {
    return NodeValidationService.suggestImprovements(workflow);
  }

  // Modernization
  static async modernizeNode(node: any, nodeDefinition: any) {
    return NodeModernizationService.modernizeNode(node, nodeDefinition);
  }

  // Template management
  static async saveWorkflowAsTemplate(
    name: string,
    description: string,
    workflow: any,
    category: string,
    tags: string[] = [],
    useCase?: string,
    difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner',
    isPublic: boolean = false
  ) {
    return WorkflowTemplateService.saveWorkflowAsTemplate(
      name, description, workflow, category, tags, useCase, difficulty, isPublic
    );
  }
}
