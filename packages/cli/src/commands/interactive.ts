import input from '@inquirer/input';
import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';
import { SessionManager } from '@minicc/sdk';
import { initializeAgent, setupDebugMode } from '../utils/agent-factory';

export async function startInteractiveMode(options: any) {
  // Setup debug mode if enabled
  if (options.debug) {
    setupDebugMode(options.debug);
  }

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
  const { agent, sessionManager, sessionId } = await initializeAgent({
    sessionId: options.sessionId,
    continue: options.continue,
    resume: options.resume,
    newSession: options.newSession
  });

  console.log(chalk.green(`\n✨ Session started (ID: ${sessionId})\n`));

  // Main loop
  while (true) {
    const userInput = await input({
      message: '',
      theme: {
        style: {
          message: () => '',
        },
        prefix: '❯'
      }
    });

    // Handle special commands
    if (userInput.toLowerCase() === 'exit' || userInput.toLowerCase() === 'quit') {
      console.log(chalk.yellow('\n👋 Goodbye!\n'));
      process.exit(0);
    }

    if (userInput.toLowerCase() === 'help') {
      showHelp();
      continue;
    }

    if (userInput.toLowerCase() === 'clear') {
      console.clear();
      continue;
    }

    if (userInput.toLowerCase() === 'history') {
      await showHistory(sessionManager, sessionId);
      continue;
    }

    if (!userInput.trim()) {
      continue;
    }

    // Process user question
    const spinner = ora({
      text: 'Thinking...',
      spinner: 'dots'
    }).start();

    try {
      const response = await agent.chat(sessionId, userInput);
      spinner.succeed('Done');
      
      // Display answer
      console.log(chalk.white(response.trim()) + '\n');
    } catch (error: any) {
      spinner.fail('Failed');
      console.error(chalk.red('\nError:'), error.message, '\n');
    }
  }
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