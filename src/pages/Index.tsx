
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BuildMode } from '@/components/BuildMode';
import { InteractMode } from '@/components/InteractMode';
import { DatabaseSeeder } from '@/components/DatabaseSeeder';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkflows } from '@/hooks/useWorkflows';
import { Brain, Zap, Sparkles } from 'lucide-react';

export default function Index() {
  const { user } = useAuth();
  const { workflows, loading, refetch } = useWorkflows();

  const handleWorkflowCreate = () => {
    refetch();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              VODUE
            </CardTitle>
            <CardDescription>
              Vibe-coding interface for n8n workflow creation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 mb-6">
              Please log in to access the workflow builder and start creating sophisticated automation workflows.
            </p>
            <div className="text-center">
              <Badge variant="secondary" className="mb-2">
                Ready to Build
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Database Setup Section */}
        <div className="mb-6">
          <DatabaseSeeder />
        </div>

        {/* Main Interface */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              VODUE - Vogue Developer Tools
            </CardTitle>
            <CardDescription>
              Sophisticated vibe-coding interface for n8n workflow creation and interaction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="build" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="build" className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Build Mode
                </TabsTrigger>
                <TabsTrigger value="interact" className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Interact Mode
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="build" className="space-y-4">
                <BuildMode workflows={workflows} onWorkflowCreate={handleWorkflowCreate} />
              </TabsContent>
              
              <TabsContent value="interact" className="space-y-4">
                <InteractMode workflows={workflows} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
