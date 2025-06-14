
import React from 'react';
import { Card } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { WorkflowActions } from './WorkflowActions';
import { ValidationStatus } from './ValidationStatus';

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

interface MessageCardProps {
  message: Message;
  validationResults?: any;
  onExport: () => void;
  onDeploy: () => void;
}

export const MessageCard: React.FC<MessageCardProps> = ({
  message,
  validationResults,
  onExport,
  onDeploy
}) => {
  return (
    <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
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
            <p className="leading-relaxed whitespace-pre-line">{message.content}</p>
            {message.workflow && (
              <div className="mt-4 space-y-3">
                {validationResults && (
                  <ValidationStatus validationResults={validationResults} />
                )}
                <WorkflowActions onExport={onExport} onDeploy={onDeploy} />
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
