
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Send, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InteractModeProps {
  workflows: any[];
}

export const InteractMode: React.FC<InteractModeProps> = ({ workflows }) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const { toast } = useToast();

  const handleWorkflowSelect = (workflow: any) => {
    setSelectedWorkflow(workflow);
    setMessages([
      {
        type: 'system',
        content: `Connected to "${workflow.name}". Your sophisticated automation awaits your command.`,
        timestamp: new Date()
      }
    ]);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedWorkflow) return;

    const userMessage = {
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulate workflow execution
    setTimeout(() => {
      const response = {
        type: 'workflow',
        content: 'Workflow executed with editorial precision. Your automation has processed the request beautifully.',
        timestamp: new Date(),
        result: {
          status: 'success',
          data: 'Processing completed'
        }
      };

      setMessages(prev => [...prev, response]);
      
      toast({
        title: "Workflow Executed",
        description: "Your automation ran with sophisticated precision.",
      });
    }, 1000);
  };

  if (workflows.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gradient-to-br from-stone-200 to-stone-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 text-stone-600" />
          </div>
          <h3 className="text-xl font-light text-stone-800 mb-2">No Workflows Deployed</h3>
          <p className="text-stone-600">Create and deploy workflows in BUILD mode to interact with them here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex">
      {/* Workflow Selection */}
      <div className="w-80 border-r border-stone-200">
        <div className="p-6 border-b border-stone-200">
          <h2 className="text-xl font-light text-stone-800 mb-2">INTERACT MODE</h2>
          <p className="text-sm text-stone-600">Engage with your deployed workflows</p>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {workflows.map((workflow) => (
              <Card
                key={workflow.id}
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedWorkflow?.id === workflow.id 
                    ? 'bg-stone-800 text-white' 
                    : 'bg-white hover:bg-stone-50'
                }`}
                onClick={() => handleWorkflowSelect(workflow)}
              >
                <h3 className="font-medium mb-2">{workflow.name}</h3>
                <p className="text-sm opacity-70 line-clamp-2">{workflow.description}</p>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col">
        {selectedWorkflow ? (
          <>
            <div className="p-6 border-b border-stone-200">
              <h3 className="text-lg font-medium text-stone-800">{selectedWorkflow.name}</h3>
              <p className="text-sm text-stone-600 mt-1">Live workflow interaction</p>
            </div>

            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4 max-w-2xl">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <Card className={`max-w-lg p-4 ${
                      message.type === 'user' 
                        ? 'bg-stone-800 text-white' 
                        : message.type === 'system'
                        ? 'bg-gradient-to-r from-stone-100 to-stone-50'
                        : 'bg-white border-stone-200'
                    }`}>
                      <div className="flex items-start space-x-3">
                        {message.type !== 'user' && (
                          <div className="w-5 h-5 bg-gradient-to-br from-stone-800 to-stone-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Sparkles className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          {message.result && (
                            <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-800">
                              Status: {message.result.status}
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
                  placeholder="Send data to your workflow..."
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
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-light text-stone-800 mb-2">Select a Workflow</h3>
              <p className="text-stone-600">Choose a deployed workflow to begin interaction</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
