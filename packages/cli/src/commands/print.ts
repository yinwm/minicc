import chalk from 'chalk';
import ora from 'ora';
import { initializeAgent, setupDebugMode } from '../utils/agent-factory';

export async function printCommand(prompt: string, options: any) {
  if (!prompt.trim()) {
    console.error(chalk.red('Error: Prompt is required for print mode'));
    console.error(chalk.gray('Usage: minicc -p "your prompt"'));
    process.exit(1);
  }

  // Setup debug mode if enabled
  if (options.debug) {
    setupDebugMode(options.debug);
  }

  // Verbose mode
  if (options.verbose) {
    console.log(chalk.blue('[VERBOSE] Starting print command'));
    console.log(chalk.blue(`[VERBOSE] Prompt: ${prompt}`));
  }

  const spinner = ora('Initializing services...').start();

  try {
    // Initialize services
    const { agent, sessionId } = await initializeAgent({
      sessionId: options.sessionId,
      continue: options.continue,
      resume: options.resume,
      newSession: options.newSession
    });

    spinner.text = 'Processing...';

    // Execute query
    const response = await agent.chat(sessionId, prompt);

    spinner.succeed('Done');

    // Format and output result
    if (options.outputFormat === 'json') {
      outputJson(response, sessionId);
    } else {
      outputText(response, sessionId);
    }

    // Exit after printing
    process.exit(0);
  } catch (error: any) {
    spinner.fail('Failed');

    if (options.outputFormat === 'json') {
      outputError(error);
    } else {
      console.error(chalk.red('Error:'), error.message);
    }

    process.exit(1);
  }
}

function outputText(response: string, _sessionId: string) {
  console.log(response);
}

function outputJson(response: string, sessionId: string) {
  const output = {
    success: true,
    data: {
      content: response
    },
    metadata: {
      session_id: sessionId,
      tokens_used: 0, // TODO: Get actual token count
      duration_ms: 0 // TODO: Get actual duration
    }
  };

  console.log(JSON.stringify(output, null, 2));
}

function outputError(error: any) {
  const output = {
    success: false,
    error: {
      message: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    },
    metadata: {
      duration_ms: 0 // TODO: Get actual duration
    }
  };

  console.log(JSON.stringify(output, null, 2));
}
