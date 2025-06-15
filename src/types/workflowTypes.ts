
/**
 * Represents a workflow object as stored and retrieved from the database.
 */
export interface Workflow {
  /** The unique identifier for the workflow. */
  id: string;
  /** The name of the workflow. */
  name: string;
  /** An optional description for the workflow. */
  description?: string;
  /** The n8n JSON representation of the workflow, if applicable. */
  n8n_json?: any;
  /** The frontend-specific code or configuration for the workflow, if applicable. */
  frontend_code?: string;
  /** The webhook URL for the workflow if it's triggered by a webhook. */
  webhook_url?: string;
  /** The current status of the workflow. */
  status: 'draft' | 'deployed' | 'active';
  /** Indicates whether the workflow is publicly accessible. */
  is_public: boolean;
  /** Timestamp of when the workflow was created. */
  created_at: string;
}

/**
 * Defines the input structure for creating a new workflow.
 */
export interface CreateWorkflowInput {
  /** The name of the workflow. */
  name: string;
  /** An optional description for the workflow. */
  description?: string;
  /** The n8n JSON representation of the workflow, if applicable. */
  n8n_json?: any;
  /** The frontend-specific code or configuration for the workflow, if applicable. */
  frontend_code?: string;
  /** The webhook URL for the workflow if it's triggered by a webhook. */
  webhook_url?: string;
  /** The initial status of the workflow. Defaults to 'draft'. */
  status?: 'draft' | 'deployed' | 'active';
  /** Indicates whether the workflow should be publicly accessible. Defaults to false. */
  is_public?: boolean;
  /** Optional ID of a conversation related to this workflow. */
  conversation_id?: string;
}

export interface WorkflowData {
  id: number;
  name: string;
  description: string;
  nodes: Array<{
    id: string;
    name: string;
    type: string;
    position: [number, number];
  }>;
  connections: Array<{
    from: string;
    to: string;
  }>;
  json: {
    name: string;
    nodes: any[];
    connections: any;
  };
}

export interface Message {
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  workflow?: WorkflowData;
}
