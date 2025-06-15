
import { supabase } from '@/integrations/supabase/client';

export interface WorkflowTemplateSeed {
  name: string;
  description: string;
  category: string;
  tags: string[];
  n8n_workflow: any;
  use_case: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  is_public: boolean;
}

export class WorkflowTemplateSeeder {
  static readonly TEMPLATE_WORKFLOWS: WorkflowTemplateSeed[] = [
    {
      name: 'Simple Data Processing',
      description: 'Basic workflow to process and transform data',
      category: 'Data Processing',
      tags: ['beginner', 'data', 'transform'],
      n8n_workflow: {
        nodes: [
          {
            id: 'webhook',
            name: 'Webhook',
            type: 'n8n-nodes-base.webhook',
            typeVersion: 2,
            position: [100, 100],
            parameters: {
              path: 'data-processing'
            }
          },
          {
            id: 'code',
            name: 'Process Data',
            type: 'n8n-nodes-base.code',
            typeVersion: 2,
            position: [300, 100],
            parameters: {
              jsCode: 'return items.map(item => ({ ...item.json, processed: true }));'
            }
          }
        ],
        connections: {
          'Webhook': {
            main: [
              [{ node: 'Process Data', type: 'main', index: 0 }]
            ]
          }
        }
      },
      use_case: 'Process incoming data and add a processed flag',
      difficulty: 'beginner',
      is_public: true
    }
  ];

  static async seedWorkflowTemplates(): Promise<void> {
    console.log('Starting workflow templates seeding...');
    
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No authenticated user found - skipping template seeding');
        return;
      }

      for (const template of this.TEMPLATE_WORKFLOWS) {
        try {
          // Check if template already exists
          const { data: existing } = await supabase
            .from('workflows')
            .select('id')
            .eq('name', template.name)
            .eq('status', 'template')
            .single();

          if (existing) {
            console.log(`Template "${template.name}" already exists`);
            continue;
          }

          // Insert new template as a workflow with template status
          const { error: insertError } = await supabase
            .from('workflows')
            .insert({
              name: template.name,
              description: template.description,
              n8n_json: template.n8n_workflow,
              is_public: template.is_public,
              status: 'template',
              user_id: user.id
            });

          if (insertError) throw insertError;
          console.log(`Inserted workflow template: ${template.name}`);
        } catch (error) {
          console.error(`Error seeding template ${template.name}:`, error);
        }
      }
    } catch (error) {
      console.error('Error during template seeding:', error);
    }

    console.log('Workflow templates seeding completed!');
  }
}
