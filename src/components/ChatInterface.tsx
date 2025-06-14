
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import { MessageCard } from './MessageCard';

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

interface ChatInterfaceProps {
  messages: Message[];
  input: string;
  validationResults: any;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onExportWorkflow: () => void;
  onDeployWorkflow: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  input,
  validationResults,
  onInputChange,
  onSendMessage,
  onExportWorkflow,
  onDeployWorkflow
}) => {
  return (
    <div className="flex-1 flex flex-col">
      <div className="p-6 border-b border-stone-200">
        <h2 className="text-xl font-light text-stone-800 mb-2">BUILD MODE</h2>
        <p className="text-sm text-stone-600">Craft workflows with current n8n specifications</p>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6 max-w-4xl">
          {messages.map((message, index) => (
            <MessageCard
              key={index}
              message={message}
              validationResults={message.workflow ? validationResults : undefined}
              onExport={onExportWorkflow}
              onDeploy={onDeployWorkflow}
            />
          ))}
        </div>
      </ScrollArea>

      <div className="p-6 border-t border-stone-200">
        <div className="flex space-x-3">
          <Input
            placeholder="Describe your workflow vision..."
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
            className="flex-1 border-stone-300 focus:border-stone-500"
          />
          <Button 
            onClick={onSendMessage}
            className="bg-stone-800 hover:bg-stone-900"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
