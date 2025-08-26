import { ToolDefinition, ToolExecutionResult } from '../types';

export { ToolExecutionResult } from '../types';

export abstract class BaseTool {
  abstract name: string;
  abstract description: string;
  abstract parameters: Record<string, any>;

  // 转换为 OpenAI 工具格式
  toOpenAITool(): ToolDefinition {
    return {
      type: 'function',
      function: {
        name: this.name,
        description: this.description,
        parameters: this.parameters
      }
    };
  }

  // 获取工具定义
  getDefinition(): ToolDefinition {
    return this.toOpenAITool();
  }

  // 工具执行
  abstract execute(args: any): Promise<ToolExecutionResult>;
}