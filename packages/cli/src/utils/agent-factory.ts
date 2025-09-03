import { createAgent, SessionManager } from '@minicc/sdk';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { SessionHelper } from './session-helper';

export interface AgentInitOptions {
  sessionId?: string;
  continue?: boolean;
  resume?: boolean | string;
  newSession?: boolean;
}

export interface InitResult {
  agent: ReturnType<typeof createAgent>;
  sessionManager: SessionManager;
  sessionId: string;
}

export async function initializeAgent(options: AgentInitOptions = {}): Promise<InitResult> {
  // Check environment variables
  const apiKey = process.env.OPENAI_API_KEY || process.env.SILICONFLOW_API_KEY;
  const baseURL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  const model = process.env.MODEL || 'gpt-4';

  if (!apiKey) {
    console.error(chalk.red('Error: OPENAI_API_KEY environment variable is required'));
    console.error(chalk.yellow('\nTo set your configuration:'));
    console.error(chalk.gray('  export OPENAI_API_KEY=your-api-key-here'));
    console.error(
      chalk.gray(
        '  export OPENAI_BASE_URL=https://api.openai.com/v1    # Optional, defaults to OpenAI'
      )
    );
    console.error(
      chalk.gray(
        '  export MODEL=gpt-4                                  # Optional, defaults to gpt-4'
      )
    );
    console.error(chalk.gray('\nThen run:'));
    console.error(chalk.gray('  minicc'));
    console.error(chalk.gray('\nOr set permanently in your shell profile (~/.bashrc, ~/.zshrc):'));
    console.error(chalk.gray('  export OPENAI_API_KEY=your-api-key-here'));
    console.error(chalk.gray('  export OPENAI_BASE_URL=https://api.openai.com/v1'));
    console.error(chalk.gray('  export MODEL=gpt-4'));
    process.exit(1);
  }

  // Load custom system prompt if available
  let customPrompt: string | undefined;
  const promptFile = path.resolve('.minicc/system_prompt.md');
  if (fs.existsSync(promptFile)) {
    customPrompt = fs.readFileSync(promptFile, 'utf-8').trim();
    console.log(chalk.gray('✓ Loaded system prompt from .minicc/system_prompt.md'));
  }

  // Initialize agent using SDK
  const agent = createAgent({
    model,
    systemPrompt: customPrompt,
    openaiConfig: {
      apiKey,
      baseURL
    }
  });

  // Determine session ID based on options
  let sessionId: string;

  if (options.sessionId) {
    sessionId = options.sessionId;
  } else if (options.continue) {
    sessionId = await SessionHelper.getMostRecent(agent.sessionManager);
  } else if (options.resume) {
    if (typeof options.resume === 'string') {
      sessionId = options.resume;
    } else {
      sessionId = await SessionHelper.selectInteractively(agent.sessionManager);
    }
  } else if (options.newSession) {
    sessionId = SessionHelper.createNew();
  } else {
    sessionId = await SessionHelper.getOrCreateSession(agent.sessionManager);
  }

  return { agent, sessionManager: agent.sessionManager, sessionId };
}

export function setupDebugMode(filter?: string) {
  if (!filter) {
    console.log(chalk.yellow('[DEBUG] Debug mode enabled'));
    return;
  }

  // Simple filter implementation
  const includeFilters: string[] = [];
  const excludeFilters: string[] = [];

  filter.split(',').forEach(f => {
    f = f.trim();
    if (f.startsWith('!')) {
      excludeFilters.push(f.slice(1));
    } else {
      includeFilters.push(f);
    }
  });

  if (includeFilters.length > 0) {
    console.log(chalk.yellow(`[DEBUG] Debug mode enabled for: ${includeFilters.join(', ')}`));
  }
  if (excludeFilters.length > 0) {
    console.log(chalk.yellow(`[DEBUG] Debug mode excluding: ${excludeFilters.join(', ')}`));
  }
}
