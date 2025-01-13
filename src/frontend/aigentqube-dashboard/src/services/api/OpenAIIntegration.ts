import OpenAI from 'openai';
import { APIConfig, APIIntegration, APIResponse } from './APIIntegration';
import { ServiceStatus } from '../../types/service';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class OpenAIIntegration implements APIIntegration {
  public readonly id: string = 'openai';
  public readonly name: string = 'OpenAI';
  public readonly description: string = 'OpenAI API integration for natural language processing';
  public readonly config: APIConfig;
  public status: ServiceStatus = ServiceStatus.INITIALIZING;
  private client: OpenAI | null = null;
  private conversationHistory: OpenAIMessage[] = [];
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second
  private readonly MAX_HISTORY_LENGTH = 10;
  private readonly SYSTEM_PROMPT = `You are an AI assistant integrated with a blockchain application. 
Your role is to help users interact with the blockchain, create and manage digital assets, and understand complex blockchain concepts.
- Always provide clear, concise responses
- When handling blockchain operations, explain the process and any risks involved
- If you encounter an error, explain what went wrong and suggest next steps
- Keep responses focused on the current context and user's needs`;
  private initializationPromise: Promise<void> | null = null;

  constructor(config: APIConfig) {
    this.config = config;
    // Initialize conversation with system prompt
    this.conversationHistory.push({
      role: 'system',
      content: this.SYSTEM_PROMPT
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async retryOperation<T>(
    operation: () => Promise<T>,
    retries: number = this.MAX_RETRIES
  ): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === retries - 1) throw error;
        await this.delay(this.RETRY_DELAY * Math.pow(2, i));
      }
    }
    throw new Error('Operation failed after maximum retries');
  }

  async initialize(): Promise<void> {
    // If already initializing, return the existing promise
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // If already initialized and ready, return immediately
    if (this.status === ServiceStatus.READY) {
      return;
    }

    this.initializationPromise = (async () => {
      try {
        console.log('Initializing OpenAI integration...');
        const apiKey = this.config.apiKey;
        
        if (!apiKey) {
          throw new Error('OpenAI API key not provided');
        }

        console.log('API Key type:', apiKey.startsWith('sk-proj-') ? 'Project-scoped' : 'Standard');
        
        // Create OpenAI client with browser safety flag
        this.client = new OpenAI({
          apiKey: apiKey,
          dangerouslyAllowBrowser: true // Enable browser usage
        });

        // Single validation attempt
        const isValid = await this.validate();
        if (!isValid) {
          throw new Error('OpenAI API key validation failed');
        }

        this.status = ServiceStatus.READY;
        console.log('OpenAI integration initialized successfully');
      } catch (error: any) {
        console.error('Error initializing OpenAI client:', error);
        this.status = ServiceStatus.ERROR;
        if (error.response?.status === 401) {
          throw new Error('Invalid OpenAI API key - please check your API key configuration');
        } else if (error.response?.status === 429) {
          throw new Error('OpenAI API rate limit exceeded');
        } else {
          throw new Error(error.message || 'Failed to initialize OpenAI integration');
        }
      } finally {
        this.initializationPromise = null;
      }
    })();

    return this.initializationPromise;
  }

  async validate(): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      console.log('Validating OpenAI API key...');
      // Single API call to validate
      const response = await this.client.models.list();
      console.log('API validation successful:', response.data.length, 'models available');
      return response.data.length > 0;
    } catch (error: any) {
      console.error('OpenAI API validation failed:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      return false;
    }
  }

  private trimConversationHistory() {
    if (this.conversationHistory.length > this.MAX_HISTORY_LENGTH) {
      // Keep system prompt and last messages
      const systemPrompt = this.conversationHistory[0];
      const recentMessages = this.conversationHistory.slice(-this.MAX_HISTORY_LENGTH + 1);
      this.conversationHistory = [systemPrompt, ...recentMessages];
    }
  }

  private async processMessage(message: string, context?: any): Promise<string> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized');
    }

    try {
      // Add context to the message if provided
      const userMessage = context 
        ? `[Context: ${JSON.stringify(context)}]\n${message}`
        : message;

      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage,
      });

      // Trim history if needed
      this.trimConversationHistory();

      // Get completion from OpenAI
      const completion = await this.retryOperation(async () => {
        return await this.client!.chat.completions.create({
          model: 'gpt-4',
          messages: this.conversationHistory,
          temperature: 0.7,
          max_tokens: 500,
          presence_penalty: 0.6,
          frequency_penalty: 0.2,
        });
      });

      // Add assistant response to history
      const response = completion.choices[0]?.message?.content || '';
      if (response) {
        this.conversationHistory.push({
          role: 'assistant',
          content: response,
        });
      }

      return response;
    } catch (error: any) {
      console.error('Error processing message:', error);
      throw error;
    }
  }

  async execute(params: { message: string, context?: any }): Promise<APIResponse> {
    try {
      if (this.status !== ServiceStatus.READY) {
        throw new Error('OpenAI integration not ready');
      }

      const response = await this.processMessage(params.message, params.context);
      return {
        success: true,
        data: response,
        metadata: {
          timestamp: new Date(),
          messageCount: this.conversationHistory.length
        }
      };
    } catch (error: any) {
      console.error('Error executing OpenAI request:', error);
      
      // Check if error is due to API key
      if (error.message.includes('API key')) {
        this.status = ServiceStatus.ERROR;
      }
      
      return {
        success: false,
        error: error.message,
        metadata: {
          timestamp: new Date(),
          errorType: error.name,
          status: this.status
        }
      };
    }
  }

  // Clear conversation history but keep system prompt
  public clearHistory(): void {
    const systemPrompt = this.conversationHistory[0];
    this.conversationHistory = [systemPrompt];
  }
}
