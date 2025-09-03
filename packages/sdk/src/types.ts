// Re-export core types that SDK users need
export type { Message, Session, ToolExecutionResult } from '@minicc/core';

// SDK-specific configuration types
export interface OpenAIConfig {
  apiKey: string;
  baseURL?: string;
  model?: string;
}

export interface AgentConfig {
  model?: string;
  systemPrompt?: string;
  tools?: any[];
  openaiConfig: OpenAIConfig;
  autoRegisterBuiltins?: boolean;
}

export interface AgentInstance {
  chat(sessionId: string, message: string): Promise<string>;
  chatService: any;
  sessionManager: any;
}
