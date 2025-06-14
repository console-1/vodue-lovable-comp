
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Eye } from 'lucide-react';

interface WorkflowActionsProps {
  onExport: () => void;
  onDeploy: () => void;
}

export const WorkflowActions: React.FC<WorkflowActionsProps> = ({ onExport, onDeploy }) => {
  return (
    <div className="flex space-x-2">
      <Button
        size="sm"
        onClick={onExport}
        className="bg-stone-700 hover:bg-stone-800"
      >
        <Download className="w-4 h-4 mr-2" />
        Export JSON
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={onDeploy}
      >
        <Eye className="w-4 h-4 mr-2" />
        Deploy Live
      </Button>
    </div>
  );
};
