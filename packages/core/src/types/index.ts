// 简化后的类型定义

import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

// 会话相关
export type Message = ChatCompletionMessageParam & {
  timestamp?: Date;
};

export interface Session {
  id: string;
  name?: string;
  startTime: Date;
  lastUpdateTime: Date;
  messages: Message[];
  context: Record<string, any>;
}

// 工具相关（OpenAI 兼容）
export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, any>; // JSON Schema
  };
}

// 工具执行结果
export interface ToolExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    executionTime: number;
    sql?: string;
    recordCount?: number;
  };
}

// 聊天响应
export interface ChatResponse {
  content: string;
  toolCalls?: any[];
  toolResults?: any[];
  error?: string;
}
