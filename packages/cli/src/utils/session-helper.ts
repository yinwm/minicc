import { SessionManager } from '@minicc/sdk';
import { v4 as uuidv4 } from 'uuid';
import inquirer from 'inquirer';

/**
 * SessionHelper - Utility class for session management operations
 */
export class SessionHelper {
  /**
   * Get list of all sessions from session manager
   */
  static async getSessionList(sessionManager: SessionManager): Promise<string[]> {
    return await sessionManager.listSessions();
  }

  /**
   * Get the most recent session, or create new if none exists
   */
  static async getMostRecent(sessionManager: SessionManager): Promise<string> {
    const sessions = await this.getSessionList(sessionManager);
    if (sessions.length === 0) {
      return this.createNew();
    }
    return sessions[sessions.length - 1];
  }

  /**
   * Select session interactively (falls back to most recent in non-TTY)
   */
  static async selectInteractively(sessionManager: SessionManager): Promise<string> {
    const sessions = await this.getSessionList(sessionManager);

    if (sessions.length === 0) {
      return this.createNew();
    }

    // For non-interactive mode, just return the most recent
    if (process.stdout.isTTY !== true) {
      return sessions[sessions.length - 1];
    }

    // This would require inquirer, but for print mode we'll keep it simple
    return sessions[sessions.length - 1];
  }

  /**
   * Get or create session with user choice
   */
  static async getOrCreateSession(sessionManager: SessionManager): Promise<string> {
    const sessions = await this.getSessionList(sessionManager);

    if (sessions.length === 0) {
      return this.createNew();
    }

    // For non-interactive mode, create new session
    if (process.stdout.isTTY !== true) {
      return this.createNew();
    }

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

    return choice === 'new' ? this.createNew() : choice;
  }

  /**
   * Create a new session ID
   */
  static createNew(): string {
    return uuidv4();
  }
}
