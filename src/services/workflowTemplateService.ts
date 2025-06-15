
import { supabase } from '@/integrations/supabase/client';

export class WorkflowTemplateService {
  static async saveWorkflowAsTemplate(
    name: string,
    description: string,
    workflow: any,
    category: string,
    tags: string[] = [],
    useCase?: string,
    difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner',
    isPublic: boolean = false
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('workflows')
      .insert({
        user_id: user.id,
        name,
        description,
        n8n_json: workflow,
        status: 'draft',
        is_public: isPublic
      });

    if (error) throw error;
  }
}
