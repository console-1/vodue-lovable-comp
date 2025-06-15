
import React from 'react';
import { ChatInterface } from './ChatInterface';
import { WorkflowPreview } from './WorkflowPreview';
import { useToast } from '@/hooks/use-toast';
import { useWorkflowChat } from '@/hooks/useWorkflowChat';
import { WorkflowOperationsService } from '@/services/workflowOperationsService';
import { useWorkflows } from '@/hooks/useWorkflows';
import { useAuth } from '@/contexts/AuthContext';
import type { Workflow } from '@/types/workflowTypes';

interface BuildModeProps {
  workflows: Workflow[];
  onWorkflowCreate: (workflows: Workflow[]) => void;
}

export const BuildMode: React.FC<BuildModeProps> = ({ workflows, onWorkflowCreate }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { createWorkflow } = useWorkflows();

  const {
    messages,
    input,
    setInput,
    currentWorkflow,
    validationResults,
    isGenerating,
    handleSendMessage
  } = useWorkflowChat();

  const onSendMessage = () => {
    handleSendMessage(input);
  };

  const handleExportWorkflow = async () => {
    if (!currentWorkflow) return;

    await WorkflowOperationsService.exportWorkflow(
      currentWorkflow,
      validationResults,
      (message) => toast({
        title: "Workflow Exported",
        description: message,
      }),
      (message) => toast({
        title: "Export Failed",
        description: message,
        variant: "destructive"
      })
    );
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

    await WorkflowOperationsService.deployWorkflow(
      currentWorkflow,
      user.id,
      workflows,
      onWorkflowCreate,
      (message) => toast({
        title: "Workflow Deployed",
        description: message,
      }),
      (message) => toast({
        title: "Deployment Failed",
        description: message,
        variant: "destructive"
      })
    );
  };

  return (
    <div className="flex-1 flex">
      <ChatInterface
        messages={messages}
        input={input}
        validationResults={validationResults}
        onInputChange={setInput}
        onSendMessage={onSendMessage}
        onExportWorkflow={handleExportWorkflow}
        onDeployWorkflow={handleDeployWorkflow}
      />

      {currentWorkflow && (
        <div className="w-96 border-l border-stone-200">
          <WorkflowPreview 
            workflow={currentWorkflow} 
            validationResults={validationResults}
          />
        </div>
      )}
    </div>
  );
};
