
import { NodeDefinitionSeeder } from './nodeDefinitionSeeder';
import { WorkflowTemplateSeeder } from './workflowTemplateSeeder';

export class SeedingCoordinator {
  static async seedAll(): Promise<void> {
    console.log('🌱 Starting comprehensive database seeding...');
    
    try {
      // Seed node definitions first
      await NodeDefinitionSeeder.seedNodeDefinitions();
      
      // Then seed workflow templates
      await WorkflowTemplateSeeder.seedWorkflowTemplates();
      
      console.log('✅ All seeding operations completed successfully!');
    } catch (error) {
      console.error('❌ Error during seeding process:', error);
      throw error;
    }
  }

  static async seedNodeDefinitionsOnly(): Promise<void> {
    console.log('🌱 Seeding node definitions only...');
    await NodeDefinitionSeeder.seedNodeDefinitions();
  }

  static async seedWorkflowTemplatesOnly(): Promise<void> {
    console.log('🌱 Seeding workflow templates only...');
    await WorkflowTemplateSeeder.seedWorkflowTemplates();
  }
}
