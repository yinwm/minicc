import { BaseTool, ToolExecutionResult } from './base.tool';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class ShellTool extends BaseTool {
  name = 'shell_execute';
  description = 'Execute a shell command';

  parameters = {
    type: 'object',
    properties: {
      command: {
        type: 'string',
        description: 'The shell command to execute'
      },
      cwd: {
        type: 'string',
        description: 'Working directory for the command',
        default: process.cwd()
      },
      timeout: {
        type: 'number',
        description: 'Timeout in milliseconds',
        default: 30000
      }
    },
    required: ['command']
  };

  async execute(args: {
    command: string;
    cwd?: string;
    timeout?: number;
  }): Promise<ToolExecutionResult> {
    try {
      const options = {
        cwd: args.cwd || process.cwd(),
        timeout: args.timeout || 30000,
        maxBuffer: 1024 * 1024 * 10 // 10MB
      };

      const { stdout, stderr } = await execAsync(args.command, options);

      return {
        success: true,
        data: {
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          command: args.command
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Command failed: ${error.message}`,
        data: {
          stdout: error.stdout?.trim(),
          stderr: error.stderr?.trim(),
          code: error.code
        }
      };
    }
  }
}
