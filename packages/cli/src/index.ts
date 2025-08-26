#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { config } from 'dotenv';
import * as path from 'path';
import { startInteractiveMode } from './commands/interactive';
import { queryCommand } from './commands/query';
import { listSessionsCommand } from './commands/sessions';

// Load environment variables from project root
config({ path: path.resolve(__dirname, '../../../.env') });

const program = new Command();

program
  .name('minicc')
  .description('MiniCC - Minimal Claude Code CLI')
  .version('0.1.0');

// Interactive mode (default)
program
  .command('chat', { isDefault: true })
  .description('Start interactive chat mode')
  .option('-s, --session <id>', 'Specify session ID')
  .option('--new', 'Start new session')
  .action(startInteractiveMode);

// Single query
program
  .command('query <question>')
  .description('Execute single query')
  .option('-s, --session <id>', 'Specify session ID')
  .action(queryCommand);

// Session management
program
  .command('sessions')
  .description('Manage session history')
  .option('-l, --list', 'List all sessions')
  .option('-d, --delete <id>', 'Delete specified session')
  .option('--clear', 'Clear all sessions')
  .action(listSessionsCommand);

// Error handling
program.exitOverride();

try {
  program.parse(process.argv);
} catch (error: any) {
  console.error(chalk.red('Error:'), error.message);
  process.exit(1);
}