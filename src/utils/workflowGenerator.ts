
// Legacy workflow generator - now using ModernWorkflowGenerator
import { ModernWorkflowGenerator } from './modernWorkflowGenerator';

export class WorkflowGenerator {
  static async generateWorkflow(description: string): Promise<any> {
    console.log('Using modern workflow generator for:', description);
    return ModernWorkflowGenerator.generateWorkflow(description);
  }
}
