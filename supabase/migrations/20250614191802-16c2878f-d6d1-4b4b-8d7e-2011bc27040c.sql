
-- Create workflow_templates table
CREATE TABLE public.workflow_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text,
  tags text[],
  n8n_workflow jsonb DEFAULT '{}',
  use_case text,
  difficulty text CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  is_public boolean NOT NULL DEFAULT false,
  usage_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create node_definitions table
CREATE TABLE public.node_definitions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  node_type text NOT NULL UNIQUE,
  display_name text NOT NULL,
  category text,
  description text,
  icon text,
  version text,
  deprecated boolean NOT NULL DEFAULT false,
  replaced_by text,
  parameters_schema jsonb DEFAULT '{}',
  example_config jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create node_parameters table
CREATE TABLE public.node_parameters (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  node_definition_id uuid NOT NULL REFERENCES public.node_definitions(id) ON DELETE CASCADE,
  parameter_name text NOT NULL,
  parameter_type text NOT NULL,
  required boolean NOT NULL DEFAULT false,
  default_value text,
  description text,
  options jsonb DEFAULT '{}',
  validation_rules jsonb DEFAULT '{}',
  PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE public.workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.node_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.node_parameters ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for workflow_templates
CREATE POLICY "Users can view their own templates" ON public.workflow_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public templates" ON public.workflow_templates
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create their own templates" ON public.workflow_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" ON public.workflow_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" ON public.workflow_templates
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for node_definitions (read-only for users)
CREATE POLICY "Anyone can view node definitions" ON public.node_definitions
  FOR SELECT USING (true);

-- Create RLS policies for node_parameters (read-only for users)
CREATE POLICY "Anyone can view node parameters" ON public.node_parameters
  FOR SELECT USING (true);

-- Create function to update node_definitions updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_node_definitions_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update node_definitions timestamp
CREATE TRIGGER update_node_definitions_updated_at
  BEFORE UPDATE ON public.node_definitions
  FOR EACH ROW EXECUTE FUNCTION public.update_node_definitions_updated_at();

-- Seed critical modern n8n nodes
INSERT INTO public.node_definitions (node_type, display_name, category, description, icon, version, deprecated, replaced_by, parameters_schema, example_config) VALUES
('n8n-nodes-base.code', 'Code', 'Core Nodes', 'Execute custom JavaScript code', 'code', '2', false, null, 
'{"jsCode": {"type": "string", "required": true, "description": "JavaScript code to execute"}, "mode": {"type": "options", "options": ["runOnceForAllItems", "runOnceForEachItem"], "default": "runOnceForAllItems"}}',
'{"jsCode": "// Process input data\nfor (const item of $input.all()) {\n  item.json.processed = true;\n}\nreturn $input.all();", "mode": "runOnceForAllItems"}'),

('n8n-nodes-base.set', 'Edit Fields (Set)', 'Core Nodes', 'Set values on items', 'edit', '3', false, null,
'{"fields": {"type": "collection", "required": true, "description": "Fields to set"}, "options": {"type": "object", "description": "Additional options"}}',
'{"fields": {"values": [{"name": "newField", "type": "stringValue", "stringValue": "example value"}]}}'),

('n8n-nodes-base.httpRequest', 'HTTP Request', 'Regular Nodes', 'Make HTTP requests to any URL', 'webhook', '4', false, null,
'{"url": {"type": "string", "required": true}, "method": {"type": "options", "options": ["GET", "POST", "PUT", "DELETE", "PATCH"], "default": "GET"}, "authentication": {"type": "options", "options": ["none", "basicAuth", "oAuth2Api", "bearerToken"]}}',
'{"url": "https://api.example.com/data", "method": "GET", "authentication": "none"}'),

('n8n-nodes-base.webhook', 'Webhook', 'Trigger Nodes', 'Receive HTTP requests', 'webhook', '2', false, null,
'{"path": {"type": "string", "required": true, "description": "Webhook path"}, "httpMethod": {"type": "options", "options": ["GET", "POST", "PUT", "DELETE", "PATCH"], "default": "GET"}, "responseMode": {"type": "options", "options": ["onReceived", "lastNode"], "default": "onReceived"}}',
'{"path": "webhook", "httpMethod": "POST", "responseMode": "onReceived"}'),

('n8n-nodes-base.if', 'If', 'Core Nodes', 'Split workflow based on conditions', 'if', '2', false, null,
'{"conditions": {"type": "collection", "required": true, "description": "Conditions to check"}, "combineOperation": {"type": "options", "options": ["any", "all"], "default": "all"}}',
'{"conditions": {"options": {"caseSensitive": true, "leftValue": "={{ $json.status }}", "operation": "equal", "rightValue": "active"}}}'),

('n8n-nodes-base.switch', 'Switch', 'Core Nodes', 'Route items to different outputs based on rules', 'switch', '3', false, null,
'{"rules": {"type": "collection", "required": true, "description": "Rules for routing"}, "fallbackOutput": {"type": "number", "default": 3}}',
'{"rules": {"values": [{"conditions": {"any": [{"leftValue": "={{ $json.type }}", "rightValue": "user", "operation": "equal"}]}, "output": 0}]}}'),

('n8n-nodes-base.itemLists', 'Item Lists', 'Core Nodes', 'Manipulate lists of items', 'list', '3', false, null,
'{"operation": {"type": "options", "options": ["aggregateItems", "splitOutItems", "sort", "limit"], "required": true}, "fieldToSplitOut": {"type": "string"}, "sortFieldsUi": {"type": "collection"}}',
'{"operation": "aggregateItems", "aggregate": "aggregateAllItemData"}'),

-- Deprecated nodes
('n8n-nodes-base.function', 'Function', 'Core Nodes', 'Execute custom JavaScript code (deprecated)', 'code', '1', true, 'n8n-nodes-base.code',
'{"functionCode": {"type": "string", "required": true, "description": "JavaScript function code"}}',
'{"functionCode": "items[0].json.processed = true;\nreturn items;"}');

-- Insert corresponding parameters for the Code node
INSERT INTO public.node_parameters (node_definition_id, parameter_name, parameter_type, required, default_value, description, options, validation_rules) 
SELECT id, 'jsCode', 'string', true, '', 'JavaScript code to execute', '{}', '{"minLength": 1}'
FROM public.node_definitions WHERE node_type = 'n8n-nodes-base.code';

INSERT INTO public.node_parameters (node_definition_id, parameter_name, parameter_type, required, default_value, description, options, validation_rules)
SELECT id, 'mode', 'options', false, 'runOnceForAllItems', 'Execution mode', '{"options": ["runOnceForAllItems", "runOnceForEachItem"]}', '{}'
FROM public.node_definitions WHERE node_type = 'n8n-nodes-base.code';

-- Insert parameters for HTTP Request node
INSERT INTO public.node_parameters (node_definition_id, parameter_name, parameter_type, required, default_value, description, options, validation_rules)
SELECT id, 'url', 'string', true, '', 'The URL to make the request to', '{}', '{"pattern": "^https?://"}'
FROM public.node_definitions WHERE node_type = 'n8n-nodes-base.httpRequest';

INSERT INTO public.node_parameters (node_definition_id, parameter_name, parameter_type, required, default_value, description, options, validation_rules)
SELECT id, 'method', 'options', false, 'GET', 'HTTP method', '{"options": ["GET", "POST", "PUT", "DELETE", "PATCH"]}', '{}'
FROM public.node_definitions WHERE node_type = 'n8n-nodes-base.httpRequest';

-- Insert parameters for Webhook node
INSERT INTO public.node_parameters (node_definition_id, parameter_name, parameter_type, required, default_value, description, options, validation_rules)
SELECT id, 'path', 'string', true, '', 'Webhook path', '{}', '{"pattern": "^[a-zA-Z0-9\\-_/]*$"}'
FROM public.node_definitions WHERE node_type = 'n8n-nodes-base.webhook';

INSERT INTO public.node_parameters (node_definition_id, parameter_name, parameter_type, required, default_value, description, options, validation_rules)
SELECT id, 'httpMethod', 'options', false, 'GET', 'HTTP method to listen for', '{"options": ["GET", "POST", "PUT", "DELETE", "PATCH"]}', '{}'
FROM public.node_definitions WHERE node_type = 'n8n-nodes-base.webhook';
