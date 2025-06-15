
import { DatabaseWorkflowGenerator } from './databaseWorkflowGenerator';
import { EnhancedWorkflowValidator } from './enhancedWorkflowValidator';

export class EnhancedBuildMode {
  static async generateIntelligentWorkflow(description: string): Promise<{
    workflow: any;
    validation: any;
    insights: {
      complexity: number;
      recommendations: string[];
      similarWorkflows: any[];
      optimizations: string[];
    };
  }> {
    console.log('🚀 Enhanced Build Mode: Starting intelligent workflow generation');
    
    try {
      // Phase 1: Architect - Analyze intent and create blueprint
      const blueprint = await DatabaseWorkflowGenerator.analyzeIntent(description);
      console.log('Blueprint created:', blueprint);
      
      // Phase 2: Builder - Generate workflow from blueprint
      const workflow = await DatabaseWorkflowGenerator.buildWorkflow(
        this.generateWorkflowName(description),
        description,
        blueprint
      );
      
      // Phase 3: Quality Control - Validate and optimize
      const qualityCheck = await DatabaseWorkflowGenerator.validateAndOptimize(workflow);
      
      // Enhanced validation using existing validator
      const validation = await EnhancedWorkflowValidator.validateWorkflowComprehensive(workflow.json);
      
      // Get additional insights
      const insights = {
        complexity: qualityCheck.complexity,
        recommendations: blueprint.recommendations.map(r => 
          `${r.node_display_name}: ${r.reasoning} (Score: ${r.compatibility_score})`
        ),
        similarWorkflows: [], // Will be populated when we have workflow data
        optimizations: qualityCheck.optimizations
      };
      
      console.log('✅ Enhanced Build Mode: Workflow generation complete');
      
      return {
        workflow,
        validation: {
          ...validation,
          qualityScore: this.calculateQualityScore(qualityCheck, validation),
          suggestions: [...qualityCheck.optimizations, ...validation.suggestions || []]
        },
        insights
      };
      
    } catch (error) {
      console.error('Enhanced Build Mode error:', error);
      throw new Error(`Failed to generate intelligent workflow: ${error.message}`);
    }
  }
  
  private static generateWorkflowName(description: string): string {
    // Extract key words and create a meaningful name
    const words = description.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !['the', 'and', 'for', 'with'].includes(word))
      .slice(0, 3);
    
    const baseName = words.map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    return baseName || 'Custom Workflow';
  }
  
  private static calculateQualityScore(qualityCheck: any, validation: any): number {
    let score = 100;
    
    // Deduct points for validation errors
    const errors = validation.issues?.filter(i => i.type === 'error').length || 0;
    score -= errors * 20;
    
    // Deduct points for warnings
    const warnings = validation.issues?.filter(i => i.type === 'warning').length || 0;
    score -= warnings * 5;
    
    // Adjust for complexity (optimal range is 3-7)
    const complexity = qualityCheck.complexity || 0;
    if (complexity < 2) score -= 10; // Too simple
    if (complexity > 8) score -= 15; // Too complex
    
    return Math.max(0, Math.min(100, score));
  }
}
