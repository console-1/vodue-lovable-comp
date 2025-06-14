
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ValidationStatusProps {
  validationResults: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
}

export const ValidationStatus: React.FC<ValidationStatusProps> = ({ validationResults }) => {
  if (!validationResults.warnings.length && validationResults.isValid) {
    return null;
  }

  return (
    <div className="space-y-2">
      {validationResults.warnings.length > 0 && (
        <div className="flex items-center space-x-2 text-amber-600 text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>{validationResults.warnings.length} optimization suggestions</span>
        </div>
      )}
      {!validationResults.isValid && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>{validationResults.errors.length} validation errors</span>
        </div>
      )}
    </div>
  );
};
