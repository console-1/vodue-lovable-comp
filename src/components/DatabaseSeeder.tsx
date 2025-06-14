
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
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    if (seedingProgress.includes('failed')) {
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
    if (isSeeding) {
      return <Download className="w-5 h-5 text-blue-600 animate-pulse" />;
    }
    return <Database className="w-5 h-5 text-blue-600" />;
  };

  const isCompleted = seedingProgress.includes('completed');
  const hasFailed = seedingProgress.includes('failed');

  return (
    <Card className={`${isCompleted ? 'border-green-300 bg-green-50' : hasFailed ? 'border-red-300 bg-red-50' : 'border-blue-300 bg-blue-50'}`}>
      <CardHeader>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <div>
            <CardTitle className="text-lg">
              {isCompleted ? 'Database Ready' : 'Database Setup'}
            </CardTitle>
            <CardDescription>
              {isCompleted ? 'n8n node definitions loaded successfully' : 'Load current n8n node definitions and templates'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isCompleted && (
          <Alert className="border-green-300 bg-green-50">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Database seeded successfully! You can now generate workflows with current n8n nodes.
            </AlertDescription>
          </Alert>
        )}

        {hasFailed && (
          <Alert className="border-red-300 bg-red-50" variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Seeding failed. Please check the console and try again.
            </AlertDescription>
          </Alert>
        )}

        {isSeeding && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-700 font-medium">{seedingProgress}</span>
              <span className="text-blue-600">{getProgressValue()}%</span>
            </div>
            <Progress value={getProgressValue()} className="w-full" />
          </div>
        )}
        
        {!isCompleted && (
          <div className="space-y-3">
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-2">This will populate the database with:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Current n8n node definitions (Code, HTTP Request, Webhook, etc.)</li>
                <li>Node parameter schemas and validation rules</li>
                <li>Example workflow templates</li>
                <li>Deprecated node mappings for migration assistance</li>
              </ul>
            </div>
          </div>
        )}

        <Button 
          onClick={seedDatabase}
          disabled={isSeeding || isCompleted}
          className={`w-full ${isCompleted ? 'bg-green-600 hover:bg-green-700' : ''}`}
          size="lg"
        >
          {isSeeding ? (
            <>
              <Download className="w-4 h-4 mr-2 animate-pulse" />
              Seeding Database...
            </>
          ) : isCompleted ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Database Ready
            </>
          ) : (
            <>
              <Database className="w-4 h-4 mr-2" />
              Seed Database
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
