
import { supabase } from '@/integrations/supabase/client';
import { N8N_NODE_TYPES } from '@/data/n8nNodeReference';

export interface NodeDefinitionSeed {
  name: string;
  display_name: string;
  description: string;
  icon?: string;
  default_version?: number;
  code_base_version?: string;
  subtitle?: string;
  node_group?: string;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    default_value?: string;
    description: string;
    options?: any;
    validation?: any;
  }>;
}

export class NodeSeeder {
  static readonly COMPREHENSIVE_NODE_DEFINITIONS: NodeDefinitionSeed[] = [
    {
      name: 'n8n-nodes-base.webhook',
      display_name: 'Webhook',
      description: 'Receive HTTP requests and trigger workflow execution',
      icon: 'webhook',
      default_version: 2,
      parameters: [
        {
          name: 'path',
          type: 'string',
          required: true,
          description: 'The webhook URL path'
        },
        {
          name: 'httpMethod',
          type: 'options',
          required: false,
          default_value: 'GET',
          description: 'HTTP method to listen for'
        }
      ]
    },
    {
      name: 'n8n-nodes-base.code',
      display_name: 'Code',
      description: 'Execute custom JavaScript code to process data',
      icon: 'code',
      default_version: 2,
      parameters: [
        {
          name: 'jsCode',
          type: 'string',
          required: true,
          description: 'JavaScript code to execute'
        },
        {
          name: 'mode',
          type: 'options',
          required: false,
          default_value: 'runOnceForAllItems',
          description: 'Execution mode'
        }
      ]
    },
    {
      name: 'n8n-nodes-base.httpRequest',
      display_name: 'HTTP Request',
      description: 'Make HTTP requests to any URL or API endpoint',
      icon: 'globe',
      default_version: 4,
      parameters: [
        {
          name: 'url',
          type: 'string',
          required: true,
          description: 'The URL to make the request to'
        },
        {
          name: 'method',
          type: 'options',
          required: false,
          default_value: 'GET',
          description: 'HTTP method'
        }
      ]
    },
    {
      name: 'n8n-nodes-base.set',
      display_name: 'Edit Fields (Set)',
      description: 'Set or modify field values on items',
      icon: 'edit',
      default_version: 3,
      parameters: [
        {
          name: 'fields',
          type: 'collection',
          required: true,
          description: 'Fields to set or modify'
        }
      ]
    },
    {
      name: 'n8n-nodes-base.if',
      display_name: 'If',
      description: 'Split workflow execution based on conditions',
      icon: 'split',
      default_version: 2,
      parameters: [
        {
          name: 'conditions',
          type: 'collection',
          required: true,
          description: 'Conditions to evaluate'
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
          .eq('name', nodeDef.name)
          .single();

        if (existing) {
          // Update existing definition
          const { error: updateError } = await supabase
            .from('node_definitions')
            .update({
              display_name: nodeDef.display_name,
              description: nodeDef.description,
              icon: nodeDef.icon,
              default_version: nodeDef.default_version,
              code_base_version: nodeDef.code_base_version,
              subtitle: nodeDef.subtitle,
              node_group: nodeDef.node_group
            })
            .eq('name', nodeDef.name);

          if (updateError) throw updateError;
          console.log(`Updated node definition: ${nodeDef.display_name}`);
        } else {
          // Insert new definition
          const { error: insertError } = await supabase
            .from('node_definitions')
            .insert({
              name: nodeDef.name,
              display_name: nodeDef.display_name,
              description: nodeDef.description,
              icon: nodeDef.icon,
              default_version: nodeDef.default_version,
              code_base_version: nodeDef.code_base_version,
              subtitle: nodeDef.subtitle,
              node_group: nodeDef.node_group
            });

          if (insertError) throw insertError;
          console.log(`Inserted node definition: ${nodeDef.display_name}`);
        }
      } catch (error) {
        console.error(`Error seeding node ${nodeDef.name}:`, error);
      }
    }

    console.log('Node definitions seeding completed!');
  }

  // Remove workflow templates seeding since the table doesn't exist
  static async seedWorkflowTemplates(): Promise<void> {
    console.log('Workflow templates seeding skipped - table does not exist');
    console.log('Templates will be stored as regular workflows with template metadata');
  }
}
