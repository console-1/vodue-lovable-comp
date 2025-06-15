
import { useState } from 'react';
import { SeedingCoordinator } from '@/utils/seeding/seedingCoordinator';
import { useToast } from '@/hooks/use-toast';

export const useNodeSeeding = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedingProgress, setSeedingProgress] = useState<string>('');
  const { toast } = useToast();

  const seedDatabase = async () => {
    setIsSeeding(true);
    setSeedingProgress('Starting database seeding...');

    try {
      setSeedingProgress('Seeding node definitions...');
      await SeedingCoordinator.seedNodeDefinitionsOnly();
      
      setSeedingProgress('Seeding workflow templates...');
      await SeedingCoordinator.seedWorkflowTemplatesOnly();
      
      setSeedingProgress('Seeding completed successfully!');
      
      toast({
        title: "Database Seeded",
        description: "Node definitions and templates have been successfully loaded",
        variant: "default"
      });
    } catch (error) {
      console.error('Seeding error:', error);
      setSeedingProgress('Seeding failed');
      
      toast({
        title: "Seeding Error",
        description: "Failed to seed database with node definitions",
        variant: "destructive"
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return {
    isSeeding,
    seedingProgress,
    seedDatabase
  };
};
