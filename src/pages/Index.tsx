
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BuildMode } from '@/components/BuildMode';
import { InteractMode } from '@/components/InteractMode';
import { DatabaseSeeder } from '@/components/DatabaseSeeder';
import { useAuth } from '@/contexts/AuthContext';
import { Database, Zap, Brain, Sparkles, Rocket, CheckCircle } from 'lucide-react';

export default function Index() {
  const { user } = useAuth();

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
                Competition Ready
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Competition Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white py-3 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Rocket className="w-5 h-5" />
            <span className="font-semibold">Competition Sprint Mode</span>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              Final Phase
            </Badge>
          </div>
          <div className="text-sm opacity-90">
            Submission Deadline: June 16, 9:00 AM CET
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Sprint Status Dashboard */}
        <Card className="mb-6 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-orange-900 flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  VODUE Competition Status
                </CardTitle>
                <CardDescription className="text-orange-700">
                  Database seeding → Frontend generation → Final polish
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="border-green-500 text-green-700">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Core Architecture
                </Badge>
                <Badge variant="outline" className="border-blue-500 text-blue-700">
                  <Database className="w-3 h-3 mr-1" />
                  Ready for Seeding
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Critical Setup Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1">
            <DatabaseSeeder />
          </div>
          
          <Card className="lg:col-span-2 border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Next Sprint Tasks
              </CardTitle>
              <CardDescription className="text-blue-700">
                Critical path to competition submission
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Execute Database Seeding</div>
                    <div className="text-sm text-gray-600">Load current n8n node definitions and templates</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Frontend Code Generation</div>
                    <div className="text-sm text-gray-600">Implement dynamic UI generation for workflows</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Competition Polish</div>
                    <div className="text-sm text-gray-600">Final UI refinements and demo preparation</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
                <BuildMode />
              </TabsContent>
              
              <TabsContent value="interact" className="space-y-4">
                <InteractMode />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
