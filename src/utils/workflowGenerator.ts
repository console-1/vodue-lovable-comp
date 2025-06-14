
// Enhanced workflow generator - now using AdvancedWorkflowGenerator
import { AdvancedWorkflowGenerator } from './advancedWorkflowGenerator';

export class WorkflowGenerator {
  static async generateWorkflow(description: string): Promise<any> {
    console.log('🚀 Using advanced AI-powered workflow generator for:', description);
    return AdvancedWorkflowGenerator.generateWorkflow(description);
  }
}
