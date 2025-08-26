import { BaseTool } from './base.tool';
import { FileReadTool, FileWriteTool, FileListTool } from './file.tool';
import { ShellTool } from './shell.tool';
import { SearchTool } from './search.tool';

export class ToolRegistry {
  private tools: Map<string, BaseTool> = new Map();

  constructor() {
    this.registerBuiltinTools();
  }

  private registerBuiltinTools() {
    // 注册内置工具
    this.register(new FileReadTool());
    this.register(new FileWriteTool());
    this.register(new FileListTool());
    this.register(new ShellTool());
    this.register(new SearchTool());
  }

  register(tool: BaseTool) {
    this.tools.set(tool.name, tool);
    console.log(`✅ Registered tool: ${tool.name}`);
  }

  getTool(name: string): BaseTool | undefined {
    return this.tools.get(name);
  }

  getAllTools(): BaseTool[] {
    return Array.from(this.tools.values());
  }

  getOpenAITools() {
    return this.getAllTools().map(tool => tool.toOpenAITool());
  }

  async execute(name: string, args: any): Promise<any> {
    const tool = this.getTool(name);
    if (!tool) {
      throw new Error(`Tool ${name} not found`);
    }
    return await tool.execute(args);
  }
}