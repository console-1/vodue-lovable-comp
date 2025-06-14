import React, { useState } from 'react';
import { ChatInterface } from './ChatInterface';
import { WorkflowPreview } from './WorkflowPreview';
import { useToast } from '@/hooks/use-toast';
import { WorkflowGenerator } from '@/utils/workflowGenerator';
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
      content: 'Welcome to VODUE. Describe your workflow vision in natural language, and I\'ll craft n8n automation using current node specifications and proper syntax.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowData | null>(null);
  const [validationResults, setValidationResults] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

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
      // Generate workflow using current n8n specifications
      const workflow = await WorkflowGenerator.generateWorkflow(input);
      const validation = await EnhancedWorkflowValidator.validateWorkflowComprehensive(workflow.json);
      
      setValidationResults(validation);
      
      let responseContent = 'I\'ve crafted a sophisticated workflow using current n8n specifications. The automation flows with editorial precision, each node configured with proper syntax.';
      
      const warningCount = validation.issues?.filter(issue => issue.type === 'warning').length || 0;
      if (warningCount > 0) {
        responseContent += `\n\n⚠️ Note: ${warningCount} recommendation(s) for optimal performance.`;
      }
      
      if (!validation.isValid) {
        const errorCount = validation.issues?.filter(i => i.type === 'error').length || 0;
        responseContent += `\n\n❌ Validation found ${errorCount} issue(s) that need attention.`;
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
      console.error('Workflow generation error:', error);
      const errorResponse: Message = {
        type: 'ai',
        content: 'I encountered an issue generating your workflow. Please try rephrasing your request or provide more specific details.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsGenerating(false);
    }
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
      <ChatInterface
        messages={messages}
        input={input}
        validationResults={validationResults}
        onInputChange={setInput}
        onSendMessage={handleSendMessage}
        onExportWorkflow={handleExportWorkflow}
        onDeployWorkflow={handleDeployWorkflow}
      />

      {currentWorkflow && (
        <div className="w-96 border-l border-stone-200">
          <WorkflowPreview workflow={currentWorkflow} validationResults={validationResults} />
        </div>
      )}
    </div>
  );
};
