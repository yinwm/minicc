import chalk from 'chalk';
import ora from 'ora';
import { ChatService, SessionManager, LLMClient, ToolRegistry } from '@minicc/core';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

export async function queryCommand(question: string, options: any) {
  const spinner = ora('Initializing services...').start();

  try {
    // Initialize services
    const apiKey = process.env.OPENAI_API_KEY || process.env.SILICONFLOW_API_KEY;
    const baseURL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    const model = process.env.MODEL || 'gpt-4';
    if (!apiKey) {
      spinner.fail('Missing API Key');
      console.error(chalk.red('Please set OPENAI_API_KEY environment variable'));
      process.exit(1);
    }

    // Load custom system prompt if available
    let customPrompt: string | undefined;
    const promptFile = path.resolve('.minicc/system_prompt.md');
    if (fs.existsSync(promptFile)) {
      customPrompt = fs.readFileSync(promptFile, 'utf-8').trim();
    }
    
    // Initialize services
    const llmClient = new LLMClient({ apiKey, baseURL, model });
    const toolRegistry = new ToolRegistry();
    const sessionManager = new SessionManager('.history');
    const chatService = new ChatService(llmClient, toolRegistry, sessionManager, model, customPrompt);

    // Determine session ID
    const sessionId = options.session || uuidv4();
    
    spinner.text = 'Thinking...';

    // Execute query
    const response = await chatService.chat(sessionId, question);
    
    spinner.succeed('Query completed');

    // Display result
    console.log('\n' + chalk.green('Answer:'));
    console.log(response);
    console.log('\n' + chalk.gray(`Session ID: ${sessionId}`));

  } catch (error: any) {
    spinner.fail('Query failed');
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}