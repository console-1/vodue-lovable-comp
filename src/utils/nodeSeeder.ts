
import { SeedingCoordinator } from './seeding/seedingCoordinator';
import { NodeDefinitionSeeder } from './seeding/nodeDefinitionSeeder';
import { WorkflowTemplateSeeder } from './seeding/workflowTemplateSeeder';

// Re-export main classes for backward compatibility
export { NodeDefinitionSeeder, WorkflowTemplateSeeder, SeedingCoordinator };

// Legacy interface exports for backward compatibility
export type { NodeDefinitionSeed } from './seeding/nodeDefinitionSeeder';
export type { WorkflowTemplateSeed } from './seeding/workflowTemplateSeeder';

export class NodeSeeder {
  static async seedNodeDefinitions(): Promise<void> {
    return NodeDefinitionSeeder.seedNodeDefinitions();
  }

  static async seedWorkflowTemplates(): Promise<void> {
    return WorkflowTemplateSeeder.seedWorkflowTemplates();
  }

  static async seedAll(): Promise<void> {
    return SeedingCoordinator.seedAll();
  }
}
