# @minicc/sdk

MiniCC SDK - 用于构建 AI 智能体的软件开发工具包

## 安装

```bash
npm install @minicc/sdk
```

## 快速开始

```typescript
import { createAgent, BaseTool } from '@minicc/sdk';

// 创建自定义工具
class SqlQueryTool extends BaseTool {
  name = 'sql_query';
  description = '执行 SQL 查询';

  parameters = {
    type: 'object',
    properties: {
      query: { type: 'string' }
    },
    required: ['query']
  };

  async execute(args: any) {
    // 在这里实现你的 SQL 逻辑
    return { success: true, data: '查询结果' };
  }
}

// 创建智能体
const agent = createAgent({
  model: 'gpt-4',
  systemPrompt: '你是一个有用的 SQL 助手',
  tools: [new SqlQueryTool()],
  openaiConfig: {
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://api.openai.com/v1'
  }
});

// 使用智能体
const response = await agent.chat('session-1', '显示所有用户');
```

## API 参考

### `createAgent(config: AgentConfig): AgentInstance`

使用提供的配置创建一个 AI 智能体。

#### AgentConfig

- `model?` - 大语言模型名称（默认：'gpt-4'）
- `systemPrompt?` - 自定义系统提示
- `tools?` - 自定义工具数组
- `openaiConfig` - OpenAI API 配置
- `autoRegisterBuiltins?` - 是否注册内置工具（默认：true）

#### OpenAIConfig

- `apiKey` - OpenAI API 密钥（来自环境变量或直接提供）
- `baseURL?` - API 基础 URL（默认：OpenAI）
- `model?` - 默认模型

#### 环境变量

SDK 从以下环境变量读取配置：

- `OPENAI_API_KEY` - OpenAI API 密钥
- `OPENAI_BASE_URL` - API 基础 URL（可选，默认为 OpenAI）
- `MODEL` - 默认模型名称（可选，默认为 'gpt-4'）

```typescript
// 使用环境变量
const agent = createAgent({
  openaiConfig: {
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL
  }
});

// 或直接提供
const agent = createAgent({
  openaiConfig: {
    apiKey: 'your-api-key',
    baseURL: 'https://api.openai.com/v1'
  }
});
```

### 内置工具

- `FileReadTool` - 读取文件内容
- `FileWriteTool` - 写入文件
- `FileListTool` - 列出目录内容
- `FileEditTool` - 在文件中查找和替换
- `ShellTool` - 执行 shell 命令
- `SearchTool` - 搜索代码模式

### 自定义工具

继承 `BaseTool` 来创建自定义工具：

```typescript
class MyTool extends BaseTool {
  name = 'my_tool';
  description = '我的自定义工具';

  parameters = {
    type: 'object',
    properties: {
      input: { type: 'string' }
    },
    required: ['input']
  };

  async execute(args: any) {
    // 工具逻辑
    return { success: true, data: '结果' };
  }
}
```

## 示例

### 基础智能体

```typescript
const agent = createAgent({
  openaiConfig: { apiKey: 'your-key' }
});

const response = await agent.chat('session-1', '列出当前目录的文件');
```

### 仅使用自定义工具

```typescript
const agent = createAgent({
  tools: [new MyCustomTool()],
  autoRegisterBuiltins: false, // 不使用内置工具
  openaiConfig: { apiKey: 'your-key' }
});
```

### 高级配置

```typescript
const agent = createAgent({
  model: 'gpt-4-turbo',
  systemPrompt: '你是一个专业的数据分析师',
  tools: [new SqlTool(), new ChartTool()],
  openaiConfig: {
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://my-proxy.com/v1'
  }
});
```

## 许可证

MIT
