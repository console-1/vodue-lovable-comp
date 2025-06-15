
-- Phase 1B: Create indexes with correct column names based on actual schema
CREATE INDEX IF NOT EXISTS idx_workflows_user_created 
ON workflows (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_user_updated 
ON conversations (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_workflow_interactions_workflow_timestamp 
ON workflow_interactions (workflow_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_node_definitions_name 
ON node_definitions (name);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_timestamp 
ON messages (conversation_id, timestamp ASC);

CREATE INDEX IF NOT EXISTS idx_node_definitions_search 
ON node_definitions USING gin(to_tsvector('english', display_name || ' ' || COALESCE(description, '')));

-- Performance views for optimized queries
CREATE OR REPLACE VIEW workflow_details_complete AS
SELECT 
  w.*,
  p.display_name as creator_name,
  p.avatar_url as creator_avatar,
  c.title as conversation_title,
  c.mode as conversation_mode,
  COALESCE(jsonb_array_length(w.n8n_json->'nodes'), 0) as node_count,
  (SELECT COUNT(*) FROM workflow_interactions wi WHERE wi.workflow_id = w.id) as execution_count,
  (SELECT COUNT(*) FROM workflow_interactions wi WHERE wi.workflow_id = w.id AND wi.status = 'success') as success_count
FROM workflows w
LEFT JOIN profiles p ON w.user_id = p.id  
LEFT JOIN conversations c ON w.conversation_id = c.id;

-- Current node definitions with latest versions
CREATE OR REPLACE VIEW current_node_definitions AS
SELECT 
  nd.*,
  nv.version as latest_version,
  nv.class_name,
  nv.properties,
  (SELECT COUNT(*) FROM node_operations no WHERE no.node_version_id = nv.id) as operation_count
FROM node_definitions nd
LEFT JOIN LATERAL (
  SELECT * FROM node_versions nv2 
  WHERE nv2.node_definition_id = nd.id 
  ORDER BY nv2.version DESC LIMIT 1
) nv ON TRUE;

-- Popular node patterns analysis
CREATE OR REPLACE VIEW popular_node_patterns AS
WITH workflow_nodes AS (
  SELECT 
    w.id as workflow_id,
    w.user_id,
    w.is_public,
    node_data->>'type' as node_type,
    (node_data->>'position')::jsonb as position
  FROM workflows w
  CROSS JOIN LATERAL jsonb_array_elements(w.n8n_json->'nodes') as node_data
  WHERE w.status = 'active'
),
node_pairs AS (
  SELECT 
    n1.node_type as node_1,
    n2.node_type as node_2,
    COUNT(*) as pair_count,
    COUNT(*) FILTER (WHERE n1.is_public) as public_usage
  FROM workflow_nodes n1
  JOIN workflow_nodes n2 ON n1.workflow_id = n2.workflow_id AND n1.node_type < n2.node_type
  GROUP BY n1.node_type, n2.node_type
)
SELECT 
  node_1,
  node_2,
  pair_count,
  public_usage,
  ROUND((public_usage::decimal / NULLIF(pair_count, 0)) * 100, 2) as public_usage_percentage
FROM node_pairs
WHERE pair_count >= 2
ORDER BY pair_count DESC;

-- User workflow statistics
CREATE OR REPLACE VIEW user_workflow_stats AS
SELECT 
  p.id as user_id,
  p.display_name,
  COUNT(w.id) as total_workflows,
  COUNT(w.id) FILTER (WHERE w.is_public) as public_workflows,
  COUNT(w.id) FILTER (WHERE w.status = 'active') as active_workflows,
  AVG(COALESCE(jsonb_array_length(w.n8n_json->'nodes'), 0)) as avg_workflow_complexity,
  MAX(w.updated_at) as last_activity,
  (SELECT COUNT(*) FROM workflow_interactions wi 
   JOIN workflows w2 ON wi.workflow_id = w2.id 
   WHERE w2.user_id = p.id) as total_executions
FROM profiles p
LEFT JOIN workflows w ON p.id = w.user_id
GROUP BY p.id, p.display_name;

-- Platform analytics view
CREATE OR REPLACE VIEW platform_analytics AS
SELECT 
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(*) FROM profiles WHERE created_at > NOW() - INTERVAL '30 days') as new_users_30d,
  (SELECT COUNT(*) FROM workflows) as total_workflows,
  (SELECT COUNT(*) FROM workflows WHERE is_public = true) as public_workflows,
  (SELECT COUNT(*) FROM workflow_interactions WHERE timestamp > NOW() - INTERVAL '30 days') as executions_30d,
  (SELECT COUNT(DISTINCT user_id) FROM workflow_interactions WHERE timestamp > NOW() - INTERVAL '30 days') as active_users_30d,
  (SELECT COUNT(*) FROM workflows WHERE status = 'active' AND updated_at > NOW() - INTERVAL '7 days') as workflows_updated_7d;
