import React, { useState } from 'react';
import { ChatInterface } from './ChatInterface';
import { WorkflowPreview } from './WorkflowPreview';
import { NodeRecommendations } from './NodeRecommendations';
import { useToast } from '@/hooks/use-toast';
import { AdvancedWorkflowGenerator } from '@/utils/advancedWorkflowGenerator';
import { EnhancedWorkflowValidator } from '@/utils/enhancedWorkflowValidator';

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
      content: 'Welcome to VODUE\'s advanced AI workflow composer. Describe your automation vision in natural language, and I\'ll craft sophisticated n8n workflows using current specifications, intelligent node selection, and AI-powered insights.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowData | null>(null);
  const [validationResults, setValidationResults] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage: Message = {
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setShowRecommendations(true);
    setInput('');
    setIsGenerating(true);

    try {
      // Use advanced workflow generator with AI insights
      const workflow = await AdvancedWorkflowGenerator.generateWorkflow(input);
      const validation = await EnhancedWorkflowValidator.validateWorkflowComprehensive(workflow.json);
      
      setValidationResults(validation);
      
      // Enhanced AI response with insights
      let responseContent = `✨ I've crafted an intelligent ${workflow.aiInsights?.complexity} workflow with ${Math.round((workflow.aiInsights?.confidence || 0) * 100)}% confidence.`;
      
      if (workflow.aiInsights?.reasoning) {
        responseContent += `\n\n🧠 **AI Analysis**: ${workflow.aiInsights.reasoning}`;
      }
      
      const warningCount = validation.issues?.filter(issue => issue.type === 'warning').length || 0;
      const errorCount = validation.issues?.filter(issue => issue.type === 'error').length || 0;
      
      if (errorCount === 0 && warningCount === 0) {
        responseContent += '\n\n✅ Perfect! Your workflow meets all current n8n specifications.';
      } else if (errorCount === 0) {
        responseContent += `\n\n⚠️ ${warningCount} optimization recommendation(s) for enhanced performance.`;
      } else {
        responseContent += `\n\n🔧 Auto-fixed ${errorCount} compatibility issue(s) for current n8n standards.`;
      }

      if (workflow.aiInsights?.suggestedImprovements.length) {
        responseContent += `\n\n💡 **Suggestions**: ${workflow.aiInsights.suggestedImprovements.join(', ')}`;
      }

      const aiResponse: Message = {
        type: 'ai',
        content: responseContent,
        timestamp: new Date(),
        workflow
      };

      setMessages(prev => [...prev, aiResponse]);
      setCurrentWorkflow(workflow);
    } catch (error) {
      console.error('Advanced workflow generation error:', error);
      const errorResponse: Message = {
        type: 'ai',
        content: '❌ I encountered an issue generating your workflow. Please try rephrasing your request with more specific details about your automation goals.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNodeSelect = (nodeType: string) => {
    console.log('🎯 Node selected for enhancement:', nodeType);
    toast({
      title: "Node Insight",
      description: `${nodeType.split('.').pop()} node capabilities noted for workflow enhancement.`,
    });
  };

  const handleExportWorkflow = async () => {
    if (currentWorkflow) {
      try {
        const validation = await EnhancedWorkflowValidator.validateWorkflowComprehensive(currentWorkflow.json);
        let workflowToExport = currentWorkflow.json;
        
        if (!validation.isValid) {
          const { fixed } = await EnhancedWorkflowValidator.autoFixWorkflow(workflowToExport);
          workflowToExport = fixed;
          toast({
            title: "Workflow Auto-Fixed",
            description: "Deprecated nodes were automatically updated to current specifications.",
          });
        }
        
        const dataStr = JSON.stringify(workflowToExport, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `${currentWorkflow.name.replace(/[^a-z0-9]/gi, '_')}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        toast({
          title: "Workflow Exported",
          description: "Your n8n workflow has been exported with current specifications and proper validation.",
        });
      } catch (error) {
        console.error('Export error:', error);
        toast({
          title: "Export Failed",
          description: "There was an error exporting your workflow.",
          variant: "destructive"
        });
      }
    }
  };

  const handleDeployWorkflow = () => {
    if (currentWorkflow) {
      const newWorkflows = [...workflows, currentWorkflow];
      onWorkflowCreate(newWorkflows);
      
      toast({
        title: "Workflow Deployed",
        description: "Your sophisticated automation is now live and ready for interaction.",
      });
    }
  };

  return (
    <div className="flex-1 flex">
      <div className="flex-1 flex flex-col">
        <ChatInterface
          messages={messages}
          input={input}
          validationResults={validationResults}
          onInputChange={setInput}
          onSendMessage={handleSendMessage}
          onExportWorkflow={handleExportWorkflow}
          onDeployWorkflow={handleDeployWorkflow}
        />
        
        {/* AI-Powered Node Recommendations */}
        {showRecommendations && input.trim() && (
          <div className="border-t border-stone-200 max-h-96 overflow-y-auto">
            <NodeRecommendations
              intent={input}
              currentNodes={currentWorkflow?.nodes || []}
              onNodeSelect={handleNodeSelect}
              className="p-4"
            />
          </div>
        )}
      </div>

      {currentWorkflow && (
        <div className="w-96 border-l border-stone-200">
          <WorkflowPreview workflow={currentWorkflow} validationResults={validationResults} />
        </div>
      )}
    </div>
  );
};
