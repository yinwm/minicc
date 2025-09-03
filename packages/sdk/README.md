# @minicc/sdk

MiniCC SDK - Software Development Kit for building AI agents

## Installation

```bash
npm install @minicc/sdk
```

## Quick Start

```typescript
import { createAgent, BaseTool } from '@minicc/sdk';

// Create custom tool
class SqlQueryTool extends BaseTool {
  name = 'sql_query';
  description = 'Execute SQL queries';
  
  parameters = {
    type: 'object',
    properties: {
      query: { type: 'string' }
    },
    required: ['query']
  };

  async execute(args: any) {
    // Your SQL logic here
    return { success: true, data: 'Query results' };
  }
}

// Create agent
const agent = createAgent({
  model: 'gpt-4',
  systemPrompt: 'You are a helpful SQL assistant',
  tools: [new SqlQueryTool()],
  openaiConfig: {
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://api.openai.com/v1'
  }
});

// Use agent
const response = await agent.chat('session-1', 'Show me all users');
```

## API Reference

### `createAgent(config: AgentConfig): AgentInstance`

Creates an AI agent with the provided configuration.

#### AgentConfig

- `model?` - LLM model name (default: 'gpt-4')
- `systemPrompt?` - Custom system prompt
- `tools?` - Array of custom tools
- `openaiConfig` - OpenAI API configuration
- `autoRegisterBuiltins?` - Whether to register built-in tools (default: true)

#### OpenAIConfig

- `apiKey` - OpenAI API key (from environment variable or direct value)
- `baseURL?` - API base URL (default: OpenAI)
- `model?` - Default model

#### Environment Variables

The SDK reads configuration from these environment variables:

- `OPENAI_API_KEY` - OpenAI API key
- `OPENAI_BASE_URL` - API base URL (optional, defaults to OpenAI)
- `MODEL` - Default model name (optional, defaults to 'gpt-4')

```typescript
// Using environment variables
const agent = createAgent({
  openaiConfig: {
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL
  }
});

// Or provide directly
const agent = createAgent({
  openaiConfig: {
    apiKey: 'your-api-key',
    baseURL: 'https://api.openai.com/v1'
  }
});
```

### Built-in Tools

- `FileReadTool` - Read file contents
- `FileWriteTool` - Write files
- `FileListTool` - List directory contents
- `FileEditTool` - Find and replace in files
- `ShellTool` - Execute shell commands
- `SearchTool` - Search code patterns

### Custom Tools

Extend `BaseTool` to create custom tools:

```typescript
class MyTool extends BaseTool {
  name = 'my_tool';
  description = 'My custom tool';
  
  parameters = {
    type: 'object',
    properties: {
      input: { type: 'string' }
    },
    required: ['input']
  };

  async execute(args: any) {
    // Tool logic
    return { success: true, data: 'result' };
  }
}
```

## Examples

### Basic Agent

```typescript
const agent = createAgent({
  openaiConfig: { apiKey: 'your-key' }
});

const response = await agent.chat('session-1', 'List files in current directory');
```

### Custom Tools Only

```typescript
const agent = createAgent({
  tools: [new MyCustomTool()],
  autoRegisterBuiltins: false,  // No built-in tools
  openaiConfig: { apiKey: 'your-key' }
});
```

### Advanced Configuration

```typescript
const agent = createAgent({
  model: 'gpt-4-turbo',
  systemPrompt: 'You are a specialized data analyst',
  tools: [new SqlTool(), new ChartTool()],
  openaiConfig: {
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://my-proxy.com/v1'
  }
});
```

## License

MIT