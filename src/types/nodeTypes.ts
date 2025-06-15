
import type { Database } from '@/integrations/supabase/types';

export type NodeDefinition = Database['public']['Tables']['node_definitions']['Row'];
export type NodeParameter = Database['public']['Tables']['node_parameters']['Row'];
export type WorkflowTemplate = Database['public']['Tables']['workflows']['Row'];

export interface NodeVersion {
  id: string;
  version: number;
  class_name: string;
  properties?: any;
  inputs?: any;
  outputs?: any;
  typescript_definitions?: string;
}

export interface NodeWithParameters extends NodeDefinition {
  parameters: NodeParameter[];
  latest_version?: NodeVersion;
}

export interface ValidationIssue {
  type: 'error' | 'warning' | 'suggestion';
  nodeId?: string;
  nodeName?: string;
  message: string;
  suggestion?: string;
  autoFix?: boolean;
}

export interface WorkflowValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  modernizedWorkflow?: any;
}
