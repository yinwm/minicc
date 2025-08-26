import { Session, Message } from '../types';
import * as fs from 'fs/promises';
import * as path from 'path';

export class SessionManager {
  private sessions: Map<string, Session> = new Map();
  private historyDir: string;

  constructor(historyDir: string = '.history') {
    this.historyDir = historyDir;
    this.ensureHistoryDir();
  }

  private async ensureHistoryDir() {
    try {
      await fs.mkdir(this.historyDir, { recursive: true });
    } catch (error) {
      console.error('创建历史记录目录失败:', error);
    }
  }

  async createSession(id: string, name?: string): Promise<Session> {
    const session: Session = {
      id,
      name: name || `会话_${id}`,
      startTime: new Date(),
      lastUpdateTime: new Date(),
      messages: [],
      context: {}
    };
    
    this.sessions.set(id, session);
    await this.saveSession(session);
    
    return session;
  }

  async getSession(id: string): Promise<Session | undefined> {
    // 先从内存中查找
    if (this.sessions.has(id)) {
      return this.sessions.get(id);
    }

    // 尝试从文件加载
    try {
      const filePath = this.getSessionFilePath(id);
      const data = await fs.readFile(filePath, 'utf-8');
      const session = JSON.parse(data);
      
      // 恢复日期对象
      session.startTime = new Date(session.startTime);
      session.lastUpdateTime = new Date(session.lastUpdateTime);
      session.messages.forEach((msg: Message) => {
        if (msg.timestamp) {
          msg.timestamp = new Date(msg.timestamp);
        }
      });
      
      this.sessions.set(id, session);
      return session;
    } catch (error) {
      // 文件不存在或读取失败
      return undefined;
    }
  }

  async saveSession(session: Session): Promise<void> {
    session.lastUpdateTime = new Date();
    
    try {
      const filePath = this.getSessionFilePath(session.id);
      const data = JSON.stringify(session, null, 2);
      await fs.writeFile(filePath, data, 'utf-8');
      console.log(`💾 会话已保存: ${session.id}`);
    } catch (error) {
      console.error('保存会话失败:', error);
      throw error;
    }
  }

  async listSessions(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.historyDir);
      return files
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''));
    } catch (error) {
      console.error('列出会话失败:', error);
      return [];
    }
  }

  async listSessionsWithDetails(): Promise<Array<{id: string, name?: string, createdAt: Date, messageCount: number}>> {
    try {
      const sessionIds = await this.listSessions();
      const sessions = [];
      
      for (const id of sessionIds) {
        const session = await this.getSession(id);
        if (session) {
          sessions.push({
            id: session.id,
            name: session.name,
            createdAt: session.startTime,
            messageCount: session.messages.length,
            lastMessageAt: session.lastUpdateTime
          });
        }
      }
      
      return sessions;
    } catch (error) {
      console.error('列出会话详情失败:', error);
      return [];
    }
  }

  async deleteSession(id: string): Promise<void> {
    this.sessions.delete(id);
    
    try {
      const filePath = this.getSessionFilePath(id);
      await fs.unlink(filePath);
      console.log(`🗑️ 会话已删除: ${id}`);
    } catch (error) {
      console.error('删除会话失败:', error);
    }
  }

  async clearAllSessions(): Promise<void> {
    this.sessions.clear();
    
    try {
      const files = await fs.readdir(this.historyDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          await fs.unlink(path.join(this.historyDir, file));
        }
      }
      console.log('🗑️ 所有会话已清除');
    } catch (error) {
      console.error('清除会话失败:', error);
    }
  }

  private getSessionFilePath(id: string): string {
    // 固定文件名，不要包含日期，否则无法正确读取
    return path.join(this.historyDir, `${id}.json`);
  }

  // 获取会话摘要（用于列表显示）
  async getSessionSummary(id: string): Promise<{
    id: string;
    startTime: Date;
    messageCount: number;
    lastMessage?: string;
  } | undefined> {
    const session = await this.getSession(id);
    if (!session) return undefined;

    const userMessages = session.messages.filter(m => m.role === 'user');
    const lastUserMessage = userMessages[userMessages.length - 1];

    return {
      id: session.id,
      startTime: session.startTime,
      messageCount: session.messages.length,
      lastMessage: lastUserMessage?.content?.toString().slice(0, 50)
    };
  }
}