import { ToolRegistry } from '../src/tools/registry';
import { BaseTool } from '../src/tools/base.tool';

class MockTool extends BaseTool {
  name = 'mock-tool';
  description = 'A mock tool for testing';

  async execute(args: any): Promise<{ success: boolean; result?: any; error?: string }> {
    if (args.shouldFail) {
      return { success: false, error: 'Mock error' };
    }
    return { success: true, result: 'mock result' };
  }

  getSchema() {
    return {
      type: 'object',
      properties: {
        shouldFail: { type: 'boolean' }
      }
    };
  }
}

describe('ToolRegistry', () => {
  let registry: ToolRegistry;

  beforeEach(() => {
    registry = new ToolRegistry({ autoRegisterBuiltin: false });
  });

  test('should register and retrieve tools', () => {
    const mockTool = new MockTool();
    registry.register(mockTool);

    const retrieved = registry.getTool('mock-tool');
    expect(retrieved).toBe(mockTool);
  });

  test('should return undefined for non-existent tool', () => {
    const retrieved = registry.getTool('non-existent');
    expect(retrieved).toBeUndefined();
  });

  test('should generate OpenAI tools format', () => {
    const mockTool = new MockTool();
    registry.register(mockTool);

    const openaiTools = registry.getOpenAITools();
    expect(openaiTools).toHaveLength(1);
    expect(openaiTools[0]).toEqual({
      type: 'function',
      function: {
        name: 'mock-tool',
        description: 'A mock tool for testing',
        parameters: {
          type: 'object',
          properties: {
            shouldFail: { type: 'boolean' }
          }
        }
      }
    });
  });

  test('should list all registered tools', () => {
    const mockTool = new MockTool();
    registry.register(mockTool);

    const tools = registry.listTools();
    expect(tools).toHaveLength(1);
    expect(tools[0].name).toBe('mock-tool');
  });
});
