
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
            <div className="mx-auto mb-4 w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-light text-gray-800">
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with Database Seeder */}
          <div className="lg:col-span-1">
            <DatabaseSeeder />
          </div>

          {/* Main Interface */}
          <div className="lg:col-span-3">
            <Card className="border-gray-200">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-light text-gray-800">
                    VODUE
                  </CardTitle>
                  <span className="text-xs uppercase tracking-widest text-gray-500 font-medium">
                    Vogue Developer Tools
                  </span>
                </div>
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
      </div>
    </div>
  );
}
