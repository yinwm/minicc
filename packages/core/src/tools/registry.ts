import { BaseTool } from './base.tool';
import { FileReadTool, FileWriteTool, FileListTool } from './file.tool';
import { FileEditTool, FileInsertTool, FileDeleteLinesTool } from './edit.tool';
import { ShellTool } from './shell.tool';
import { SearchTool } from './search.tool';

export interface ToolRegistryOptions {
  autoRegisterBuiltin?: boolean;
}

export class ToolRegistry {
  private tools: Map<string, BaseTool> = new Map();

  constructor(options: ToolRegistryOptions = {}) {
    const { autoRegisterBuiltin = true } = options;

    if (autoRegisterBuiltin) {
      this.registerBuiltinTools();
    }
  }

  public registerBuiltinTools() {
    // File operation tools
    this.register(new FileReadTool());
    this.register(new FileWriteTool());
    this.register(new FileListTool());

    // File editing tools
    this.register(new FileEditTool());
    this.register(new FileInsertTool());
    this.register(new FileDeleteLinesTool());

    // Other tools
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
