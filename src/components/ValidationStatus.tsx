
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ValidationStatusProps {
  validationResults: {
    isValid: boolean;
    issues: Array<{
      type: 'error' | 'warning' | 'info';
      message: string;
    }>;
  };
}

export const ValidationStatus: React.FC<ValidationStatusProps> = ({ validationResults }) => {
  if (!validationResults?.issues) {
    return null;
  }

  const warnings = validationResults.issues.filter(issue => issue.type === 'warning');
  const errors = validationResults.issues.filter(issue => issue.type === 'error');

  if (!warnings.length && validationResults.isValid) {
    return null;
  }

  return (
    <div className="space-y-2">
      {warnings.length > 0 && (
        <div className="flex items-center space-x-2 text-amber-600 text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>{warnings.length} optimization suggestions</span>
        </div>
      )}
      {!validationResults.isValid && errors.length > 0 && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>{errors.length} validation errors</span>
        </div>
      )}
    </div>
  );
};
