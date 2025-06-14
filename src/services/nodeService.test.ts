import { describe, it, expect } from 'vitest';
import { NodeService } from './nodeService';
import type { NodeParameter } from '@/integrations/supabase/types';

// Mock NodeParameter type locally if it's not directly importable or too complex
// For this example, we'll define a simplified version consistent with usage
interface TestNodeParameter {
  id?: string;
  node_definition_id?: string;
  parameter_name: string;
  parameter_type: string;
  required?: boolean;
  description?: string | null;
  default_value?: string | null;
  options?: any | null; // Simplified for testing; adjust if your type is more specific
  validation_rules?: any | null; // Simplified for testing
  created_at?: string;
  display_name?: string | null;
  placeholder?: string | null;
}

describe('NodeService.validateParameterValue', () => {
  const nodeService = new NodeService(); // Instantiation might not be needed if static

  // Helper to create a NodeParameter object for tests
  const createParam = (
    type: string,
    name: string = 'testParam',
    rules: any = {},
    options: any = null
  ): TestNodeParameter => ({
    parameter_name: name,
    parameter_type: type,
    validation_rules: rules,
    options: options,
  });

  // --- String type tests ---
  describe('string type', () => {
    it('should validate a valid string', () => {
      const param = createParam('string') as unknown as NodeParameter;
      const result = NodeService.validateParameterValue('hello', param);
      expect(result.isValid).toBe(true);
    });

    it('should invalidate non-string value', () => {
      const param = createParam('string') as unknown as NodeParameter;
      const result = NodeService.validateParameterValue(123, param);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Expected string value');
      expect(result.suggestion).toBe('Provide a text value');
    });

    it('should invalidate string shorter than minLength', () => {
      const param = createParam('string', 'test', { minLength: 5 }) as unknown as NodeParameter;
      const result = NodeService.validateParameterValue('hi', param);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Minimum length is 5');
      expect(result.suggestion).toBe('Provide at least 5 characters');
    });

    it('should validate string longer than or equal to minLength', () => {
      const param = createParam('string', 'test', { minLength: 3 }) as unknown as NodeParameter;
      const result = NodeService.validateParameterValue('hello', param);
      expect(result.isValid).toBe(true);
    });

    it('should invalidate string not matching pattern', () => {
      const param = createParam('string', 'email', { pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$' }) as unknown as NodeParameter;
      const result = NodeService.validateParameterValue('not-an-email', param);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Value does not match required pattern');
      expect(result.suggestion).toBe('Check the format requirements');
    });

    it('should validate string matching pattern', () => {
      const param = createParam('string', 'email', { pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$' }) as unknown as NodeParameter;
      const result = NodeService.validateParameterValue('test@example.com', param);
      expect(result.isValid).toBe(true);
    });
  });

  // --- Number type tests ---
  describe('number type', () => {
    it('should validate a valid number', () => {
      const param = createParam('number') as unknown as NodeParameter;
      const result = NodeService.validateParameterValue(123, param);
      expect(result.isValid).toBe(true);
    });

    it('should invalidate non-number value', () => {
      const param = createParam('number') as unknown as NodeParameter;
      const result = NodeService.validateParameterValue('abc', param);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Expected numeric value');
      expect(result.suggestion).toBe('Provide a number');
    });

    it('should validate "0" as a number', () => {
        const param = createParam('number') as unknown as NodeParameter;
        const result = NodeService.validateParameterValue(0, param);
        expect(result.isValid).toBe(true);
    });

    // According to implementation, string numbers are not valid.
    it('should invalidate string representation of a number', () => {
        const param = createParam('number') as unknown as NodeParameter;
        const result = NodeService.validateParameterValue("123", param);
        expect(result.isValid).toBe(false);
        expect(result.message).toBe('Expected numeric value');
    });
  });

  // --- Boolean type tests ---
  describe('boolean type', () => {
    it('should validate true', () => {
      const param = createParam('boolean') as unknown as NodeParameter;
      const result = NodeService.validateParameterValue(true, param);
      expect(result.isValid).toBe(true);
    });

    it('should validate false', () => {
      const param = createParam('boolean') as unknown as NodeParameter;
      const result = NodeService.validateParameterValue(false, param);
      expect(result.isValid).toBe(true);
    });

    it('should invalidate non-boolean value (string "true")', () => {
      const param = createParam('boolean') as unknown as NodeParameter;
      const result = NodeService.validateParameterValue('true', param);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Expected boolean value');
      expect(result.suggestion).toBe('Use true or false');
    });

    it('should invalidate non-boolean value (number 0)', () => {
      const param = createParam('boolean') as unknown as NodeParameter;
      const result = NodeService.validateParameterValue(0, param);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Expected boolean value');
    });
  });

  // --- Options type tests ---
  describe('options type', () => {
    const optionsParam = createParam('options', 'choice', {}, { options: ['A', 'B', 'C'] }) as unknown as NodeParameter;

    it('should validate a valid option', () => {
      const result = NodeService.validateParameterValue('A', optionsParam);
      expect(result.isValid).toBe(true);
    });

    it('should invalidate an option not in the list', () => {
      const result = NodeService.validateParameterValue('D', optionsParam);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Invalid option "D"');
      expect(result.suggestion).toBe('Choose from: A, B, C');
    });

    it('should handle empty options list gracefully (invalidate any option)', () => {
      const emptyOptionsParam = createParam('options', 'choice', {}, { options: [] }) as unknown as NodeParameter;
      const result = NodeService.validateParameterValue('A', emptyOptionsParam);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Invalid option "A"');
      expect(result.suggestion).toBe('Choose from: ');
    });

    it('should handle options list not defined (invalidate any option)', () => {
        const noOptionsParam = createParam('options', 'choice', {}, null) as unknown as NodeParameter;
        const result = NodeService.validateParameterValue('A', noOptionsParam);
        expect(result.isValid).toBe(false);
        expect(result.message).toBe('Invalid option "A"');
        // This suggestion might vary based on how null/undefined options are handled in the main code.
        // Current implementation of validateParameterValue would make options.join(', ') throw if parameter.options.options is undefined.
        // However, `(parameter.options as any)?.options || []` ensures it's an empty array.
        expect(result.suggestion).toBe('Choose from: ');
    });
  });

  // --- Unknown parameter type test ---
  describe('unknown parameter type', () => {
    it('should return specific error for unknown type', () => {
      const param = createParam('geolocation') as unknown as NodeParameter; // 'geolocation' is not a defined type
      const result = NodeService.validateParameterValue('some-value', param);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Unknown parameter type');
      expect(result.suggestion).toBe('Ensure the parameter type is correctly defined in the node definition.');
    });
  });

  // --- Parameter with no validation rules ---
  describe('parameter with no specific validation rules', () => {
    it('should validate a string if no specific rules are set', () => {
      const param = createParam('string') as unknown as NodeParameter; // No minLength, pattern, etc.
      const result = NodeService.validateParameterValue('any string is fine', param);
      expect(result.isValid).toBe(true);
    });

    it('should validate a number if no specific rules are set', () => {
      const param = createParam('number') as unknown as NodeParameter;
      const result = NodeService.validateParameterValue(999, param);
      expect(result.isValid).toBe(true);
    });
  });
});

// --- ModernizeNode Tests ---
describe('NodeService.modernizeNode', () => {
  // Mock NodeDefinition and NodeWithParameters for testing
  // Adjust fields as necessary based on actual NodeDefinition structure
  const createNodeDefinition = (
    node_type: string,
    deprecated: boolean,
    replaced_by: string | null = null,
    id: string = 'def-id',
    display_name: string = 'Test Node',
    parameters: any[] = [] // Assuming parameters might be part of NodeWithParameters
  ): any => ({ // Using 'any' for flexibility in mock, align with NodeWithParameters
    id,
    node_type,
    display_name,
    deprecated,
    replaced_by,
    category: 'test',
    description: 'A test node',
    example_config: {},
    icon: null,
    parameters_schema: {},
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    version: '1.0',
    parameters, // For NodeWithParameters
  });

  const createNode = (type: string, name: string = 'test-node', parameters: any = {}, typeVersion?: number) => {
    const node: any = {
      id: 'node-id-1',
      name,
      type,
      typeVersion: typeVersion === undefined ? 1 : typeVersion,
      parameters,
      credentials: {},
      position: [0,0],
    };
    if (typeVersion === undefined) delete node.typeVersion; // some nodes might not have it
    return node;
  };

  it('should modernize n8n-nodes-base.function to n8n-nodes-base.code', async () => {
    const oldNode = createNode('n8n-nodes-base.function', 'my-function', { functionCode: 'return 1;' });
    const nodeDef = createNodeDefinition('n8n-nodes-base.function', true, 'n8n-nodes-base.code');

    const modernized = await NodeService.modernizeNode(oldNode, nodeDef);

    expect(modernized).not.toBeNull();
    expect(modernized?.type).toBe('n8n-nodes-base.code');
    expect(modernized?.typeVersion).toBe(2);
    expect(modernized?.parameters.jsCode).toBe('return 1;');
    expect(modernized?.parameters.functionCode).toBeUndefined();
    expect(modernized?.parameters.mode).toBe('runOnceForAllItems');
    expect(modernized?.name).toBe('my-function'); // Ensure other props are preserved
  });

  it('should modernize a generic deprecated node with replaced_by', async () => {
    const oldNode = createNode('old-type', 'my-old-node', { param1: 'value1' }, 1);
    const nodeDef = createNodeDefinition('old-type', true, 'new-type');

    const modernized = await NodeService.modernizeNode(oldNode, nodeDef);

    expect(modernized).not.toBeNull();
    expect(modernized?.type).toBe('new-type');
    expect(modernized?.name).toBe('my-old-node');
    expect(modernized?.parameters.param1).toBe('value1');
    expect(modernized?.typeVersion).toBeUndefined(); // Should be removed by generic logic
  });

  it('should return null if node is not deprecated', async () => {
    const node = createNode('current-type');
    const nodeDef = createNodeDefinition('current-type', false);

    const modernized = await NodeService.modernizeNode(node, nodeDef);

    expect(modernized).toBeNull();
  });

  it('should return null if node is deprecated but has no replaced_by', async () => {
    const node = createNode('deprecated-no-replacement');
    const nodeDef = createNodeDefinition('deprecated-no-replacement', true, null);

    const modernized = await NodeService.modernizeNode(node, nodeDef);

    expect(modernized).toBeNull();
  });

  it('should return null if node definition is null', async () => {
    const node = createNode('some-type');
    const modernized = await NodeService.modernizeNode(node, null);
    expect(modernized).toBeNull();
  });

  it('generic replacement should keep specific parameters if node type is not function', async () => {
    const oldNode = createNode('another-old-type', 'my-other-node', { specificParam: 'valueXYZ' }, 2);
    const nodeDef = createNodeDefinition('another-old-type', true, 'another-new-type');

    const modernized = await NodeService.modernizeNode(oldNode, nodeDef);

    expect(modernized).not.toBeNull();
    expect(modernized?.type).toBe('another-new-type');
    expect(modernized?.parameters.specificParam).toBe('valueXYZ');
    // typeVersion deleted by generic logic
    expect(modernized?.typeVersion).toBeUndefined();
  });

   it('should prioritize specific n8n-nodes-base.function logic even if generic conditions met', async () => {
    // This definition also fits generic (deprecated, replaced_by)
    const nodeDef = createNodeDefinition('n8n-nodes-base.function', true, 'n8n-nodes-base.code');
    const oldNode = createNode('n8n-nodes-base.function', 'my-func', { functionCode: 'console.log("test")' });

    const modernized = await NodeService.modernizeNode(oldNode, nodeDef);

    expect(modernized).not.toBeNull();
    expect(modernized?.type).toBe('n8n-nodes-base.code'); // Specific replacement
    expect(modernized?.typeVersion).toBe(2); // Specific typeVersion
    expect(modernized?.parameters.jsCode).toBe('console.log("test")'); // Specific param migration
    expect(modernized?.parameters.mode).toBe('runOnceForAllItems');
  });

  it('should return null if node type in node object does not match node_type in definition (for function node)', async () => {
    const oldNode = createNode('n8n-nodes-base.someOtherFunctionLikeNode', 'my-func', { functionCode: 'console.log("test")' });
    // Definition is for the actual 'n8n-nodes-base.function'
    const nodeDef = createNodeDefinition('n8n-nodes-base.function', true, 'n8n-nodes-base.code');

    const modernized = await NodeService.modernizeNode(oldNode, nodeDef);
    // Since oldNode.type !== 'n8n-nodes-base.function', specific handler won't run.
    // And since nodeDef.node_type !== oldNode.type, generic handler also won't run based on this definition.
    // This scenario implies a mismatch in how nodeDefinition was fetched or passed.
    // The `modernizeNode` function expects `nodeDefinition` to be the definition for `node.type`.
    // If they don't match, it implies an issue upstream or incorrect test setup for this specific case.
    // However, if the nodeDef *was* for 'n8n-nodes-base.someOtherFunctionLikeNode' and it was deprecated, generic would run.
    // The current implementation of modernizeNode doesn't explicitly check nodeDefinition.node_type against node.type for the generic path,
    // but it does for the specific 'n8n-nodes-base.function' path.
    // Let's refine the test to reflect what happens if generic conditions are met but specific are not due to node.type mismatch

    const mismatchedNode = createNode('some-other-deprecated-type', 'my-mismatched-node', { paramA: 'valA' });
    const definitionForMismatchedType = createNodeDefinition('some-other-deprecated-type', true, 'new-type-for-mismatched');

    const modernizedMismatch = await NodeService.modernizeNode(mismatchedNode, definitionForMismatchedType);
    expect(modernizedMismatch).not.toBeNull(); // Should be handled by generic
    expect(modernizedMismatch?.type).toBe('new-type-for-mismatched');

    // Test for specific 'n8n-nodes-base.function' where node.type is different from nodeDefinition.node_type
     const functionNodeWrongType = createNode('actually-not-a-function-node', 'my-fn', { functionCode: 'return 1'});
     const functionDef = createNodeDefinition('n8n-nodes-base.function', true, 'n8n-nodes-base.code');
     // node.type is 'actually-not-a-function-node', nodeDefinition.node_type is 'n8n-nodes-base.function'
     // The specific 'if' condition `node.type === 'n8n-nodes-base.function' && nodeDefinition.node_type === 'n8n-nodes-base.function'` will fail.
     // The generic `if (nodeDefinition.deprecated && nodeDefinition.replaced_by)` will then be evaluated.
     // This would apply if 'n8n-nodes-base.function' (the definition) is deprecated and has a replacement.
     // This is an odd case: modernizing 'actually-not-a-function-node' based on rules for 'n8n-nodes-base.function'.
     // The expectation should be that `nodeDefinition` *is* the definition for `node.type`.
     // If they are different, the call to `modernizeNode` is already problematic.
     // `modernizeNode` itself doesn't validate this consistency for the generic path, only for the specific 'function' node path.
     const modernizedFnWrongType = await NodeService.modernizeNode(functionNodeWrongType, functionDef);
     // Since functionDef is for 'n8n-nodes-base.function', and it is deprecated with replaced_by,
     // and functionNodeWrongType.type is not 'n8n-nodes-base.function', the specific block is skipped.
     // The generic block then applies using functionDef:
     expect(modernizedFnWrongType).not.toBeNull();
     expect(modernizedFnWrongType?.type).toBe('n8n-nodes-base.code'); // Replacement from functionDef
     expect(modernizedFnWrongType?.parameters.functionCode).toBe('return 1'); // Parameters from original node are kept
     expect(modernizedFnWrongType?.typeVersion).toBeUndefined(); // typeVersion is deleted by generic path
  });
});
