
import { supabase } from '@/integrations/supabase/client';
import type { NodeWithParameters } from '@/types/nodeTypes';

export class NodeCacheService {
  private static nodeDefinitionsCache: Map<string, NodeWithParameters> = new Map();
  private static cacheExpiry = 5 * 60 * 1000; // 5 minutes
  private static lastCacheUpdate = 0;

  static async getNodeDefinitions(): Promise<NodeWithParameters[]> {
    await this.refreshCacheIfNeeded();
    return Array.from(this.nodeDefinitionsCache.values());
  }

  static async getNodeDefinition(nodeName: string): Promise<NodeWithParameters | null> {
    await this.refreshCacheIfNeeded();
    return this.nodeDefinitionsCache.get(nodeName) || null;
  }

  static async refreshCacheIfNeeded(): Promise<void> {
    const now = Date.now();
    if (now - this.lastCacheUpdate < this.cacheExpiry && this.nodeDefinitionsCache.size > 0) {
      return;
    }
    await this.loadNodeDefinitions();
    this.lastCacheUpdate = now;
  }

  static async loadNodeDefinitions(): Promise<void> {
    const { data: definitions, error: defError } = await supabase
      .from('node_definitions')
      .select('*')
      .order('display_name');
      
    if (defError) { 
      console.error("Error loading node definitions:", defError); 
      return; 
    }

    const { data: parameters, error: paramError } = await supabase
      .from('node_parameters')
      .select('*');
      
    if (paramError) { 
      console.error("Error loading node parameters:", paramError); 
      return; 
    }

    if (definitions && parameters) {
      this.nodeDefinitionsCache.clear();
      definitions.forEach(definition => {
        const nodeParams = parameters.filter(param => param.node_version_id === definition.id);
        this.nodeDefinitionsCache.set(definition.name, { ...definition, parameters: nodeParams });
      });
    }
  }
}
