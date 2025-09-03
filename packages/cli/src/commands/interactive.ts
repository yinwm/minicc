import input from '@inquirer/input';
import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';
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
      chalk.gray('Type "exit" or "quit" to leave'),
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

    // Handle exit commands
    if (userInput.toLowerCase() === 'exit' || userInput.toLowerCase() === 'quit') {
      console.log(chalk.yellow('\n👋 Goodbye!\n'));
      process.exit(0);
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






