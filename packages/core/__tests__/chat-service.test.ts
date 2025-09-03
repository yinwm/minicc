import { ChatService } from '../src/services/chat.service';
import { LLMClient } from '../src/llm/client';
import { ToolRegistry } from '../src/tools/registry';
import { SessionManager } from '../src/services/session.service';
import { Session, Message } from '../src/types';

// Mock dependencies
jest.mock('../src/llm/client');
jest.mock('../src/tools/registry');
jest.mock('../src/services/session.service');

const MockLLMClient = LLMClient as jest.MockedClass<typeof LLMClient>;
const MockToolRegistry = ToolRegistry as jest.MockedClass<typeof ToolRegistry>;
const MockSessionManager = SessionManager as jest.MockedClass<typeof SessionManager>;

describe('ChatService', () => {
  let chatService: ChatService;
  let mockLLMClient: jest.Mocked<LLMClient>;
  let mockToolRegistry: jest.Mocked<ToolRegistry>;
  let mockSessionManager: jest.Mocked<SessionManager>;
  let mockOpenAI: any;

  beforeEach(() => {
    // Setup mocks
    mockOpenAI = {
      chat: {
        completions: {
          create: jest.fn()
        }
      }
    };

    mockLLMClient = new MockLLMClient({} as any) as jest.Mocked<LLMClient>;
    mockLLMClient.getClient.mockReturnValue(mockOpenAI);

    mockToolRegistry = new MockToolRegistry({} as any) as jest.Mocked<ToolRegistry>;
    mockToolRegistry.getOpenAITools.mockReturnValue([]);

    mockSessionManager = new MockSessionManager('') as jest.Mocked<SessionManager>;

    chatService = new ChatService({
      llmClient: mockLLMClient,
      toolRegistry: mockToolRegistry,
      sessionManager: mockSessionManager,
      model: 'gpt-4'
    });
  });

  test('should create new session if not exists', async () => {
    const mockSession: Session = {
      id: 'test-session',
      startTime: new Date(),
      lastUpdateTime: new Date(),
      messages: []
    };

    mockSessionManager.getSession.mockResolvedValue(null);
    mockSessionManager.createSession.mockResolvedValue(mockSession);
    mockSessionManager.saveSession.mockResolvedValue();

    mockOpenAI.chat.completions.create.mockResolvedValue({
      choices: [
        {
          message: {
            content: 'Hello response',
            tool_calls: null
          }
        }
      ]
    });

    const response = await chatService.chat('test-session', 'Hello');

    expect(mockSessionManager.createSession).toHaveBeenCalledWith('test-session');
    expect(response).toBe('Hello response');
  });

  test('should use existing session', async () => {
    const existingMessages: Message[] = [
      { role: 'user', content: 'Previous message', timestamp: new Date() }
    ];

    const mockSession: Session = {
      id: 'test-session',
      startTime: new Date(),
      lastUpdateTime: new Date(),
      messages: existingMessages
    };

    mockSessionManager.getSession.mockResolvedValue(mockSession);
    mockSessionManager.saveSession.mockResolvedValue();

    mockOpenAI.chat.completions.create.mockResolvedValue({
      choices: [
        {
          message: {
            content: 'Response to new message',
            tool_calls: null
          }
        }
      ]
    });

    const response = await chatService.chat('test-session', 'New message');

    expect(mockSessionManager.getSession).toHaveBeenCalledWith('test-session');
    expect(mockSession.messages).toHaveLength(2); // Previous + new message + response
    expect(response).toBe('Response to new message');
  });

  test('should handle tool calls', async () => {
    const mockSession: Session = {
      id: 'test-session',
      startTime: new Date(),
      lastUpdateTime: new Date(),
      messages: []
    };

    const mockTool = {
      execute: jest.fn().mockResolvedValue({ success: true, result: 'tool result' })
    };

    mockSessionManager.getSession.mockResolvedValue(null);
    mockSessionManager.createSession.mockResolvedValue(mockSession);
    mockSessionManager.saveSession.mockResolvedValue();
    mockToolRegistry.getTool.mockReturnValue(mockTool as any);

    // First call with tool_calls
    mockOpenAI.chat.completions.create
      .mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: 'I need to use a tool',
              tool_calls: [
                {
                  id: 'call_123',
                  function: {
                    name: 'test-tool',
                    arguments: '{"param": "value"}'
                  }
                }
              ]
            }
          }
        ]
      })
      // Second call with final response
      .mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: 'Final response after tool use',
              tool_calls: null
            }
          }
        ]
      });

    const response = await chatService.chat('test-session', 'Test message');

    expect(mockTool.execute).toHaveBeenCalledWith({ param: 'value' });
    expect(response).toBe('Final response after tool use');
    expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(2);
  });

  test('should handle tool execution errors', async () => {
    const mockSession: Session = {
      id: 'test-session',
      startTime: new Date(),
      lastUpdateTime: new Date(),
      messages: []
    };

    mockSessionManager.getSession.mockResolvedValue(null);
    mockSessionManager.createSession.mockResolvedValue(mockSession);
    mockSessionManager.saveSession.mockResolvedValue();
    mockToolRegistry.getTool.mockReturnValue(null); // Tool not found

    mockOpenAI.chat.completions.create
      .mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: 'I need to use a tool',
              tool_calls: [
                {
                  id: 'call_123',
                  function: {
                    name: 'non-existent-tool',
                    arguments: '{}'
                  }
                }
              ]
            }
          }
        ]
      })
      .mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: 'Final response after error',
              tool_calls: null
            }
          }
        ]
      });

    const response = await chatService.chat('test-session', 'Test message');

    expect(response).toBe('Final response after error');
    expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(2);
  });
});
