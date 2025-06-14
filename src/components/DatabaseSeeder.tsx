
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, Download, CheckCircle, AlertCircle, Rocket, Zap } from 'lucide-react';
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
    return <Database className="w-5 h-5 text-orange-600" />;
  };

  const isCompleted = seedingProgress.includes('completed');
  const hasFailed = seedingProgress.includes('failed');

  return (
    <Card className={`border-2 ${isCompleted ? 'border-green-300 bg-green-50' : hasFailed ? 'border-red-300 bg-red-50' : 'border-orange-300 bg-orange-50'}`}>
      <CardHeader>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <div>
            <CardTitle className="text-lg text-orange-900 flex items-center gap-2">
              {isCompleted ? 'Database Ready' : 'Critical Setup'}
              {!isCompleted && <Rocket className="w-4 h-4 text-orange-600" />}
            </CardTitle>
            <CardDescription className="text-orange-700">
              {isCompleted ? 'n8n intelligence system is loaded' : 'Load current n8n node definitions'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isCompleted && (
          <Alert className="border-green-300 bg-green-50">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Success!</strong> Database seeded with modern n8n nodes. Ready for workflow generation.
            </AlertDescription>
          </Alert>
        )}

        {hasFailed && (
          <Alert className="border-red-300 bg-red-50" variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              <strong>Seeding failed.</strong> Please check the console and try again.
            </AlertDescription>
          </Alert>
        )}

        {isSeeding && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-orange-700 font-medium">{seedingProgress}</span>
              <span className="text-orange-600">{getProgressValue()}%</span>
            </div>
            <Progress value={getProgressValue()} className="w-full" />
          </div>
        )}
        
        {!isCompleted && (
          <div className="space-y-3">
            <div className="bg-orange-100 border border-orange-200 rounded-lg p-3">
              <div className="font-medium text-orange-900 mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Competition Critical Path
              </div>
              <div className="space-y-2 text-sm text-orange-800">
                <p><strong>Step 1:</strong> Seed database with current n8n nodes</p>
                <p><strong>Next:</strong> Enable intelligent workflow generation</p>
                <p><strong>Final:</strong> Frontend code generation system</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-orange-700">
              <p className="font-medium">This will populate the database with:</p>
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
          className={`w-full ${isCompleted ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}`}
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
              Database Ready for Competition
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4 mr-2" />
              Execute Critical Seeding
            </>
          )}
        </Button>

        {isCompleted && (
          <div className="text-center pt-2">
            <p className="text-sm text-green-700 font-medium">
              ✅ Ready for next phase: Frontend code generation
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
