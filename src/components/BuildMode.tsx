import React, { useState } from 'react';
import { ChatInterface } from './ChatInterface';
import { WorkflowPreview } from './WorkflowPreview';
import { useToast } from '@/hooks/use-toast';
import { EnhancedBuildMode } from '@/utils/enhancedBuildMode';
import { useWorkflows } from '@/hooks/useWorkflows';
import { useAuth } from '@/contexts/AuthContext';

interface WorkflowData {
  id: number;
  name: string;
  description: string;
  nodes: Array<{
    id: string;
    name: string;
    type: string;
    position: [number, number];
  }>;
  connections: Array<{
    from: string;
    to: string;
  }>;
  json: {
    name: string;
    nodes: any[];
    connections: any;
  };
}

interface Message {
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  workflow?: WorkflowData;
}

interface BuildModeProps {
  workflows: any[];
  onWorkflowCreate: (workflows: any[]) => void;
}

export const BuildMode: React.FC<BuildModeProps> = ({ workflows, onWorkflowCreate }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'system',
      content: 'Welcome to VODUE\'s Enhanced Build Mode. I now use advanced n8n node intelligence and database-driven recommendations to craft sophisticated workflows. Describe your automation vision, and I\'ll create an optimized n8n workflow with real-time validation and performance insights.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowData | null>(null);
  const [validationResults, setValidationResults] = useState<any>(null);
  const [workflowInsights, setWorkflowInsights] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { createWorkflow } = useWorkflows();
  const { user } = useAuth();

  const handleSendMessage = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage: Message = {
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);

    try {
      console.log('🎯 Starting enhanced workflow generation...');
      
      // Use enhanced build mode with database intelligence
      const result = await EnhancedBuildMode.generateIntelligentWorkflow(input);
      
      setValidationResults(result.validation);
      setWorkflowInsights(result.insights);
      
      // Create sophisticated response based on results
      let responseContent = this.createIntelligentResponse(result);
      
      const aiResponse: Message = {
        type: 'ai',
        content: responseContent,
        timestamp: new Date(),
        workflow: result.workflow
      };

      setMessages(prev => [...prev, aiResponse]);
      setCurrentWorkflow(result.workflow);
      
    } catch (error) {
      console.error('Enhanced workflow generation error:', error);
      const errorResponse: Message = {
        type: 'ai',
        content: `I encountered an issue while crafting your sophisticated workflow. The error was: ${error.message}. Please try rephrasing your request with more specific details about your automation needs.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsGenerating(false);
    }
  };

  const createIntelligentResponse = (result: any): string => {
    const { validation, insights } = result;
    
    let response = '✨ I\'ve crafted a sophisticated workflow using VODUE\'s enhanced intelligence system.\n\n';
    
    // Quality assessment
    const qualityScore = validation.qualityScore || 0;
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
    if (insights.complexity) {
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
    const errorCount = validation.issues?.filter(i => i.type === 'error').length || 0;
    const warningCount = validation.issues?.filter(i => i.type === 'warning').length || 0;
    
    if (errorCount === 0 && warningCount === 0) {
      response += '✅ **Perfect Validation** - No issues detected, ready for deployment.\n\n';
    } else if (errorCount === 0) {
      response += `⚠️ **${warningCount} Optimization Suggestion(s)** - Workflow is functional with recommended improvements.\n\n`;
    } else {
      response += `❌ **${errorCount} Issue(s) Detected** - Requires attention before deployment.\n\n`;
    }
    
    // Intelligent recommendations
    if (insights.recommendations?.length > 0) {
      response += '🧠 **Smart Recommendations:**\n';
      insights.recommendations.slice(0, 3).forEach(rec => {
        response += `• ${rec}\n`;
      });
      response += '\n';
    }
    
    // Optimization suggestions
    if (insights.optimizations?.length > 0) {
      response += '⚡ **Performance Optimizations:**\n';
      insights.optimizations.forEach(opt => {
        response += `• ${opt}\n`;
      });
      response += '\n';
    }
    
    response += 'The workflow is now ready for review in the preview panel. You can export it to n8n or deploy it for testing.';
    
    return response;
  };

  const handleExportWorkflow = async () => {
    if (!currentWorkflow) return;

    try {
      let workflowToExport = currentWorkflow.json;
      
      // Auto-fix if needed
      if (!validationResults?.isValid) {
        // Apply any available auto-fixes
        const { fixed } = await EnhancedWorkflowValidator.autoFixWorkflow(workflowToExport);
        workflowToExport = fixed;
        toast({
          title: "Workflow Enhanced",
          description: "Applied intelligent optimizations before export.",
        });
      }
      
      const dataStr = JSON.stringify(workflowToExport, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `${currentWorkflow.name.replace(/[^a-z0-9]/gi, '_')}_vodue.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: "Workflow Exported",
        description: "Your intelligent n8n workflow has been exported with VODUE optimizations.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your workflow.",
        variant: "destructive"
      });
    }
  };

  const handleDeployWorkflow = async () => {
    if (!currentWorkflow || !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to deploy workflows.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Save to database using the enhanced workflow data
      const savedWorkflow = await createWorkflow({
        name: currentWorkflow.name,
        description: currentWorkflow.description,
        n8n_json: currentWorkflow.json,
        status: 'deployed',
        is_public: false
      });

      if (savedWorkflow) {
        const newWorkflows = [...workflows, savedWorkflow];
        onWorkflowCreate(newWorkflows);
        
        toast({
          title: "Workflow Deployed",
          description: `"${currentWorkflow.name}" is now live in your VODUE workspace with enhanced intelligence.`,
        });
      }
    } catch (error) {
      console.error('Deploy error:', error);
      toast({
        title: "Deployment Failed",
        description: "There was an error deploying your workflow to the database.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex-1 flex">
      <ChatInterface
        messages={messages}
        input={input}
        validationResults={validationResults}
        onInputChange={setInput}
        onSendMessage={handleSendMessage}
        onExportWorkflow={handleExportWorkflow}
        onDeployWorkflow={handleDeployWorkflow}
        isGenerating={isGenerating}
      />

      {currentWorkflow && (
        <div className="w-96 border-l border-stone-200">
          <WorkflowPreview 
            workflow={currentWorkflow} 
            validationResults={validationResults}
            insights={workflowInsights}
          />
        </div>
      )}
    </div>
  );
};
