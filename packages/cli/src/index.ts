#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { startInteractiveMode } from './commands/interactive';
import { printCommand } from './commands/print';
import { listSessionsCommand } from './commands/sessions';

const program = new Command();

program.name('minicc').description('MiniCC - Minimal Claude Code CLI').version('0.2.1');

// Main command - handle interactive mode and single argument
program
  .argument('[prompt]', 'Prompt to process')
  .option('-c, --continue', 'Continue the most recent conversation')
  .option(
    '-r, --resume [sessionId]',
    'Resume a conversation - provide a session ID or interactively select'
  )
  .option('--session-id <id>', 'Use a specific session ID for the conversation')
  .option('--new-session', 'Force create a new session')
  .option('-p, --print', 'Print response and exit (useful for pipes)')
  .option(
    '--output-format <format>',
    'Output format (only works with --print): "text" (default), "json"',
    'text'
  )
  .option('--debug [filter]', 'Enable debug mode with optional category filtering')
  .option('--verbose', 'Override verbose mode setting from config')
  .action(async (prompt, options) => {
    try {
      if (options.print) {
        // Print mode - execute and exit
        if (!prompt) {
          console.error(chalk.red('Error: Prompt is required for print mode'));
          console.error(chalk.gray('Usage: minicc -p "your prompt"'));
          process.exit(1);
        }
        await printCommand(prompt, options);
      } else if (prompt) {
        // Single prompt without -p is not allowed
        console.error(chalk.red('Error: Use -p option for single execution'));
        console.error(chalk.gray('Usage: minicc -p "your prompt"'));
        console.error(chalk.gray('For interactive mode, use: minicc'));
        process.exit(1);
      } else {
        // Interactive mode
        await startInteractiveMode(options);
      }
    } catch (error: any) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// Sessions subcommand
program
  .command('sessions')
  .description('Manage session history')
  .option('--list', 'List all sessions')
  .action(listSessionsCommand);

// Error handling
program.exitOverride();

try {
  program.parse(process.argv);
} catch (error: any) {
  console.error(chalk.red('Error:'), error.message);
  process.exit(1);
}
