# MiniCC - Minimal Claude Code

A minimal implementation of Claude Code for learning and understanding how AI programming assistants work.

## Introduction

MiniCC (Minimal Claude Code) is an educational AI code assistant, similar to what Minix is to Linux. It provides a clean framework to help developers understand how to build intelligent programming assistants and is designed as an easily extensible agent skeleton.

## Features

- 🛠️ **Tool System**: Extensible tool architecture supporting file operations, command execution, code search
- 🤖 **LLM Integration**: Supports OpenAI API compatible large language models
- 📝 **Session Management**: Maintains context for multi-turn conversations
- 🔄 **Recursive Execution**: AI autonomously completes multi-step tasks
- 🎯 **Customizable System Prompt**: Easily modify AI behavior via `.minicc/system_prompt.md`
- 📚 **Learning Friendly**: Clean code with clear architecture, perfect for learning

## Architecture

```
minicc/
├── packages/
│   ├── core/           # Core functionality
│   │   ├── llm/       # LLM client
│   │   ├── tools/     # Tool implementations
│   │   └── services/  # Business services
│   ├── sdk/           # Software Development Kit
│   │   └── src/       # SDK API for building agents
│   └── cli/           # Command line interface
│       └── commands/  # CLI commands
├── .minicc/           # Configuration
│   └── system_prompt.md  # Customizable system prompt
└── .history/          # Session history storage
```

## How It Works - Recursive Execution Flow

The core innovation is the recursive tool execution that allows AI to complete multi-step tasks autonomously:

```mermaid
flowchart TD
    Start([User Input]) --> AddMsg[Add User Message to Session]
    AddMsg --> Process[processConversation]

    Process --> BuildPrompt[Build Messages Array<br/>System + History + User]
    BuildPrompt --> CallAPI[Call LLM API<br/>with Tools Definitions]

    CallAPI --> CheckTools{AI Response<br/>Has Tool Calls?}

    CheckTools -->|Yes| SaveTools[Save AI Tool Request<br/>to Session]
    SaveTools --> ExecuteTools[Execute Each Tool]
    ExecuteTools --> SaveResults[Save Tool Results<br/>to Session]
    SaveResults --> Recurse[Recursively Call<br/>processConversation]
    Recurse --> Process

    CheckTools -->|No| SaveResponse[Save AI Text Response<br/>to Session]
    SaveResponse --> Return([Return Final Answer])

    style Start fill:#e1f5e1
    style Return fill:#e1f5e1
    style Recurse fill:#ffe1e1
    style Process fill:#fff4e1
```

### Key Points:

1. **Single Entry Point**: All interactions go through `processConversation()`
2. **AI-Driven Flow**: The AI decides when to use tools and when to stop
3. **Natural Termination**: When AI returns text without tools, the recursion ends
4. **Stateful Sessions**: All messages (user, assistant, tool results) are preserved

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/yinwm/minicc.git
cd minicc
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment

Set environment variables:

```bash
# Temporary (current session)
export OPENAI_API_KEY=your-api-key-here
export OPENAI_BASE_URL=https://api.openai.com/v1  # Or other compatible API
export MODEL=gpt-4  # Or other model

# Or run directly
OPENAI_API_KEY=your-api-key-here OPENAI_BASE_URL=https://api.openai.com/v1 pnpm chat

# Permanent (add to ~/.bashrc or ~/.zshrc)
echo 'export OPENAI_API_KEY=your-api-key-here' >> ~/.bashrc
echo 'export OPENAI_BASE_URL=https://api.openai.com/v1' >> ~/.bashrc
```

### 4. Build project

```bash
pnpm build
```

### 5. Run

```bash
# Interactive chat mode
pnpm chat

# Single query
pnpm minicc -p "List all files in current directory"

# With session management
pnpm sessions --list
```

## Core Tools

### File Operations

- `file_read`: Read file contents
- `file_write`: Write entire file
- `file_list`: List directory files

### File Editing

- `file_edit`: Find and replace content
- `file_insert`: Insert at specific line
- `file_delete_lines`: Delete line ranges

### Execution

- `shell_execute`: Execute system commands
- `code_search`: Search patterns in code

## Customization

### System Prompt

Customize AI behavior by editing `.minicc/system_prompt.md`:

```bash
vim .minicc/system_prompt.md
```

The file uses Markdown format for easy editing and version control. Changes are applied on next run.

### Adding New Tools

1. Create a tool class extending `BaseTool`:

```typescript
import { BaseTool, ToolExecutionResult } from './base.tool';

export class MyTool extends BaseTool {
  name = 'my_tool';
  description = 'My custom tool';

  parameters = {
    type: 'object',
    properties: {
      input: { type: 'string' }
    },
    required: ['input']
  };

  async execute(args: any): Promise<ToolExecutionResult> {
    // Implement your logic
    return { success: true, data: 'result' };
  }
}
```

2. Register in tool registry

## Usage Examples

### Interactive Mode

```bash
$ pnpm chat

╭───────────────────────────────────────╮
│   MiniCC - AI Programming Assistant   │
│   Type "exit" or "quit" to leave      │
╰───────────────────────────────────────╯

✓ Loaded system prompt from .minicc/system_prompt.md

Your question: Read README.md and summarize it
```

### Command Examples

```bash
# File operations
pnpm minicc -p "Read package.json"
pnpm minicc -p "List all TypeScript files"
pnpm minicc -p "Search for TODO comments"

# Code modifications
pnpm minicc -p "Add a comment to main function"
pnpm minicc -p "Fix the import statements"

# Shell operations
pnpm minicc -p "Run npm test"
pnpm minicc -p "Check git status"
```

## Project Scripts

```bash
pnpm build     # Build all packages
pnpm minicc    # Start interactive mode
pnpm minicc -p # Execute single query
pnpm sessions  # Manage sessions
pnpm clean     # Clean build artifacts
```

## Usage Options

### Option 1: CLI Tool

Install globally and use as a command-line tool:

```bash
# Install CLI
npm install -g @minicc/cli

# Use commands
minicc chat
minicc query "List all files"
minicc sessions --list
```

### Option 2: SDK for Building Agents

Install SDK and integrate into your applications:

```bash
# Install SDK
npm install @minicc/sdk
```

```typescript
import { createAgent, BaseTool } from '@minicc/sdk';

class SqlQueryTool extends BaseTool {
  name = 'sql_query';
  description = 'Execute SQL queries';

  parameters = {
    type: 'object',
    properties: { query: { type: 'string' } },
    required: ['query']
  };

  async execute(args: any) {
    // Your business logic
    return { success: true, data: 'Results...' };
  }
}

const agent = createAgent({
  model: 'gpt-4',
  systemPrompt: 'You are a helpful assistant',
  tools: [new SqlQueryTool()],
  openaiConfig: {
    apiKey: process.env.OPENAI_API_KEY
  }
});

const response = await agent.chat('session-1', 'Query all users');
```

## Learning Resources

- **Tool System**: See `packages/core/src/tools/` for tool implementations
- **LLM Integration**: Check `packages/core/src/llm/` for API integration
- **Session Management**: Review `packages/core/src/services/session.service.ts`
- **CLI Structure**: Explore `packages/cli/src/commands/` for CLI implementation
- **SDK Usage**: Check `packages/sdk/README.md` for SDK documentation

## FAQ

**Q: How to use other LLMs?**  
A: Set `OPENAI_BASE_URL` to any OpenAI-compatible API endpoint (e.g., Ollama, LM Studio, SiliconFlow)

**Q: Where are sessions stored?**  
A: In `.history/` directory, automatically created on first run

**Q: How to reset the system prompt?**  
A: Edit `.minicc/system_prompt.md` or delete it to use defaults

**Q: Can I use this in production?**  
A: MiniCC is designed for learning. For production, use official Claude Code or mature alternatives

## Contributing

Contributions welcome! Focus on:

- Clear, educational code
- Tool extensions
- Documentation improvements
- Bug fixes

## License

MIT

---

> 💡 **Note**: MiniCC is an educational project for understanding AI assistants. For production use, consider official solutions.

## Links

- [中文文档](README_CN.md)
- [System Prompt Guide](SYSTEM_PROMPT.md)
- [GitHub Issues](https://github.com/yinwm/minicc/issues)
