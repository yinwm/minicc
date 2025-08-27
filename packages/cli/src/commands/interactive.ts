import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';
import { ChatService, SessionManager, LLMClient, ToolRegistry } from '@minicc/core';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

export async function startInteractiveMode(options: any) {
  // Display welcome message
  console.log(
    boxen(
      chalk.cyan.bold('MiniCC - AI Programming Assistant\n') +
      chalk.gray('Type "exit" or "quit" to leave\n') +
      chalk.gray('Type "help" for help'),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'cyan'
      }
    )
  );

  // Initialize services
  const sessionId = options.session || (options.new ? uuidv4() : await getOrCreateSession());
  const { chatService, sessionManager } = await initServices();

  console.log(chalk.green(`\n✨ Session started (ID: ${sessionId})\n`));

  // Main loop
  while (true) {
    const { question } = await inquirer.prompt([
      {
        type: 'input',
        name: 'question',
        message: chalk.cyan('Your question:'),
        prefix: '❯'
      }
    ]);

    // Handle special commands
    if (question.toLowerCase() === 'exit' || question.toLowerCase() === 'quit') {
      console.log(chalk.yellow('\n👋 Goodbye!\n'));
      process.exit(0);
    }

    if (question.toLowerCase() === 'help') {
      showHelp();
      continue;
    }

    if (question.toLowerCase() === 'clear') {
      console.clear();
      continue;
    }

    if (question.toLowerCase() === 'history') {
      await showHistory(sessionManager, sessionId);
      continue;
    }

    if (!question.trim()) {
      continue;
    }

    // Process user question
    const spinner = ora({
      text: 'Thinking...',
      spinner: 'dots'
    }).start();

    try {
      const response = await chatService.chat(sessionId, question);
      spinner.succeed('Done');
      
      // Display answer
      console.log('\n' + boxen(
        chalk.white(response),
        {
          padding: 1,
          borderStyle: 'single',
          borderColor: 'green'
        }
      ) + '\n');
    } catch (error: any) {
      spinner.fail('Failed');
      console.error(chalk.red('\nError:'), error.message, '\n');
    }
  }
}

async function initServices() {
  // Check environment variables
  const apiKey = process.env.OPENAI_API_KEY || process.env.SILICONFLOW_API_KEY;
  const baseURL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  const model = process.env.MODEL || 'gpt-4';

  if (!apiKey) {
    console.error(chalk.red('Error: Please set OPENAI_API_KEY environment variable'));
    process.exit(1);
  }

  // Load custom system prompt if available
  let customPrompt: string | undefined;
  
  // Check for .minicc/system_prompt.md file
  const promptFile = path.resolve('.minicc/system_prompt.md');
  if (fs.existsSync(promptFile)) {
    customPrompt = fs.readFileSync(promptFile, 'utf-8').trim();
    console.log(chalk.gray('✓ Loaded system prompt from .minicc/system_prompt.md'));
  }
  
  // Initialize services
  const llmClient = new LLMClient({ apiKey, baseURL, model });
  const toolRegistry = new ToolRegistry();
  const sessionManager = new SessionManager('.history');
  const chatService = new ChatService(llmClient, toolRegistry, sessionManager, model, customPrompt);

  return { chatService, sessionManager };
}

async function getOrCreateSession(): Promise<string> {
  const sessionManager = new SessionManager('.history');
  const sessions = await sessionManager.listSessions();

  if (sessions.length === 0) {
    return uuidv4();
  }

  // 让用户选择继续之前的会话或创建新会话
  const { choice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: 'Select session:',
      choices: [
        { name: 'Create new session', value: 'new' },
        ...sessions.map((id: string) => ({
          name: `Continue session: ${id}`,
          value: id
        }))
      ]
    }
  ]);

  return choice === 'new' ? uuidv4() : choice;
}

function showHelp() {
  console.log(
    boxen(
      chalk.yellow('Available Commands:\n\n') +
      chalk.white('help     - Show this help message\n') +
      chalk.white('clear    - Clear screen\n') +
      chalk.white('history  - Show current session history\n') +
      chalk.white('exit     - Exit program\n\n') +
      chalk.yellow('Example Usage:\n\n') +
      chalk.gray('• List all files in current directory\n') +
      chalk.gray('• Read the content of README.md\n') +
      chalk.gray('• Search for "function" in all .ts files\n') +
      chalk.gray('• Execute "npm test" command'),
      {
        padding: 1,
        borderStyle: 'double',
        borderColor: 'yellow'
      }
    )
  );
}

async function showHistory(sessionManager: SessionManager, sessionId: string) {
  const session = await sessionManager.getSession(sessionId);
  if (!session) {
    console.log(chalk.yellow('No session history found'));
    return;
  }

  console.log(chalk.cyan('\n=== Session History ===\n'));
  
  session.messages.forEach((msg: any) => {
    if (msg.role === 'user') {
      console.log(chalk.blue('User:'), msg.content);
    } else if (msg.role === 'assistant' && msg.content) {
      console.log(chalk.green('Assistant:'), msg.content);
    }
  });
  
  console.log(chalk.cyan('\n===============\n'));
}