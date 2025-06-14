
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, Plus, Code, Webhook, Settings, Zap } from 'lucide-react';
import { NodeService } from '@/services/nodeService';
import type { Database } from '@/integrations/supabase/types';

type NodeDefinition = Database['public']['Tables']['node_definitions']['Row'];

interface NodeRecommendationsProps {
  intent: string;
  currentNodes?: any[];
  onNodeSelect: (nodeType: string) => void;
  className?: string;
}

const getNodeIcon = (category: string, nodeType: string) => {
  if (nodeType.includes('webhook')) return <Webhook className="w-4 h-4" />;
  if (nodeType.includes('code')) return <Code className="w-4 h-4" />;
  if (category === 'Core Nodes') return <Settings className="w-4 h-4" />;
  return <Zap className="w-4 h-4" />;
};

export const NodeRecommendations: React.FC<NodeRecommendationsProps> = ({
  intent,
  currentNodes = [],
  onNodeSelect,
  className = ''
}) => {
  const [recommendations, setRecommendations] = useState<NodeDefinition[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadRecommendations = async () => {
      if (!intent.trim()) {
        setRecommendations([]);
        return;
      }

      setLoading(true);
      try {
        const nodes = await NodeService.recommendNodes(intent, currentNodes);
        setRecommendations(nodes);
      } catch (error) {
        console.error('Failed to load recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(loadRecommendations, 300);
    return () => clearTimeout(timeoutId);
  }, [intent, currentNodes]);

  if (!intent.trim() || (!loading && recommendations.length === 0)) {
    return null;
  }

  return (
    <Card className={`border-blue-200 bg-blue-50/50 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-blue-600" />
          <CardTitle className="text-lg text-blue-900">Recommended Nodes</CardTitle>
        </div>
        <CardDescription className="text-blue-700">
          Based on your description: "{intent}"
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
                    {getNodeIcon(node.category || '', node.node_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 truncate">
                        {node.display_name}
                      </h4>
                      {node.deprecated && (
                        <Badge variant="destructive" className="text-xs">
                          Deprecated
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {node.description}
                    </p>
                    {node.category && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        {node.category}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => onNodeSelect(node.node_type)}
                  className="shrink-0 ml-2"
                  disabled={node.deprecated}
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
  );
};
