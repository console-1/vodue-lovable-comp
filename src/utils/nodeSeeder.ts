
import { supabase } from '@/integrations/supabase/client';
import { N8N_NODE_TYPES } from '@/data/n8nNodeReference';

export interface NodeDefinitionSeed {
  node_type: string;
  display_name: string;
  category: string;
  description: string;
  icon?: string;
  version: string;
  deprecated: boolean;
  replaced_by?: string;
  parameters_schema: any;
  example_config: any;
  parameters: Array<{
    parameter_name: string;
    parameter_type: string;
    required: boolean;
    default_value?: string;
    description: string;
    options?: any;
    validation_rules?: any;
  }>;
}

export class NodeSeeder {
  static readonly COMPREHENSIVE_NODE_DEFINITIONS: NodeDefinitionSeed[] = [
    {
      node_type: 'n8n-nodes-base.webhook',
      display_name: 'Webhook',
      category: 'Trigger Nodes',
      description: 'Receive HTTP requests and trigger workflow execution',
      icon: 'webhook',
      version: '2',
      deprecated: false,
      parameters_schema: {
        path: { type: 'string', required: true },
        httpMethod: { type: 'options', options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
        responseMode: { type: 'options', options: ['onReceived', 'lastNode'] }
      },
      example_config: {
        path: 'my-webhook',
        httpMethod: 'POST',
        responseMode: 'onReceived'
      },
      parameters: [
        {
          parameter_name: 'path',
          parameter_type: 'string',
          required: true,
          description: 'The webhook URL path',
          validation_rules: { pattern: '^[a-zA-Z0-9\\-_/]*$' }
        },
        {
          parameter_name: 'httpMethod',
          parameter_type: 'options',
          required: false,
          default_value: 'GET',
          description: 'HTTP method to listen for',
          options: { options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] }
        },
        {
          parameter_name: 'responseMode',
          parameter_type: 'options',
          required: false,
          default_value: 'onReceived',
          description: 'When to send response',
          options: { options: ['onReceived', 'lastNode'] }
        }
      ]
    },
    {
      node_type: 'n8n-nodes-base.code',
      display_name: 'Code',
      category: 'Core Nodes',
      description: 'Execute custom JavaScript code to process data',
      icon: 'code',
      version: '2',
      deprecated: false,
      parameters_schema: {
        jsCode: { type: 'string', required: true },
        mode: { type: 'options', options: ['runOnceForAllItems', 'runOnceForEachItem'] }
      },
      example_config: {
        jsCode: '// Process input data\nfor (const item of $input.all()) {\n  item.json.processed = true;\n}\nreturn $input.all();',
        mode: 'runOnceForAllItems'
      },
      parameters: [
        {
          parameter_name: 'jsCode',
          parameter_type: 'string',
          required: true,
          description: 'JavaScript code to execute',
          validation_rules: { minLength: 1 }
        },
        {
          parameter_name: 'mode',
          parameter_type: 'options',
          required: false,
          default_value: 'runOnceForAllItems',
          description: 'Execution mode',
          options: { options: ['runOnceForAllItems', 'runOnceForEachItem'] }
        }
      ]
    },
    {
      node_type: 'n8n-nodes-base.httpRequest',
      display_name: 'HTTP Request',
      category: 'Regular Nodes',
      description: 'Make HTTP requests to any URL or API endpoint',
      icon: 'globe',
      version: '4',
      deprecated: false,
      parameters_schema: {
        url: { type: 'string', required: true },
        method: { type: 'options', options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
        authentication: { type: 'options', options: ['none', 'basicAuth', 'bearerToken', 'oAuth2Api'] }
      },
      example_config: {
        url: 'https://api.example.com/data',
        method: 'GET',
        authentication: 'none'
      },
      parameters: [
        {
          parameter_name: 'url',
          parameter_type: 'string',
          required: true,
          description: 'The URL to make the request to',
          validation_rules: { pattern: '^https?://' }
        },
        {
          parameter_name: 'method',
          parameter_type: 'options',
          required: false,
          default_value: 'GET',
          description: 'HTTP method',
          options: { options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] }
        },
        {
          parameter_name: 'authentication',
          parameter_type: 'options',
          required: false,
          default_value: 'none',
          description: 'Authentication method',
          options: { options: ['none', 'basicAuth', 'bearerToken', 'oAuth2Api'] }
        }
      ]
    },
    {
      node_type: 'n8n-nodes-base.set',
      display_name: 'Edit Fields (Set)',
      category: 'Core Nodes',
      description: 'Set or modify field values on items',
      icon: 'edit',
      version: '3',
      deprecated: false,
      parameters_schema: {
        fields: { type: 'collection', required: true },
        mode: { type: 'options', options: ['manual', 'expression'] }
      },
      example_config: {
        fields: {
          values: [
            { name: 'processed', type: 'booleanValue', booleanValue: true },
            { name: 'timestamp', type: 'stringValue', stringValue: '={{ new Date().toISOString() }}' }
          ]
        }
      },
      parameters: [
        {
          parameter_name: 'fields',
          parameter_type: 'collection',
          required: true,
          description: 'Fields to set or modify'
        }
      ]
    },
    {
      node_type: 'n8n-nodes-base.if',
      display_name: 'If',
      category: 'Core Nodes',
      description: 'Split workflow execution based on conditions',
      icon: 'split',
      version: '2',
      deprecated: false,
      parameters_schema: {
        conditions: { type: 'collection', required: true },
        combineOperation: { type: 'options', options: ['any', 'all'] }
      },
      example_config: {
        conditions: {
          options: {
            caseSensitive: true,
            leftValue: '={{ $json.status }}',
            operation: 'equal',
            rightValue: 'active'
          }
        }
      },
      parameters: [
        {
          parameter_name: 'conditions',
          parameter_type: 'collection',
          required: true,
          description: 'Conditions to evaluate'
        },
        {
          parameter_name: 'combineOperation',
          parameter_type: 'options',
          required: false,
          default_value: 'all',
          description: 'How to combine multiple conditions',
          options: { options: ['any', 'all'] }
        }
      ]
    },
    {
      node_type: 'n8n-nodes-base.switch',
      display_name: 'Switch',
      category: 'Core Nodes',
      description: 'Route items to different outputs based on rules',
      icon: 'code-branch',
      version: '3',
      deprecated: false,
      parameters_schema: {
        rules: { type: 'collection', required: true },
        fallbackOutput: { type: 'number', default: 3 }
      },
      example_config: {
        rules: {
          values: [
            {
              conditions: {
                any: [
                  { leftValue: '={{ $json.type }}', rightValue: 'user', operation: 'equal' }
                ]
              },
              output: 0
            }
          ]
        }
      },
      parameters: [
        {
          parameter_name: 'rules',
          parameter_type: 'collection',
          required: true,
          description: 'Rules for routing items'
        },
        {
          parameter_name: 'fallbackOutput',
          parameter_type: 'number',
          required: false,
          default_value: '3',
          description: 'Output index for unmatched items'
        }
      ]
    },
    {
      node_type: 'n8n-nodes-base.merge',
      display_name: 'Merge',
      category: 'Core Nodes',
      description: 'Merge data from multiple inputs',
      icon: 'code-merge',
      version: '3',
      deprecated: false,
      parameters_schema: {
        mode: { type: 'options', options: ['append', 'chooseBranch', 'mergeByFields', 'mergeByPosition'] },
        mergeByFields: { type: 'collection' }
      },
      example_config: {
        mode: 'append'
      },
      parameters: [
        {
          parameter_name: 'mode',
          parameter_type: 'options',
          required: false,
          default_value: 'append',
          description: 'How to merge the data',
          options: { options: ['append', 'chooseBranch', 'mergeByFields', 'mergeByPosition'] }
        }
      ]
    },
    {
      node_type: 'n8n-nodes-base.itemLists',
      display_name: 'Item Lists',
      category: 'Core Nodes',
      description: 'Manipulate arrays and lists of items',
      icon: 'list',
      version: '3',
      deprecated: false,
      parameters_schema: {
        operation: { type: 'options', options: ['aggregateItems', 'splitOutItems', 'sort', 'limit'] },
        fieldToSplitOut: { type: 'string' },
        sortFieldsUi: { type: 'collection' }
      },
      example_config: {
        operation: 'aggregateItems',
        aggregate: 'aggregateAllItemData'
      },
      parameters: [
        {
          parameter_name: 'operation',
          parameter_type: 'options',
          required: true,
          description: 'Operation to perform on items',
          options: { options: ['aggregateItems', 'splitOutItems', 'sort', 'limit'] }
        }
      ]
    },
    // Deprecated nodes for migration detection
    {
      node_type: 'n8n-nodes-base.function',
      display_name: 'Function',
      category: 'Core Nodes',
      description: 'Execute custom JavaScript code (deprecated - use Code node)',
      icon: 'code',
      version: '1',
      deprecated: true,
      replaced_by: 'n8n-nodes-base.code',
      parameters_schema: {
        functionCode: { type: 'string', required: true }
      },
      example_config: {
        functionCode: 'items[0].json.processed = true;\nreturn items;'
      },
      parameters: [
        {
          parameter_name: 'functionCode',
          parameter_type: 'string',
          required: true,
          description: 'JavaScript function code'
        }
      ]
    }
  ];

  static async seedNodeDefinitions(): Promise<void> {
    console.log('Starting node definitions seeding...');
    
    for (const nodeDef of this.COMPREHENSIVE_NODE_DEFINITIONS) {
      try {
        // Check if node definition already exists
        const { data: existing } = await supabase
          .from('node_definitions')
          .select('id')
          .eq('node_type', nodeDef.node_type)
          .single();

        let nodeDefinitionId: string;

        if (existing) {
          // Update existing definition
          const { data: updated, error: updateError } = await supabase
            .from('node_definitions')
            .update({
              display_name: nodeDef.display_name,
              category: nodeDef.category,
              description: nodeDef.description,
              icon: nodeDef.icon,
              version: nodeDef.version,
              deprecated: nodeDef.deprecated,
              replaced_by: nodeDef.replaced_by,
              parameters_schema: nodeDef.parameters_schema,
              example_config: nodeDef.example_config
            })
            .eq('node_type', nodeDef.node_type)
            .select('id')
            .single();

          if (updateError) throw updateError;
          nodeDefinitionId = updated.id;
          console.log(`Updated node definition: ${nodeDef.display_name}`);
        } else {
          // Insert new definition
          const { data: inserted, error: insertError } = await supabase
            .from('node_definitions')
            .insert({
              node_type: nodeDef.node_type,
              display_name: nodeDef.display_name,
              category: nodeDef.category,
              description: nodeDef.description,
              icon: nodeDef.icon,
              version: nodeDef.version,
              deprecated: nodeDef.deprecated,
              replaced_by: nodeDef.replaced_by,
              parameters_schema: nodeDef.parameters_schema,
              example_config: nodeDef.example_config
            })
            .select('id')
            .single();

          if (insertError) throw insertError;
          nodeDefinitionId = inserted.id;
          console.log(`Inserted node definition: ${nodeDef.display_name}`);
        }

        // Delete existing parameters for this node
        await supabase
          .from('node_parameters')
          .delete()
          .eq('node_definition_id', nodeDefinitionId);

        // Insert parameters
        if (nodeDef.parameters && nodeDef.parameters.length > 0) {
          const parametersToInsert = nodeDef.parameters.map(param => ({
            node_definition_id: nodeDefinitionId,
            parameter_name: param.parameter_name,
            parameter_type: param.parameter_type,
            required: param.required,
            default_value: param.default_value,
            description: param.description,
            options: param.options || {},
            validation_rules: param.validation_rules || {}
          }));

          const { error: paramError } = await supabase
            .from('node_parameters')
            .insert(parametersToInsert);

          if (paramError) throw paramError;
        }
      } catch (error) {
        console.error(`Error seeding node ${nodeDef.node_type}:`, error);
      }
    }

    console.log('Node definitions seeding completed!');
  }

  static async seedWorkflowTemplates(): Promise<void> {
    console.log('Seeding workflow templates...');
    
    const templates = [
      {
        name: 'Simple Webhook Processor',
        description: 'Basic webhook that processes incoming data and responds',
        category: 'Getting Started',
        tags: ['webhook', 'basic', 'api'],
        difficulty: 'beginner' as const,
        use_case: 'Process incoming webhook data with basic transformation',
        n8n_workflow: {
          name: 'Simple Webhook Processor',
          nodes: [
            {
              name: 'Webhook',
              type: 'n8n-nodes-base.webhook',
              typeVersion: 2,
              position: [240, 300],
              parameters: { path: 'process', httpMethod: 'POST' }
            },
            {
              name: 'Process Data',
              type: 'n8n-nodes-base.code',
              typeVersion: 2,
              position: [460, 300],
              parameters: {
                jsCode: 'for (const item of $input.all()) {\n  item.json.processed_at = new Date().toISOString();\n  item.json.status = "processed";\n}\nreturn $input.all();'
              }
            }
          ],
          connections: {
            'Webhook': { main: [[{ node: 'Process Data', type: 'main', index: 0 }]] }
          }
        },
        is_public: true
      }
    ];

    for (const template of templates) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) continue;

        // Check if template exists
        const { data: existing } = await supabase
          .from('workflow_templates')
          .select('id')
          .eq('name', template.name)
          .single();

        if (!existing) {
          await supabase
            .from('workflow_templates')
            .insert({
              ...template,
              user_id: user.id
            });
          
          console.log(`Seeded template: ${template.name}`);
        }
      } catch (error) {
        console.error(`Error seeding template ${template.name}:`, error);
      }
    }
  }
}
