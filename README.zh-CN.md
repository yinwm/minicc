# MiniCC - 极简 Claude Code

一个精简的 Claude Code 实现，用于学习和理解 AI 编程助手的工作原理。

## 简介

MiniCC (Minimal Claude Code) 是一个教学版的 AI 代码助手，类似于 Minix 之于 Linux 的关系。它提供了一个简洁的框架，帮助开发者理解如何构建智能编程助手，并且设计为易于扩展的智能体骨架。

## 特性

- 🛠️ **工具系统**: 可扩展的工具架构，支持文件操作、命令执行、代码搜索等
- 🤖 **LLM 集成**: 支持 OpenAI API 兼容的大语言模型
- 📝 **会话管理**: 保持上下文，支持多轮对话
- 🔧 **易于扩展**: 清晰的架构，方便添加新功能
- 📚 **学习友好**: 代码简洁，注释清晰，适合学习

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/yourusername/minicc.git
cd minicc
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境

```bash
cp .env.example .env
```

编辑 `.env` 文件，设置你的 API Key：

```env
OPENAI_API_KEY=你的-api-key
OPENAI_BASE_URL=https://api.openai.com/v1  # 或其他兼容 API
MODEL=gpt-4  # 或其他模型
```

### 4. 构建项目

```bash
pnpm build
```

### 5. 运行

#### 方式一：使用 pnpm 脚本（推荐）

```bash
# 交互式聊天
pnpm chat

# 单次查询
pnpm minicc query "列出当前目录的所有文件"

# 管理会话
pnpm minicc sessions --list
```

#### 方式二：直接运行

```bash
# 首先链接 CLI
cd packages/cli
npm link

# 然后可以全局使用
minicc chat
minicc query "你的问题"
minicc sessions
```

## 使用示例

### 交互式聊天模式

```bash
pnpm chat
```

然后你可以：
- 输入问题让 AI 助手帮你编程
- 输入 `help` 查看帮助
- 输入 `clear` 清屏
- 输入 `history` 查看对话历史
- 输入 `exit` 退出

### 单次查询

```bash
pnpm minicc query "读取 package.json 文件的内容"
```

### 会话管理

```bash
# 列出所有会话
pnpm minicc sessions --list

# 删除指定会话
pnpm minicc sessions --delete <session-id>

# 清除所有会话
pnpm minicc sessions --clear
```

## 架构说明

```
minicc/
├── packages/
│   ├── core/           # 核心功能包
│   │   ├── llm/       # LLM 客户端封装
│   │   ├── tools/     # 工具实现
│   │   │   ├── base.tool.ts       # 工具基类
│   │   │   ├── file.tool.ts       # 文件操作工具
│   │   │   ├── shell.tool.ts      # Shell命令工具
│   │   │   └── search.tool.ts     # 代码搜索工具
│   │   └── services/  # 业务服务
│   │       ├── chat.service.ts    # 聊天服务
│   │       └── session.service.ts # 会话管理
│   └── cli/            # 命令行界面
│       └── commands/  # CLI 命令实现
```

## 核心工具

### 文件操作工具
- `file_read`: 读取文件内容
- `file_write`: 写入文件（覆盖整个文件）
- `file_list`: 列出目录文件

### 文件编辑工具
- `file_edit`: 查找并替换文件内容
- `file_insert`: 在指定行插入内容
- `file_delete_lines`: 删除指定行

### Shell 工具
- `shell_execute`: 执行系统命令
- 支持超时控制
- 返回 stdout/stderr

### 搜索工具
- `code_search`: 在代码中搜索模式
- 支持正则表达式
- 可按文件类型过滤

## 扩展开发

### 添加新工具

1. 创建工具类，继承 `BaseTool`:

```typescript
import { BaseTool, ToolExecutionResult } from './base.tool';

export class MyTool extends BaseTool {
  name = 'my_tool';
  description = '我的自定义工具';
  
  parameters = {
    type: 'object',
    properties: {
      input: { type: 'string' }
    },
    required: ['input']
  };
  
  async execute(args: any): Promise<ToolExecutionResult> {
    // 实现你的逻辑
    return {
      success: true,
      data: 'result'
    };
  }
}
```

2. 在 `registry.ts` 中注册:

```typescript
this.register(new MyTool());
```

### 创建自定义智能体

可以基于工具系统创建专门的智能体，例如：
- 代码审查助手
- 文档生成器
- 测试编写助手
- 重构助手

## 对比 Claude Code

| 特性 | MiniCC | Claude Code |
|-----|--------|------------|
| 目标用户 | 学习者/开发者 | 终端用户 |
| 代码复杂度 | 简单 | 复杂 |
| 功能完整性 | 基础 | 完整 |
| 可扩展性 | 高 | - |
| 文档 | 教学向 | 使用向 |

## 常见问题

### Q: 如何使用其他 LLM？
A: 修改 `.env` 文件中的 `OPENAI_BASE_URL` 和 `MODEL`，只要是 OpenAI 兼容的 API 都可以使用。

### Q: 如何添加新的工具？
A: 参考"扩展开发"部分，创建新的工具类并注册即可。

### Q: 会话历史保存在哪里？
A: 默认保存在项目根目录的 `.history/` 文件夹中。

### Q: 如何贡献代码？
A: Fork 项目，创建分支，提交 PR。请确保代码清晰并包含注释。

## 贡献指南

欢迎贡献代码、文档或提出建议。这是一个学习项目，我们鼓励：
- 清晰的代码和注释
- 教学性的示例
- 架构改进建议
- 工具扩展
- 文档完善

## License

MIT

---

> 💡 **提示**: MiniCC 是为了学习目的而创建的。如果你需要生产环境的 AI 编程助手，请使用官方的 Claude Code 或其他成熟方案。

## 相关链接

- [English README](README.md)
- [Issues](https://github.com/yourusername/minicc/issues)
- [Discussions](https://github.com/yourusername/minicc/discussions)