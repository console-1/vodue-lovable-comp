
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, Plus, Code, Webhook, Settings, Zap, Brain, Sparkles } from 'lucide-react';
import { NodeIntelligenceService, type NodeRecommendation } from '@/services/nodeIntelligenceService';

interface NodeRecommendationsProps {
  intent: string;
  currentNodes?: any[];
  onNodeSelect: (nodeType: string) => void;
  className?: string;
}

const getNodeIcon = (nodeType: string) => {
  if (nodeType.includes('webhook')) return <Webhook className="w-4 h-4" />;
  if (nodeType.includes('code')) return <Code className="w-4 h-4" />;
  return <Zap className="w-4 h-4" />;
};

const getRelevanceColor = (score: number) => {
  if (score >= 20) return 'bg-green-100 text-green-800 border-green-200';
  if (score >= 10) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-blue-100 text-blue-800 border-blue-200';
};

const getCategoryColor = (category: string = '') => {
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes('core')) return 'bg-purple-100 text-purple-800';
  if (categoryLower.includes('trigger')) return 'bg-blue-100 text-blue-800';
  if (categoryLower.includes('action')) return 'bg-green-100 text-green-800';
  return 'bg-gray-100 text-gray-800';
};

export const NodeRecommendations: React.FC<NodeRecommendationsProps> = ({
  intent,
  currentNodes = [],
  onNodeSelect,
  className = ''
}) => {
  const [recommendations, setRecommendations] = useState<NodeRecommendation[]>([]);
  const [workflowSuggestion, setWorkflowSuggestion] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadRecommendations = async () => {
      if (!intent.trim()) {
        setRecommendations([]);
        setWorkflowSuggestion(null);
        return;
      }

      setLoading(true);
      try {
        const [nodeRecs, workflowStructure] = await Promise.all([
          NodeIntelligenceService.getIntelligentRecommendations(intent, currentNodes),
          NodeIntelligenceService.suggestWorkflowStructure(intent)
        ]);
        
        setRecommendations(nodeRecs);
        setWorkflowSuggestion(workflowStructure);
      } catch (error) {
        console.error('Failed to load intelligent recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(loadRecommendations, 300);
    return () => clearTimeout(timeoutId);
  }, [intent, currentNodes]);

  if (!intent.trim() || (!loading && recommendations.length === 0 && !workflowSuggestion)) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Workflow Structure Suggestion */}
      {workflowSuggestion && (
        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              <CardTitle className="text-lg text-purple-900">Suggested Workflow Structure</CardTitle>
            </div>
            <CardDescription className="text-purple-700">
              {workflowSuggestion.reasoning}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {workflowSuggestion.suggestedNodes.map((nodeType: string, index: number) => (
                <div key={nodeType} className="flex items-center gap-1">
                  <Badge variant="outline" className="bg-white">
                    {nodeType.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim()}
                  </Badge>
                  {index < workflowSuggestion.suggestedNodes.length - 1 && (
                    <span className="text-purple-400">→</span>
                  )}
                </div>
              ))}
            </div>
            {workflowSuggestion.pattern && (
              <div className="mt-3 p-2 bg-purple-100 rounded-md">
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-purple-900">
                    Pattern: {workflowSuggestion.pattern.name}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {workflowSuggestion.pattern.complexity}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Node Recommendations */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg text-blue-900">Intelligent Node Recommendations</CardTitle>
          </div>
          <CardDescription className="text-blue-700">
            AI-powered suggestions based on: "{intent}"
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.map((node) => (
                <div
                  key={node.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-md">
                      {getNodeIcon(node.nodeType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 truncate">
                          {node.displayName}
                        </h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getRelevanceColor(node.relevanceScore)}`}
                        >
                          {node.relevanceScore}% match
                        </Badge>
                        {node.category && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getCategoryColor(node.category)}`}
                          >
                            {node.category}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-1">
                        {node.description}
                      </p>
                      <p className="text-xs text-blue-600 italic">
                        {node.reasoning}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onNodeSelect(node.nodeType)}
                    className="shrink-0 ml-2"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
