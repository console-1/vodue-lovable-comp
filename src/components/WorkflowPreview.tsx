
import React from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface WorkflowPreviewProps {
  workflow: any;
  validationResults?: any;
}

export const WorkflowPreview: React.FC<WorkflowPreviewProps> = ({ workflow, validationResults }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-stone-200">
        <h3 className="text-lg font-light text-stone-800 mb-2">WORKFLOW PREVIEW</h3>
        <p className="text-sm text-stone-600">Current n8n specifications</p>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          <Card className="p-4 bg-gradient-to-r from-stone-50 to-white">
            <h4 className="font-medium text-stone-800 mb-2">{workflow.name}</h4>
            <p className="text-sm text-stone-600 mb-3">{workflow.description}</p>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {workflow.nodes.length} nodes
              </Badge>
              {validationResults?.isValid && (
                <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Valid
                </Badge>
              )}
            </div>
          </Card>

          {/* Validation Results */}
          {validationResults && (
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-stone-800 uppercase tracking-wide">
                Validation Status
              </h5>
              
              {validationResults.errors.length > 0 && (
                <Card className="p-3 bg-red-50 border-red-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">
                      {validationResults.errors.length} Error(s)
                    </span>
                  </div>
                  {validationResults.errors.slice(0, 3).map((error: any, index: number) => (
                    <p key={index} className="text-xs text-red-700 mb-1">
                      {error.message}
                    </p>
                  ))}
                </Card>
              )}

              {validationResults.warnings.length > 0 && (
                <Card className="p-3 bg-amber-50 border-amber-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Info className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">
                      {validationResults.warnings.length} Suggestion(s)
                    </span>
                  </div>
                  {validationResults.warnings.slice(0, 3).map((warning: any, index: number) => (
                    <p key={index} className="text-xs text-amber-700 mb-1">
                      {warning.message}
                    </p>
                  ))}
                </Card>
              )}

              {validationResults.isValid && validationResults.warnings.length === 0 && (
                <Card className="p-3 bg-green-50 border-green-200">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Workflow is valid and ready for n8n
                    </span>
                  </div>
                </Card>
              )}
            </div>
          )}

          <div className="space-y-3">
            <h5 className="text-sm font-medium text-stone-800 uppercase tracking-wide">
              Flow Structure
            </h5>
            
            {workflow.nodes.map((node: any, index: number) => (
              <div key={node.id} className="relative">
                <Card className="p-3 bg-white hover:bg-stone-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-stone-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-stone-800">{node.name}</p>
                      <p className="text-xs text-stone-500">{node.type}</p>
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
            <h5 className="text-sm font-medium mb-2">Current n8n Specifications</h5>
            <p className="text-xs opacity-80">
              This workflow uses current node types and syntax, ensuring compatibility with modern n8n instances.
            </p>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};
