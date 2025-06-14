
import React from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface WorkflowPreviewProps {
  workflow: any;
}

export const WorkflowPreview: React.FC<WorkflowPreviewProps> = ({ workflow }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-stone-200">
        <h3 className="text-lg font-light text-stone-800 mb-2">WORKFLOW PREVIEW</h3>
        <p className="text-sm text-stone-600">Live preview with magazine-style layout</p>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          <Card className="p-4 bg-gradient-to-r from-stone-50 to-white">
            <h4 className="font-medium text-stone-800 mb-2">{workflow.name}</h4>
            <p className="text-sm text-stone-600 mb-3">{workflow.description}</p>
            <Badge variant="outline" className="text-xs">
              {workflow.nodes.length} nodes
            </Badge>
          </Card>

          <div className="space-y-3">
            <h5 className="text-sm font-medium text-stone-800 uppercase tracking-wide">
              Flow Structure
            </h5>
            
            {workflow.nodes.map((node, index) => (
              <div key={node.id} className="relative">
                <Card className="p-3 bg-white hover:bg-stone-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-stone-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-stone-800">{node.name}</p>
                      <p className="text-xs text-stone-500 capitalize">{node.type}</p>
                    </div>
                  </div>
                </Card>
                
                {index < workflow.nodes.length - 1 && (
                  <div className="flex justify-center py-2">
                    <div className="w-px h-4 bg-stone-300"></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <Card className="p-4 bg-gradient-to-r from-stone-800 to-stone-700 text-white">
            <h5 className="text-sm font-medium mb-2">Export Ready</h5>
            <p className="text-xs opacity-80">
              This workflow is crafted with editorial precision and ready for n8n deployment.
            </p>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};
