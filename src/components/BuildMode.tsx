
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Sparkles, Download, Eye } from 'lucide-react';
import { WorkflowPreview } from './WorkflowPreview';
import { useToast } from '@/hooks/use-toast';

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
      content: 'Welcome to VODUE. Describe your workflow vision in natural language, and I\'ll craft both the n8n automation and a bespoke interface to match.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowData | null>(null);
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulate AI response with workflow generation
    setTimeout(() => {
      const workflow = generateMockWorkflow(input);
      const aiResponse: Message = {
        type: 'ai',
        content: 'I\'ve crafted a sophisticated workflow based on your vision. The automation flows with editorial precision, each node positioned like elements in a haute couture layout.',
        timestamp: new Date(),
        workflow
      };

      setMessages(prev => [...prev, aiResponse]);
      setCurrentWorkflow(workflow);
    }, 1500);
  };

  const generateMockWorkflow = (description: string): WorkflowData => {
    return {
      id: Date.now(),
      name: `Workflow: ${description.slice(0, 30)}...`,
      description,
      nodes: [
        { id: '1', name: 'Trigger', type: 'webhook', position: [100, 100] },
        { id: '2', name: 'Process', type: 'function', position: [300, 100] },
        { id: '3', name: 'Output', type: 'response', position: [500, 100] }
      ],
      connections: [
        { from: '1', to: '2' },
        { from: '2', to: '3' }
      ],
      json: {
        name: description.slice(0, 30),
        nodes: [],
        connections: {}
      }
    };
  };

  const handleExportWorkflow = () => {
    if (currentWorkflow) {
      const dataStr = JSON.stringify(currentWorkflow.json, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `${currentWorkflow.name}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: "Workflow Exported",
        description: "Your n8n workflow has been exported with editorial precision.",
      });
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
      {/* Chat Interface */}
      <div className="flex-1 flex flex-col">
        <div className="p-6 border-b border-stone-200">
          <h2 className="text-xl font-light text-stone-800 mb-2">BUILD MODE</h2>
          <p className="text-sm text-stone-600">Craft workflows with the precision of haute couture</p>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6 max-w-4xl">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <Card className={`max-w-2xl p-6 ${
                  message.type === 'user' 
                    ? 'bg-stone-800 text-white' 
                    : message.type === 'system'
                    ? 'bg-gradient-to-r from-stone-100 to-stone-50 border-stone-300'
                    : 'bg-white border-stone-200'
                }`}>
                  <div className="flex items-start space-x-3">
                    {message.type !== 'user' && (
                      <div className="w-6 h-6 bg-gradient-to-br from-stone-800 to-stone-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="leading-relaxed">{message.content}</p>
                      {message.workflow && (
                        <div className="mt-4 flex space-x-2">
                          <Button
                            size="sm"
                            onClick={handleExportWorkflow}
                            className="bg-stone-700 hover:bg-stone-800"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Export JSON
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleDeployWorkflow}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Deploy Live
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-6 border-t border-stone-200">
          <div className="flex space-x-3">
            <Input
              placeholder="Describe your workflow vision..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 border-stone-300 focus:border-stone-500"
            />
            <Button 
              onClick={handleSendMessage}
              className="bg-stone-800 hover:bg-stone-900"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Workflow Preview */}
      {currentWorkflow && (
        <div className="w-96 border-l border-stone-200">
          <WorkflowPreview workflow={currentWorkflow} />
        </div>
      )}
    </div>
  );
};
