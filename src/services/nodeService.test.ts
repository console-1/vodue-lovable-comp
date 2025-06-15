
import { NodeService } from './nodeService';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          data: [],
          error: null
        }))
      }))
    }))
  }
}));

describe('NodeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateWorkflow', () => {
    it('should return error for workflow without nodes', async () => {
      const workflow = {};
      const result = await NodeService.validateWorkflow(workflow);
      
      expect(result.isValid).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].message).toBe('Workflow must contain nodes array');
    });

    it('should validate workflow with nodes', async () => {
      const workflow = {
        nodes: [
          {
            id: '1',
            name: 'test-node',
            type: 'n8n-nodes-base.webhook',
            parameters: {}
          }
        ],
        connections: {}
      };
      
      const result = await NodeService.validateWorkflow(workflow);
      expect(result).toBeDefined();
    });
  });

  describe('validateConnections', () => {
    it('should validate connections correctly', () => {
      const workflow = {
        nodes: [
          { name: 'node1' },
          { name: 'node2' }
        ],
        connections: {
          node1: {
            main: [[{ node: 'node2', type: 'main', index: 0 }]]
          }
        }
      };
      
      const issues = NodeService.validateConnections(workflow);
      expect(issues).toHaveLength(0);
    });

    it('should detect invalid connections', () => {
      const workflow = {
        nodes: [{ name: 'node1' }],
        connections: {
          node1: {
            main: [[{ node: 'nonexistent', type: 'main', index: 0 }]]
          }
        }
      };
      
      const issues = NodeService.validateConnections(workflow);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].type).toBe('error');
    });
  });
});
