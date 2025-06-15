
import { WorkflowArchitect } from './workflow/workflowArchitect';
import { WorkflowBuilder } from './workflow/workflowBuilder';
import { WorkflowQualityControl } from './workflow/workflowValidator';

export class DatabaseWorkflowGenerator {
  /**
   * Layer 1: The Architect - Intelligent Planning
   */
  static async analyzeIntent(description: string) {
    return WorkflowArchitect.analyzeIntent(description);
  }

  /**
   * Layer 2: The Builder - Smart Assembly
   */
  static async buildWorkflow(name: string, description: string, blueprint: any) {
    return WorkflowBuilder.buildWorkflow(name, description, blueprint);
  }

  /**
   * Layer 3: Quality Control - Comprehensive Validation
   */
  static async validateAndOptimize(workflow: any) {
    return WorkflowQualityControl.validateAndOptimize(workflow);
  }
}
