
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
    return <Database className="w-5 h-5 text-gray-600" />;
  };

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <CardTitle className="text-lg text-orange-900">Database Seeding</CardTitle>
        </div>
        <CardDescription className="text-orange-700">
          Load current n8n node definitions and workflow templates into the database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isSeeding && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-orange-700">{seedingProgress}</span>
              <span className="text-orange-600">{getProgressValue()}%</span>
            </div>
            <Progress value={getProgressValue()} className="w-full" />
          </div>
        )}
        
        <div className="space-y-2 text-sm text-orange-700">
          <p>This will populate the database with:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Current n8n node definitions (Webhook, Code, HTTP Request, etc.)</li>
            <li>Node parameter schemas and validation rules</li>
            <li>Example workflow templates</li>
            <li>Deprecated node mappings for migration assistance</li>
          </ul>
        </div>

        <Button 
          onClick={seedDatabase}
          disabled={isSeeding}
          className="w-full"
          variant={seedingProgress.includes('completed') ? 'secondary' : 'default'}
        >
          {isSeeding ? (
            <>
              <Download className="w-4 h-4 mr-2 animate-pulse" />
              Seeding Database...
            </>
          ) : seedingProgress.includes('completed') ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Database Seeded Successfully
            </>
          ) : (
            <>
              <Database className="w-4 h-4 mr-2" />
              Seed Database with n8n Nodes
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
