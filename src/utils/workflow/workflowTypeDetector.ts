
/**
 * Analyzes workflow descriptions to determine the appropriate pattern
 */
export class WorkflowTypeDetector {
  static analyzeWorkflowType(description: string): string {
    const lowerDesc = description.toLowerCase();
    
    if (this.isWebhookWorkflow(lowerDesc)) {
      return 'webhook';
    } else if (this.isScheduledWorkflow(lowerDesc)) {
      return 'scheduled';
    } else if (this.isConditionalWorkflow(lowerDesc)) {
      return 'conditional';
    } else if (this.isDataProcessingWorkflow(lowerDesc)) {
      return 'dataProcessing';
    } else {
      return 'basic';
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
}
