
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { useNodeSeeding } from '@/hooks/useNodeSeeding';

export const DatabaseSeeder: React.FC = () => {
  const { isSeeding, seedingProgress, seedDatabase } = useNodeSeeding();

  const getProgressValue = () => {
    if (seedingProgress.includes('Starting')) return 10;
    if (seedingProgress.includes('node definitions')) return 50;
    if (seedingProgress.includes('templates')) return 80;
    if (seedingProgress.includes('completed')) return 100;
    if (seedingProgress.includes('failed')) return 0;
    return 0;
  };

  const getStatusIcon = () => {
    if (seedingProgress.includes('completed')) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    if (seedingProgress.includes('failed')) {
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
    if (isSeeding) {
      return <Download className="w-4 h-4 text-blue-600 animate-pulse" />;
    }
    return <Database className="w-4 h-4 text-gray-600" />;
  };

  const isCompleted = seedingProgress.includes('completed');
  const hasFailed = seedingProgress.includes('failed');

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <div>
            <CardTitle className="text-sm font-medium text-gray-800">
              {isCompleted ? 'Database Ready' : 'Node Database'}
            </CardTitle>
            <CardDescription className="text-xs">
              {isCompleted ? 'Ready to build' : 'Load n8n definitions'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {isCompleted && (
          <Alert className="border-green-300 bg-green-50 py-2">
            <CheckCircle className="w-3 h-3 text-green-600" />
            <AlertDescription className="text-xs text-green-800">
              Ready for workflow generation
            </AlertDescription>
          </Alert>
        )}

        {hasFailed && (
          <Alert className="border-red-300 bg-red-50 py-2" variant="destructive">
            <AlertCircle className="w-3 h-3" />
            <AlertDescription className="text-xs">
              Seeding failed. Try again.
            </AlertDescription>
          </Alert>
        )}

        {isSeeding && (
          <div className="space-y-2">
            <div className="text-xs text-blue-700 font-medium">{seedingProgress}</div>
            <Progress value={getProgressValue()} className="w-full h-2" />
          </div>
        )}
        
        {!isCompleted && !isSeeding && (
          <div className="text-xs text-gray-600">
            <p className="mb-2">Loads current n8n nodes and templates for accurate workflow generation.</p>
          </div>
        )}

        <Button 
          onClick={seedDatabase}
          disabled={isSeeding || isCompleted}
          className={`w-full text-xs ${isCompleted ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-800 hover:bg-gray-900'}`}
          size="sm"
        >
          {isSeeding ? (
            <>
              <Download className="w-3 h-3 mr-2 animate-pulse" />
              Seeding...
            </>
          ) : isCompleted ? (
            <>
              <CheckCircle className="w-3 h-3 mr-2" />
              Ready
            </>
          ) : (
            <>
              <Database className="w-3 h-3 mr-2" />
              Seed Database
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
