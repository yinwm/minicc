import OpenAI from 'openai';

export class LLMClient {
  private client: OpenAI;

  constructor(config: { apiKey: string; baseURL?: string; model?: string }) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL || 'https://api.siliconflow.cn/v1'
    });
  }

  getClient() {
    return this.client;
  }
}
