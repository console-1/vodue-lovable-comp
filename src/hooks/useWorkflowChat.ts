
import { useState, useEffect } from 'react';
import { useConversations } from './useConversations';
import { useMessages } from './useMessages';
import { EnhancedBuildMode } from '@/utils/enhancedBuildMode';
import { WorkflowResponseGenerator } from '@/utils/workflowResponseGenerator';
import type { WorkflowData } from '@/types/workflowTypes';

export const useWorkflowChat = (mode: 'build' | 'interact' = 'build') => {
  const [input, setInput] = useState('');
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowData | null>(null);
  const [validationResults, setValidationResults] = useState<any>(null);
  const [workflowInsights, setWorkflowInsights] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const { createConversation } = useConversations();
  const { messages, addMessage, loading: messagesLoading } = useMessages(currentConversationId || undefined);

  // Create initial conversation if none exists
  useEffect(() => {
    const initializeConversation = async () => {
      if (!currentConversationId) {
        console.log('🔄 Creating new conversation for chat...');
        const conversation = await createConversation(
          `VODUE ${mode === 'build' ? 'Build' : 'Interact'} Session - ${new Date().toLocaleDateString()}`,
          mode
        );
        if (conversation) {
          setCurrentConversationId(conversation.id);
          console.log('✅ Conversation created:', conversation.id);
        }
      }
    };

    initializeConversation();
  }, [mode, createConversation, currentConversationId]);

  // Add initial system message when conversation is ready
  useEffect(() => {
    const addInitialMessage = async () => {
      if (currentConversationId && messages.length === 0 && !messagesLoading) {
        console.log('🎯 Adding initial system message...');
        await addMessage(
          mode === 'build' 
            ? 'Welcome to VODUE\'s Enhanced Build Mode. I now use advanced n8n node intelligence and database-driven recommendations to craft sophisticated workflows. Describe your automation vision, and I\'ll create an optimized n8n workflow with real-time validation and performance insights.'
            : 'Welcome to VODUE\'s Interact Mode. Connect with your deployed workflows through intelligent chat interfaces. Select a workflow to begin interacting.',
          'assistant'
        );
      }
    };

    addInitialMessage();
  }, [currentConversationId, messages.length, messagesLoading, addMessage, mode]);

  const handleSendMessage = async (userInput: string) => {
    if (!userInput.trim() || isGenerating || !currentConversationId) return;

    console.log('💬 Sending message:', userInput);
    
    // Add user message to database
    await addMessage(userInput, 'user');
    setInput('');
    setIsGenerating(true);

    try {
      console.log('🎯 Starting enhanced workflow generation...');
      
      if (mode === 'build') {
        // Use enhanced build mode with database intelligence
        const result = await EnhancedBuildMode.generateIntelligentWorkflow(userInput);
        
        setValidationResults(result.validation);
        setWorkflowInsights(result.insights);
        
        // Create sophisticated response based on results
        const responseContent = WorkflowResponseGenerator.createIntelligentResponse(result);
        
        // Add AI response to database with workflow metadata
        await addMessage(responseContent, 'assistant', {
          workflow: result.workflow,
          validation: result.validation,
          insights: result.insights
        });
        
        setCurrentWorkflow(result.workflow);
      } else {
        // Interact mode - handle workflow interactions
        const responseContent = `I'm ready to help you interact with your deployed workflows. Please select a workflow from your library or describe what you'd like to do.`;
        
        await addMessage(responseContent, 'assistant');
      }
      
    } catch (error) {
      console.error('Enhanced workflow generation error:', error);
      const errorContent = `I encountered an issue while crafting your sophisticated workflow. The error was: ${(error as Error).message}. Please try rephrasing your request with more specific details about your automation needs.`;
      
      await addMessage(errorContent, 'assistant');
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
    currentConversationId,
    handleSendMessage,
    messagesLoading
  };
};
