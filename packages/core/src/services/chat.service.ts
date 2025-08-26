import OpenAI from 'openai';
import { LLMClient } from '../llm/client';
import { ToolRegistry } from '../tools/registry';
import { Message, Session } from '../types';
import { SessionManager } from './session.service';

export class ChatService {
  private openai: OpenAI;
  
  constructor(
    private llmClient: LLMClient,
    private toolRegistry: ToolRegistry,
    private sessionManager: SessionManager,
    private model: string = 'gpt-4'
  ) {
    this.openai = this.llmClient.getClient();
  }

  async chat(sessionId: string, userMessage: string): Promise<string> {
    // Get or create session
    let session = await this.sessionManager.getSession(sessionId);
    if (!session) {
      session = await this.sessionManager.createSession(sessionId);
    }

    // Add user message to session
    const userMsg: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    session.messages.push(userMsg);

    try {
      // Prepare system prompt
      const systemPrompt = this.buildSystemPrompt();
      
      // Prepare message list (including history)
      const messages: OpenAI.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt }
      ];
      
      // Process history messages
      for (const msg of session.messages) {
        if (msg.role === 'user') {
          messages.push({
            role: 'user',
            content: msg.content || ''
          });
        } else if (msg.role === 'assistant' && !msg.tool_calls) {
          messages.push({
            role: 'assistant',
            content: msg.content || ''
          });
        }
      }

      // Call OpenAI API with tool definitions
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages,
        tools: this.toolRegistry.getOpenAITools(),
        tool_choice: 'auto',
        temperature: 0.7,
        max_tokens: 2000
      });

      const response = completion.choices[0].message;
      
      // If model chose tool calls
      if (response.tool_calls && response.tool_calls.length > 0) {
        // Add assistant's tool call message
        const assistantMsg: Message = {
          role: 'assistant',
          content: response.content || '',
          tool_calls: response.tool_calls,
          timestamp: new Date()
        };
        session.messages.push(assistantMsg);

        // Execute tool calls
        const toolResults: OpenAI.ChatCompletionToolMessageParam[] = [];
        
        for (const toolCall of response.tool_calls) {
          const tool = this.toolRegistry.getTool(toolCall.function.name);
          
          if (!tool) {
            toolResults.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify({
                success: false,
                error: `Tool ${toolCall.function.name} not found`
              })
            });
            continue;
          }

          try {
            const args = JSON.parse(toolCall.function.arguments);
            console.log(`🔧 Executing tool: ${toolCall.function.name}`, args);
            
            const result = await tool.execute(args);
            
            toolResults.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(result)
            });
          } catch (error: any) {
            console.error(`❌ Tool execution failed: ${error.message}`);
            toolResults.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify({
                success: false,
                error: error.message
              })
            });
          }
        }

        // Add tool results to session
        session.messages.push(...toolResults.map(result => ({
          ...result,
          timestamp: new Date()
        } as Message)));

        // Call API again with tool results
        const finalMessages: OpenAI.ChatCompletionMessageParam[] = [
          { role: 'system', content: systemPrompt },
          ...session.messages.map(msg => {
            if ('tool_call_id' in msg && msg.role === 'tool') {
              return {
                role: 'tool',
                tool_call_id: msg.tool_call_id,
                content: msg.content || ''
              } as OpenAI.ChatCompletionToolMessageParam;
            } else if ('tool_calls' in msg && msg.role === 'assistant') {
              return {
                role: 'assistant',
                content: msg.content || '',
                tool_calls: msg.tool_calls
              } as OpenAI.ChatCompletionAssistantMessageParam;
            } else if (msg.role === 'assistant') {
              return {
                role: 'assistant',
                content: msg.content || ''
              } as OpenAI.ChatCompletionAssistantMessageParam;
            } else if (msg.role === 'user') {
              return {
                role: 'user',
                content: msg.content || ''
              } as OpenAI.ChatCompletionUserMessageParam;
            } else {
              return msg as OpenAI.ChatCompletionMessageParam;
            }
          })
        ];

        const finalCompletion = await this.openai.chat.completions.create({
          model: this.model,
          messages: finalMessages,
          temperature: 0.7,
          max_tokens: 2000
        });

        const finalResponse = finalCompletion.choices[0].message.content || '';
        
        // Add final response to session
        const finalAssistantMsg: Message = {
          role: 'assistant',
          content: finalResponse,
          timestamp: new Date()
        };
        session.messages.push(finalAssistantMsg);

        // Save session
        await this.sessionManager.saveSession(session);
        
        return finalResponse;
      } else {
        // No tool calls, return direct response
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

  private buildSystemPrompt(): string {
    return `You are MiniCC, an AI programming assistant based on the Claude Code architecture.

Your capabilities include:
1. Reading and writing files
2. Editing files (find/replace, insert, delete lines)
3. Executing shell commands
4. Searching through code
5. Listing directory contents
6. Helping with programming tasks

You should:
- Be helpful and concise
- Use tools when needed to accomplish tasks
- Provide clear explanations
- Follow best practices in coding
- Ask for clarification when needed

Available tools:
- file_read: Read file contents
- file_write: Write entire file (overwrites)
- file_edit: Edit file by replacing specific content
- file_insert: Insert content at specific line
- file_delete_lines: Delete specific lines from file
- file_list: List directory contents
- shell_execute: Execute shell commands
- code_search: Search for patterns in code

Remember to use these tools effectively to help users with their programming tasks.`;
  }
}