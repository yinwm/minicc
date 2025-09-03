import chalk from 'chalk';
import inquirer from 'inquirer';
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

async function deleteSession(sessionManager: SessionManager, id: string) {
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Are you sure you want to delete session ${id}?`,
      default: false
    }
  ]);

  if (confirm) {
    await sessionManager.deleteSession(id);
    console.log(chalk.green(`✅ Session ${id} deleted`));
  }
}

async function clearAllSessions(sessionManager: SessionManager) {
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Clear all sessions? This cannot be undone!',
      default: false
    }
  ]);

  if (confirm) {
    await sessionManager.clearAllSessions();
    console.log(chalk.green('✅ All sessions cleared'));
  }
}

async function interactiveSessionManagement(sessionManager: SessionManager) {
  const sessions = await sessionManager.listSessions();
  
  if (sessions.length === 0) {
    console.log(chalk.yellow('No sessions found'));
    return;
  }

  const choices = [];
  for (const id of sessions) {
    const summary = await sessionManager.getSessionSummary(id);
    if (summary) {
      choices.push({
        name: `${id} (${summary.startTime.toLocaleDateString()} - ${summary.messageCount} messages)`,
        value: id
      });
    }
  }

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Select action:',
      choices: [
        { name: 'View session details', value: 'view' },
        { name: 'Delete session', value: 'delete' },
        { name: 'Clear all sessions', value: 'clear' },
        { name: 'Cancel', value: 'cancel' }
      ]
    }
  ]);

  switch (action) {
    case 'view':
      const { sessionId } = await inquirer.prompt([
        {
          type: 'list',
          name: 'sessionId',
          message: 'Select session to view:',
          choices
        }
      ]);
      await viewSession(sessionManager, sessionId);
      break;
    
    case 'delete':
      const { deleteId } = await inquirer.prompt([
        {
          type: 'list',
          name: 'deleteId',
          message: 'Select session to delete:',
          choices
        }
      ]);
      await deleteSession(sessionManager, deleteId);
      break;
    
    case 'clear':
      await clearAllSessions(sessionManager);
      break;
  }
}

async function viewSession(sessionManager: SessionManager, sessionId: string) {
  const session = await sessionManager.getSession(sessionId);
  if (!session) {
    console.log(chalk.red('Session not found'));
    return;
  }

  console.log(chalk.cyan(`\n=== Session ${sessionId} ===`));
  console.log(chalk.gray(`Start time: ${session.startTime.toLocaleString()}`));
  console.log(chalk.gray(`Last update: ${session.lastUpdateTime.toLocaleString()}`));
  console.log();

  session.messages.forEach((msg: any, index: number) => {
    if (msg.role === 'user') {
      console.log(chalk.blue(`[${index}] User:`));
      console.log(`  ${msg.content}`);
    } else if (msg.role === 'assistant' && msg.content) {
      console.log(chalk.green(`[${index}] Assistant:`));
      console.log(`  ${msg.content}`);
    } else if (msg.role === 'tool') {
      console.log(chalk.yellow(`[${index}] Tool result:`));
      console.log(`  ${msg.content?.toString().slice(0, 100)}...`);
    }
    console.log();
  });
}