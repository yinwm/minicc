import { BaseTool, ToolExecutionResult } from './base.tool';
import * as fs from 'fs/promises';
import * as path from 'path';

export class FileReadTool extends BaseTool {
  name = 'file_read';
  description = 'Read contents of a file';
  
  parameters = {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Path to the file to read'
      }
    },
    required: ['path']
  };

  async execute(args: { path: string }): Promise<ToolExecutionResult> {
    try {
      const absolutePath = path.resolve(args.path);
      const content = await fs.readFile(absolutePath, 'utf-8');
      
      return {
        success: true,
        data: content
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to read file: ${error.message}`
      };
    }
  }
}

export class FileWriteTool extends BaseTool {
  name = 'file_write';
  description = 'Write content to a file';
  
  parameters = {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Path to the file to write'
      },
      content: {
        type: 'string',
        description: 'Content to write to the file'
      },
      mode: {
        type: 'string',
        enum: ['overwrite', 'append'],
        description: 'Write mode: overwrite or append',
        default: 'overwrite'
      }
    },
    required: ['path', 'content']
  };

  async execute(args: { path: string; content: string; mode?: string }): Promise<ToolExecutionResult> {
    try {
      const absolutePath = path.resolve(args.path);
      const dir = path.dirname(absolutePath);
      
      await fs.mkdir(dir, { recursive: true });
      
      if (args.mode === 'append') {
        await fs.appendFile(absolutePath, args.content);
      } else {
        await fs.writeFile(absolutePath, args.content);
      }
      
      return {
        success: true,
        data: `File written successfully: ${absolutePath}`
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to write file: ${error.message}`
      };
    }
  }
}

export class FileListTool extends BaseTool {
  name = 'file_list';
  description = 'List files in a directory';
  
  parameters = {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Path to the directory',
        default: '.'
      },
      recursive: {
        type: 'boolean',
        description: 'Whether to list files recursively',
        default: false
      }
    }
  };

  async execute(args: { path?: string; recursive?: boolean }): Promise<ToolExecutionResult> {
    try {
      const dirPath = path.resolve(args.path || '.');
      const files = await this.listFiles(dirPath, args.recursive || false);
      
      return {
        success: true,
        data: files
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to list files: ${error.message}`
      };
    }
  }

  private async listFiles(dirPath: string, recursive: boolean): Promise<string[]> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory() && recursive) {
        const subFiles = await this.listFiles(fullPath, recursive);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }

    return files;
  }
}