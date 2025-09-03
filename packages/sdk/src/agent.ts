import { 
  LLMClient, 
  ToolRegistry, 
  SessionManager, 
  ChatService 
} from '@minicc/core';
import type { AgentConfig, AgentInstance } from './types';

/**
 * Create an AI agent instance with the provided configuration
 * 
 * @param config Agent configuration
 * @returns Agent instance with chat functionality
 */
export function createAgent(config: AgentConfig): AgentInstance {
  // Initialize LLM client
  const llmClient = new LLMClient({
    apiKey: config.openaiConfig.apiKey,
    baseURL: config.openaiConfig.baseURL,
    model: config.openaiConfig.model
  });

  // Initialize tool registry
  const toolRegistry = new ToolRegistry({
    autoRegisterBuiltin: config.autoRegisterBuiltins !== false
  });

  // Register custom tools if provided
  if (config.tools) {
    config.tools.forEach(tool => {
      toolRegistry.register(tool);
    });
  }

  // Initialize session manager (using default .history directory)
  const sessionManager = new SessionManager('.history');

  // Initialize chat service
  const chatService = new ChatService({
    llmClient,
    toolRegistry,
    sessionManager,
    model: config.model || 'gpt-4',
    systemPrompt: config.systemPrompt
  });

  return {
    async chat(sessionId: string, message: string): Promise<string> {
      return await chatService.chat(sessionId, message);
    },
    chatService,
    sessionManager
  };
}