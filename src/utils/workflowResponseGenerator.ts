
export class WorkflowResponseGenerator {
  static createIntelligentResponse(result: any): string {
    const { validation, insights } = result;
    
    let response = '✨ I\'ve crafted a sophisticated workflow using VODUE\'s enhanced intelligence system.\n\n';
    
    // Quality assessment
    const qualityScore = validation?.qualityScore || 0;
    if (qualityScore >= 90) {
      response += '🏆 **Exceptional Quality** - This workflow meets enterprise standards with optimal node configuration.\n\n';
    } else if (qualityScore >= 75) {
      response += '✅ **High Quality** - Well-structured workflow with minor optimization opportunities.\n\n';
    } else if (qualityScore >= 60) {
      response += '⚠️ **Good Quality** - Functional workflow with some recommended improvements.\n\n';
    } else {
      response += '🔧 **Needs Refinement** - Basic workflow that would benefit from optimization.\n\n';
    }
    
    // Complexity insights
    if (insights?.complexity) {
      response += `**Complexity Score:** ${insights.complexity.toFixed(1)}/10\n`;
      if (insights.complexity < 3) {
        response += '*This is a streamlined workflow perfect for getting started.*\n';
      } else if (insights.complexity > 7) {
        response += '*This is a sophisticated workflow that handles complex automation scenarios.*\n';
      } else {
        response += '*This workflow strikes a good balance between capability and maintainability.*\n';
      }
      response += '\n';
    }
    
    // Validation summary
    const errorCount = validation?.issues?.filter((i: any) => i.type === 'error').length || 0;
    const warningCount = validation?.issues?.filter((i: any) => i.type === 'warning').length || 0;
    
    if (errorCount === 0 && warningCount === 0) {
      response += '✅ **Perfect Validation** - No issues detected, ready for deployment.\n\n';
    } else if (errorCount === 0) {
      response += `⚠️ **${warningCount} Optimization Suggestion(s)** - Workflow is functional with recommended improvements.\n\n`;
    } else {
      response += `❌ **${errorCount} Issue(s) Detected** - Requires attention before deployment.\n\n`;
    }
    
    // Intelligent recommendations
    if (insights?.recommendations?.length > 0) {
      response += '🧠 **Smart Recommendations:**\n';
      insights.recommendations.slice(0, 3).forEach((rec: string) => {
        response += `• ${rec}\n`;
      });
      response += '\n';
    }
    
    // Optimization suggestions
    if (insights?.optimizations?.length > 0) {
      response += '⚡ **Performance Optimizations:**\n';
      insights.optimizations.forEach((opt: string) => {
        response += `• ${opt}\n`;
      });
      response += '\n';
    }
    
    response += 'The workflow is now ready for review in the preview panel. You can export it to n8n or deploy it for testing.';
    
    return response;
  }
}
