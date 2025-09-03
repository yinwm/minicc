import chalk from 'chalk';
import ora from 'ora';
import { initializeAgent } from '../utils/agent-factory';

export async function queryCommand(question: string, options: any) {
  const spinner = ora('Initializing services...').start();

  try {
    // Initialize services using shared factory
    const { agent, sessionId } = await initializeAgent({
      sessionId: options.session
    });

    spinner.text = 'Thinking...';

    // Execute query
    const response = await agent.chat(sessionId, question);

    spinner.succeed('Query completed');

    // Display result
    console.log('\n' + chalk.green('Answer:'));
    console.log(response);
    console.log('\n' + chalk.gray(`Session ID: ${sessionId}`));
  } catch (error: any) {
    spinner.fail('Query failed');
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}
