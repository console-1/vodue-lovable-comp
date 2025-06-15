
import { useState } from 'react';
import { EnhancedBuildMode } from '@/utils/enhancedBuildMode';
import { WorkflowResponseGenerator } from '@/utils/workflowResponseGenerator';
import type { Message, WorkflowData } from '@/types/workflowTypes';

export const useWorkflowChat = () => {
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

  const handleSendMessage = async (userInput: string) => {
    if (!userInput.trim() || isGenerating) return;

    const userMessage: Message = {
      type: 'user',
      content: userInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);

    try {
      console.log('🎯 Starting enhanced workflow generation...');
      
      // Use enhanced build mode with database intelligence
      const result = await EnhancedBuildMode.generateIntelligentWorkflow(userInput);
      
      setValidationResults(result.validation);
      setWorkflowInsights(result.insights);
      
      // Create sophisticated response based on results
      const responseContent = WorkflowResponseGenerator.createIntelligentResponse(result);
      
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
        content: `I encountered an issue while crafting your sophisticated workflow. The error was: ${(error as Error).message}. Please try rephrasing your request with more specific details about your automation needs.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    messages,
    input,
    setInput,
    currentWorkflow,
    validationResults,
    workflowInsights,
    isGenerating,
    handleSendMessage
  };
};
