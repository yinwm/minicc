import OpenAI from 'openai';
import { LLMClient } from '../llm/client';
import { ToolRegistry } from '../tools/registry';
import { Message, Session } from '../types';
import { SessionManager } from './session.service';

export class ChatService {
  private openai: OpenAI;
  private systemPrompt: string;
  
  constructor(
    private llmClient: LLMClient,
    private toolRegistry: ToolRegistry,
    private sessionManager: SessionManager,
    private model: string = 'gpt-4',
    systemPrompt?: string
  ) {
    this.openai = this.llmClient.getClient();
    this.systemPrompt = systemPrompt || this.getDefaultSystemPrompt();
  }

  // Get default system prompt
  private getDefaultSystemPrompt(): string {
    return `You are MiniCC, an AI programming assistant based on the Claude Code architecture.

You should:
- Be helpful and concise
- Use tools when needed to accomplish tasks
- Provide clear explanations
- Follow best practices in coding
- Ask for clarification when needed

Remember to use the available tools effectively to help users with your programming tasks.`;
  }

  async chat(sessionId: string, userMessage: string): Promise<string> {
    // Get or create session
    let session = await this.sessionManager.getSession(sessionId);
    if (!session) {
      session = await this.sessionManager.createSession(sessionId);
    }

    // Add user message to session if provided
    if (userMessage) {
      const userMsg: Message = {
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      };
      session.messages.push(userMsg);
    }

    try {
      return await this.processConversation(session, this.systemPrompt);
    } catch (error: any) {
      console.error('Chat service error:', error);
      
      const errorMsg: Message = {
        role: 'assistant',
        content: `Sorry, an error occurred while processing your request: ${error.message}\nPlease try again later.`,
        timestamp: new Date()
      };
      session.messages.push(errorMsg);
      
      await this.sessionManager.saveSession(session);
      
      throw error;
    }
  }

  private async processConversation(session: Session, systemPrompt: string): Promise<string> {
    // Convert session messages to OpenAI format
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt }
    ];
    
    // Add all session messages
    for (const msg of session.messages) {
      if (msg.role === 'user') {
        messages.push({
          role: 'user',
          content: msg.content || ''
        });
      } else if (msg.role === 'assistant') {
        if (msg.tool_calls) {
          messages.push({
            role: 'assistant',
            content: msg.content || '',
            tool_calls: msg.tool_calls
          } as OpenAI.ChatCompletionAssistantMessageParam);
        } else {
          messages.push({
            role: 'assistant',
            content: msg.content || ''
          });
        }
      } else if ('tool_call_id' in msg && msg.role === 'tool') {
        messages.push({
          role: 'tool',
          tool_call_id: msg.tool_call_id,
          content: msg.content || ''
        } as OpenAI.ChatCompletionToolMessageParam);
      }
    }

    // Call OpenAI API
    const completion = await this.openai.chat.completions.create({
      model: this.model,
      messages,
      tools: this.toolRegistry.getOpenAITools(),
      tool_choice: 'auto',
      temperature: 0.7,
      max_tokens: 2000
    });

    const response = completion.choices[0].message;

    // If AI wants to use tools, execute them and continue recursively
    if (response.tool_calls && response.tool_calls.length > 0) {
      // Add assistant's tool call message
      const assistantMsg: Message = {
        role: 'assistant',
        content: response.content || '',
        tool_calls: response.tool_calls,
        timestamp: new Date()
      };
      session.messages.push(assistantMsg);

      // Execute each tool
      for (const toolCall of response.tool_calls) {
        const tool = this.toolRegistry.getTool(toolCall.function.name);
        
        let result;
        if (!tool) {
          result = {
            success: false,
            error: `Tool ${toolCall.function.name} not found`
          };
        } else {
          try {
            const args = JSON.parse(toolCall.function.arguments);
            console.log(`🔧 Executing tool: ${toolCall.function.name}`, args);
            result = await tool.execute(args);
          } catch (error: any) {
            console.error(`❌ Tool execution failed: ${error.message}`);
            result = {
              success: false,
              error: error.message
            };
          }
        }

        // Add tool result to session
        session.messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
          timestamp: new Date()
        } as Message);
      }

      // Save session and continue recursively
      await this.sessionManager.saveSession(session);
      return this.processConversation(session, systemPrompt);
    } else {
      // No tool calls, return final response
      const assistantResponse = response.content || '';
      
      const assistantMsg: Message = {
        role: 'assistant',
        content: assistantResponse,
        timestamp: new Date()
      };
      session.messages.push(assistantMsg);
      
      await this.sessionManager.saveSession(session);
      return assistantResponse;
    }
  }

  // Get system prompt
  getSystemPrompt(): string {
    return this.systemPrompt;
  }

  // Update system prompt
  setSystemPrompt(prompt: string): void {
    this.systemPrompt = prompt;
  }
}