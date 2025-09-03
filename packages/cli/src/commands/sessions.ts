import chalk from 'chalk';
import { SessionManager } from '@minicc/sdk';

export async function listSessionsCommand(options: any) {
  const sessionManager = new SessionManager('.history');

  if (options.list) {
    await listSessions(sessionManager);
  } else {
    // Default to list when no other option is provided
    await listSessions(sessionManager);
  }
}

async function listSessions(sessionManager: SessionManager) {
  const sessions = await sessionManager.listSessions();

  if (sessions.length === 0) {
    console.log(chalk.yellow('No sessions found'));
    return;
  }

  console.log(chalk.cyan('\n=== Session History ===\n'));

  for (const id of sessions) {
    const summary = await sessionManager.getSessionSummary(id);
    if (summary) {
      console.log(chalk.green(`• ${id}`));
      console.log(chalk.gray(`  Start time: ${summary.startTime.toLocaleString()}`));
      console.log(chalk.gray(`  Message count: ${summary.messageCount}`));
      if (summary.lastMessage) {
        console.log(chalk.gray(`  Last message: ${summary.lastMessage}...`));
      }
      console.log();
    }
  }
}
