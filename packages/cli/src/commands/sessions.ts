import chalk from 'chalk';
import inquirer from 'inquirer';
import { SessionManager } from '@minicc/core';

export async function listSessionsCommand(options: any) {
  const sessionManager = new SessionManager('.history');

  if (options.list) {
    await listSessions(sessionManager);
  } else if (options.delete) {
    await deleteSession(sessionManager, options.delete);
  } else if (options.clear) {
    await clearAllSessions(sessionManager);
  } else {
    // 交互式会话管理
    await interactiveSessionManagement(sessionManager);
  }
}

async function listSessions(sessionManager: SessionManager) {
  const sessions = await sessionManager.listSessions();
  
  if (sessions.length === 0) {
    console.log(chalk.yellow('没有找到历史会话'));
    return;
  }

  console.log(chalk.cyan('\n=== 历史会话 ===\n'));
  
  for (const id of sessions) {
    const summary = await sessionManager.getSessionSummary(id);
    if (summary) {
      console.log(chalk.green(`• ${id}`));
      console.log(chalk.gray(`  开始时间: ${summary.startTime.toLocaleString()}`));
      console.log(chalk.gray(`  消息数量: ${summary.messageCount}`));
      if (summary.lastMessage) {
        console.log(chalk.gray(`  最后消息: ${summary.lastMessage}...`));
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
      message: `确定要删除会话 ${id} 吗？`,
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
    console.log(chalk.yellow('没有找到历史会话'));
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
          message: '选择要删除的会话:',
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
    console.log(chalk.red('会话不存在'));
    return;
  }

  console.log(chalk.cyan(`\n=== 会话 ${sessionId} ===`));
  console.log(chalk.gray(`开始时间: ${session.startTime.toLocaleString()}`));
  console.log(chalk.gray(`最后更新: ${session.lastUpdateTime.toLocaleString()}`));
  console.log();

  session.messages.forEach((msg: any, index: number) => {
    if (msg.role === 'user') {
      console.log(chalk.blue(`[${index}] 用户:`));
      console.log(`  ${msg.content}`);
    } else if (msg.role === 'assistant' && msg.content) {
      console.log(chalk.green(`[${index}] 助手:`));
      console.log(`  ${msg.content}`);
    } else if (msg.role === 'tool') {
      console.log(chalk.yellow(`[${index}] 工具结果:`));
      console.log(`  ${msg.content?.toString().slice(0, 100)}...`);
    }
    console.log();
  });
}