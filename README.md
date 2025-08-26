# MiniCC - Minimal Claude Code

A minimal implementation of Claude Code for learning and understanding how AI programming assistants work.

## Introduction

MiniCC (Minimal Claude Code) is an educational AI code assistant, similar to what Minix is to Linux. It provides a clean framework to help developers understand how to build intelligent programming assistants and is designed as an easily extensible agent skeleton.

## Features

- 🛠️ **Tool System**: Extensible tool architecture supporting file operations, command execution, code search, etc.
- 🤖 **LLM Integration**: Supports OpenAI API compatible large language models
- 📝 **Session Management**: Maintains context for multi-turn conversations
- 🔧 **Easy to Extend**: Clear architecture for adding new features
- 📚 **Learning Friendly**: Clean code with clear comments, perfect for learning

## Architecture

```
minicc/
├── packages/
│   ├── core/           # Core functionality
│   │   ├── llm/       # LLM client
│   │   ├── tools/     # Tool implementations
│   │   └── services/  # Business services
│   └── cli/           # Command line interface
│       └── commands/  # CLI commands
```

## Core Tools

### File Operation Tools
- `file_read`: Read file contents
- `file_write`: Write to files
- `file_list`: List directory files

### Shell Tool
- `shell_execute`: Execute system commands

### Search Tool
- `code_search`: Search patterns in code

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/minicc.git
cd minicc
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` file and set your API key:

```env
OPENAI_API_KEY=your-api-key-here
OPENAI_BASE_URL=https://api.openai.com/v1  # Or other compatible API
MODEL=gpt-4  # Or other model
```

### 4. Build project

```bash
pnpm build
```

### 5. Run

#### Option 1: Using pnpm scripts (Recommended)

```bash
# Interactive chat
pnpm chat

# Single query
pnpm minicc query "List all files in current directory"

# Manage sessions
pnpm minicc sessions --list
```

#### Option 2: Global installation

```bash
# Link CLI globally
cd packages/cli
npm link

# Then use globally
minicc chat
minicc query "your question"
minicc sessions
```

## Usage Examples

### Interactive Chat Mode

```bash
pnpm chat
```

You can then:
- Ask questions for programming help
- Type `help` for help
- Type `clear` to clear screen
- Type `history` to view conversation history
- Type `exit` to quit

### Single Query

```bash
pnpm minicc query "Read the content of package.json"
```

### Session Management

```bash
# List all sessions
pnpm minicc sessions --list

# Delete specific session
pnpm minicc sessions --delete <session-id>

# Clear all sessions
pnpm minicc sessions --clear
```

## Extension Guide

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
    return {
      success: true,
      data: 'result'
    };
  }
}
```

2. Register in `registry.ts`:

```typescript
this.register(new MyTool());
```

### Creating Custom Agents

You can create specialized agents based on the tool system:
- Code review assistant
- Documentation generator
- Test writer
- Refactoring helper

## Learning Resources

- [Tool System Design](packages/core/src/tools/)
- [LLM Integration](packages/core/src/llm/)
- [Session Management](packages/core/src/services/)

## Comparison with Claude Code

| Feature | MiniCC | Claude Code |
|---------|--------|-------------|
| Target Users | Learners/Developers | End Users |
| Code Complexity | Simple | Complex |
| Feature Completeness | Basic | Complete |
| Extensibility | High | - |
| Documentation | Educational | Usage-focused |

## FAQ

### Q: How to use other LLMs?
A: Modify `OPENAI_BASE_URL` and `MODEL` in `.env` file. Any OpenAI-compatible API will work.

### Q: How to add new tools?
A: See the "Extension Guide" section. Create a new tool class and register it.

### Q: Where are session histories saved?
A: By default in `.history/` folder in the project root.

### Q: How to contribute?
A: Fork the project, create a branch, submit a PR. Please ensure clear code with comments.

## Contributing

Contributions are welcome! This is a learning project, we encourage:
- Clear code with comments
- Educational examples
- Architecture improvements
- Tool extensions
- Documentation improvements

## License

MIT

---

> 💡 **Note**: MiniCC is created for learning purposes. For production AI programming assistants, please use official Claude Code or other mature solutions.

## Links

- [中文文档](README.zh-CN.md)
- [Issues](https://github.com/yourusername/minicc/issues)
- [Discussions](https://github.com/yourusername/minicc/discussions)