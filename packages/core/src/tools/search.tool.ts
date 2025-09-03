import { BaseTool, ToolExecutionResult } from './base.tool';
import * as fs from 'fs/promises';
import * as path from 'path';

export class SearchTool extends BaseTool {
  name = 'code_search';
  description = 'Search for patterns in code files';

  parameters = {
    type: 'object',
    properties: {
      pattern: {
        type: 'string',
        description: 'Pattern to search for (regex supported)'
      },
      directory: {
        type: 'string',
        description: 'Directory to search in',
        default: '.'
      },
      fileExtensions: {
        type: 'array',
        items: { type: 'string' },
        description: 'File extensions to include (e.g., ["js", "ts"])',
        default: []
      },
      maxResults: {
        type: 'number',
        description: 'Maximum number of results to return',
        default: 50
      }
    },
    required: ['pattern']
  };

  async execute(args: {
    pattern: string;
    directory?: string;
    fileExtensions?: string[];
    maxResults?: number;
  }): Promise<ToolExecutionResult> {
    try {
      const searchDir = path.resolve(args.directory || '.');
      const pattern = new RegExp(args.pattern, 'gi');
      const results: Array<{
        file: string;
        line: number;
        match: string;
      }> = [];

      await this.searchInDirectory(
        searchDir,
        pattern,
        args.fileExtensions || [],
        results,
        args.maxResults || 50
      );

      return {
        success: true,
        data: {
          query: args.pattern,
          totalMatches: results.length,
          results
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Search failed: ${error.message}`
      };
    }
  }

  private async searchInDirectory(
    dir: string,
    pattern: RegExp,
    extensions: string[],
    results: any[],
    maxResults: number
  ): Promise<void> {
    if (results.length >= maxResults) return;

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (results.length >= maxResults) break;

        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await this.searchInDirectory(fullPath, pattern, extensions, results, maxResults);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).slice(1);

          if (extensions.length === 0 || extensions.includes(ext)) {
            await this.searchInFile(fullPath, pattern, results, maxResults);
          }
        }
      }
    } catch (error) {
      // Ignore permission errors
    }
  }

  private async searchInFile(
    filePath: string,
    pattern: RegExp,
    results: any[],
    maxResults: number
  ): Promise<void> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length && results.length < maxResults; i++) {
        const matches = lines[i].matchAll(pattern);

        for (const _match of matches) {
          if (results.length >= maxResults) break;

          results.push({
            file: filePath,
            line: i + 1,
            match: lines[i].trim()
          });
        }
      }
    } catch (error) {
      // Ignore read errors
    }
  }
}
