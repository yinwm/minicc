import { BaseTool, ToolExecutionResult } from './base.tool';
import * as fs from 'fs/promises';
import * as path from 'path';

export class FileEditTool extends BaseTool {
  name = 'file_edit';
  description = 'Edit file by replacing specific content';
  
  parameters = {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Path to the file to edit'
      },
      oldContent: {
        type: 'string', 
        description: 'The exact content to replace (must match exactly)'
      },
      newContent: {
        type: 'string',
        description: 'The new content to replace with'
      },
      replaceAll: {
        type: 'boolean',
        description: 'Replace all occurrences (default: false)',
        default: false
      }
    },
    required: ['path', 'oldContent', 'newContent']
  };

  async execute(args: { 
    path: string; 
    oldContent: string; 
    newContent: string;
    replaceAll?: boolean 
  }): Promise<ToolExecutionResult> {
    try {
      const absolutePath = path.resolve(args.path);
      
      // Read the file
      const content = await fs.readFile(absolutePath, 'utf-8');
      
      // Check if old content exists
      if (!content.includes(args.oldContent)) {
        return {
          success: false,
          error: `Content to replace not found in file`
        };
      }
      
      // Replace content
      let newFileContent: string;
      if (args.replaceAll) {
        // Replace all occurrences
        newFileContent = content.split(args.oldContent).join(args.newContent);
      } else {
        // Replace only first occurrence
        const index = content.indexOf(args.oldContent);
        newFileContent = 
          content.substring(0, index) + 
          args.newContent + 
          content.substring(index + args.oldContent.length);
      }
      
      // Write back to file
      await fs.writeFile(absolutePath, newFileContent);
      
      // Count how many replacements were made
      const originalCount = content.split(args.oldContent).length - 1;
      const replacedCount = args.replaceAll ? originalCount : 1;
      
      return {
        success: true,
        data: {
          file: absolutePath,
          replacements: replacedCount,
          message: `Successfully replaced ${replacedCount} occurrence(s)`
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to edit file: ${error.message}`
      };
    }
  }
}

export class FileInsertTool extends BaseTool {
  name = 'file_insert';
  description = 'Insert content at a specific line in a file';
  
  parameters = {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Path to the file to edit'
      },
      line: {
        type: 'number',
        description: 'Line number to insert at (1-based)'
      },
      content: {
        type: 'string',
        description: 'Content to insert'
      },
      position: {
        type: 'string',
        enum: ['before', 'after'],
        description: 'Insert before or after the specified line',
        default: 'after'
      }
    },
    required: ['path', 'line', 'content']
  };

  async execute(args: {
    path: string;
    line: number;
    content: string;
    position?: 'before' | 'after';
  }): Promise<ToolExecutionResult> {
    try {
      const absolutePath = path.resolve(args.path);
      
      // Read file and split into lines
      const fileContent = await fs.readFile(absolutePath, 'utf-8');
      const lines = fileContent.split('\n');
      
      // Validate line number
      if (args.line < 1 || args.line > lines.length + 1) {
        return {
          success: false,
          error: `Line number ${args.line} is out of range (1-${lines.length})`
        };
      }
      
      // Insert content
      const position = args.position || 'after';
      const insertIndex = position === 'before' ? args.line - 1 : args.line;
      
      // Split content by newlines if it contains multiple lines
      const contentLines = args.content.split('\n');
      lines.splice(insertIndex, 0, ...contentLines);
      
      // Write back to file
      await fs.writeFile(absolutePath, lines.join('\n'));
      
      return {
        success: true,
        data: {
          file: absolutePath,
          insertedAt: args.line,
          position: position,
          linesAdded: contentLines.length
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to insert into file: ${error.message}`
      };
    }
  }
}

export class FileDeleteLinesTool extends BaseTool {
  name = 'file_delete_lines';
  description = 'Delete specific lines from a file';
  
  parameters = {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Path to the file to edit'
      },
      startLine: {
        type: 'number',
        description: 'Starting line number to delete (1-based)'
      },
      endLine: {
        type: 'number',
        description: 'Ending line number to delete (inclusive, optional)',
      }
    },
    required: ['path', 'startLine']
  };

  async execute(args: {
    path: string;
    startLine: number;
    endLine?: number;
  }): Promise<ToolExecutionResult> {
    try {
      const absolutePath = path.resolve(args.path);
      
      // Read file and split into lines
      const fileContent = await fs.readFile(absolutePath, 'utf-8');
      const lines = fileContent.split('\n');
      
      const endLine = args.endLine || args.startLine;
      
      // Validate line numbers
      if (args.startLine < 1 || args.startLine > lines.length) {
        return {
          success: false,
          error: `Start line ${args.startLine} is out of range (1-${lines.length})`
        };
      }
      
      if (endLine < args.startLine || endLine > lines.length) {
        return {
          success: false,
          error: `End line ${endLine} is invalid`
        };
      }
      
      // Delete lines
      const deletedLines = lines.splice(args.startLine - 1, endLine - args.startLine + 1);
      
      // Write back to file
      await fs.writeFile(absolutePath, lines.join('\n'));
      
      return {
        success: true,
        data: {
          file: absolutePath,
          deletedLines: deletedLines.length,
          fromLine: args.startLine,
          toLine: endLine
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to delete lines: ${error.message}`
      };
    }
  }
}