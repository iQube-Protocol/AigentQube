import OpenAI from 'openai';
import { APIIntegration, APIResponse, APIConfig } from './APIIntegrationManager';
import { ServiceStatus } from '../../types/service';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class OpenAIIntegration implements APIIntegration {
  public readonly id: string = 'openai';
  public readonly name: string = 'OpenAI';
  public readonly description: string = 'OpenAI API integration for blockchain and AI interactions';
  public status: ServiceStatus = ServiceStatus.INITIALIZING;
  public readonly config: APIConfig;
  private client: OpenAI | null = null;
  private conversationHistory: OpenAIMessage[] = [];
  private initializationPromise: Promise<void> | null = null;


  // Enhanced configuration
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second
  private readonly MAX_HISTORY_LENGTH = 10;
  private readonly DEFAULT_MODEL = 'gpt-4';

  // Comprehensive system prompts
  private readonly SYSTEM_PROMPTS: Record<string, string> = {
    'default': `You are an advanced AI assistant integrated with the Aigent Z platform. 
Your core mission is to provide intelligent, context-aware support for agentic AI and digital sovereignty.

Key Operational Guidelines:
- Understand and explain Aigent Z's agentic AI technology
- Guide users in leveraging iQubes for AI enhancement
- Prioritize user security and digital sovereignty
- Provide clear, actionable guidance
- Adapt communication to user's technical expertise

Core Knowledge:
- Aigent Z platform architecture and capabilities
- iQube integration and tokenization
- Agent-to-agent interaction patterns
- Digital sovereignty principles
- AI security best practices`,
    
    'bitcoin_advisor': `You are a specialized Bitcoin Advisor AI, focused on delivering sophisticated blockchain and cryptocurrency insights.

Primary Functions:
- Conduct in-depth cryptocurrency market analysis
- Provide strategic investment recommendations
- Explain blockchain technology nuances
- Assess risk-reward scenarios
- Offer data-driven market predictions`,

    'ai_coach': `You are an Aigent Z expert and Agentic AI specialist, deeply versed in the platform's capabilities and iQube technology.

Core Expertise:
- Aigent Z's agentic AI architecture and principles
- iQube integration and enhancement patterns
- Agent evolution and specialization
- Multi-agent collaboration systems
- AI-to-AI communication protocols

Your role is to:
- Guide users in understanding agentic AI concepts
- Explain how iQubes enhance AI capabilities
- Share best practices for agent-iQube integration
- Provide insights on agent evolution
- Support the Aigent Z ecosystem development`,

    'guardian_aigent': `You are a Guardian Aigent, specializing in digital sovereignty and AI security within the Aigent Z ecosystem.

Core Responsibilities:
- Protect user digital rights and data sovereignty
- Implement robust AI security measures
- Ensure safe agent-to-agent interactions
- Maintain privacy and security standards
- Leverage iQubes for enhanced protection

Your expertise includes:
- Digital sovereignty implementation
- AI security protocols and risk mitigation
- iQube-based security features
- Privacy-preserving AI technologies
- Ethical AI governance

Focus on:
- Maximizing user security and sovereignty
- Implementing security best practices
- Addressing AI safety concerns
- Monitoring digital security threats
- Ensuring ethical AI operations`
  };

  constructor(config: APIConfig) {
    // Use environment variable for API key if not provided
    const apiKey = config.apiKey || process.env.REACT_APP_OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('[OpenAI] No API key found');
      throw new Error('OpenAI API key is required');
    }

    // Deep clone configuration to prevent external mutations
    this.config = { 
      ...config, 
      apiKey,
      timeout: config.timeout || 60000,
      retryAttempts: config.retryAttempts || 3
    };
    
    // Secure initialization of conversation history
    this.resetConversationHistory();
  }

  private resetConversationHistory(domain: keyof typeof this.SYSTEM_PROMPTS = 'default'): void {

    this.conversationHistory = [{
      role: 'system',
      content: this.SYSTEM_PROMPTS[domain]
    }];
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async initialize(domain: keyof typeof this.SYSTEM_PROMPTS = 'default'): Promise<void> {
    // Prevent multiple simultaneous initialization attempts
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      try {
        //CD::console.log('[OpenAI] Starting initialization...');
        
        // Validate API key
        if (!this.config.apiKey) {
          const envApiKey = process.env.REACT_APP_OPENAI_API_KEY;
          if (!envApiKey) {
            throw new Error('Missing OpenAI API Key');
          }
          this.config.apiKey = envApiKey;
        }

        // Create OpenAI client with comprehensive configuration
        this.client = new OpenAI({
          apiKey: this.config.apiKey,
          dangerouslyAllowBrowser: true,
          timeout: this.config.timeout,
        });

        // Reset conversation history
        this.resetConversationHistory(domain);

        // Validate API key with retry mechanism
        let validationAttempts = 0;
        while (validationAttempts < this.MAX_RETRIES) {
          try {
            const isValid = await this.validate();
            if (isValid) {
              this.status = ServiceStatus.READY;
              //CD::console.log('[OpenAI] Validation Attempt: ', validationAttempts);              
              //CD::console.log('[OpenAI] Initialization successful');
              return;
            }
            validationAttempts++;
            await this.delay(this.RETRY_DELAY * Math.pow(2, validationAttempts));
          } catch (validationError) {
            console.warn(`[OpenAI] Validation attempt ${validationAttempts + 1} failed`);
            if (validationAttempts === this.MAX_RETRIES - 1) {
              throw validationError;
            }
          }
        }

        throw new Error('Failed to validate OpenAI API key after maximum attempts');
      } catch (error: any) {
        this.status = ServiceStatus.ERROR;
        console.error('[OpenAI] Initialization Error:', error);

        // Detailed error handling
        if (error.response?.status === 401) {
          throw new Error('Invalid OpenAI API key - please verify your credentials');
        } else if (error.response?.status === 429) {
          throw new Error('OpenAI API rate limit exceeded');
        } else {
          throw error;
        }
      } finally {
        // Reset initialization promise
        this.initializationPromise = null;
      }
    })();

    return this.initializationPromise;
  }

  public async validate(): Promise<boolean> {
    try {
      if (!this.client) {
        throw new Error('OpenAI client not initialized');
      }

      // Comprehensive validation
      const response = await this.client.models.list();
      const availableModels = response.data.map(model => model.id);
      
      //CD::console.log('[OpenAI] Calling validate()');
      
      // Ensure default model is available
      const isDefaultModelAvailable = availableModels.includes(this.DEFAULT_MODEL);
      
      this.status = isDefaultModelAvailable 
        ? ServiceStatus.READY 
        : ServiceStatus.ERROR;

      return this.status === ServiceStatus.READY;
    } catch (error: any) {
      console.error('[OpenAI] Validation Error:', error);
      
      // Detailed error logging
      if (error.response) {
        console.error('Response Status:', error.response.status);
        console.error('Response Data:', error.response.data);
      }
      
      this.status = ServiceStatus.ERROR;
      return false;
    }
  }

  public async execute(params: any): Promise<APIResponse> {
    //CD::console.log('[OpenAI] Execute method called with params:', JSON.stringify(params, null, 2));
    
    try {



      // Validate input with detailed logging
      const message = params.message || params.input;
      //CD::console.log('[OpenAI] Message received:', message);

      //CD::console.log('[OpenAI] PARAMS received:', params)
      
      if (!message) {
        console.warn('[OpenAI] No message or input provided');
        return {
          success: false,
          error: 'Invalid input: message or input is required',
          metadata: { 
            timestamp: new Date(),
            receivedParams: Object.keys(params)
          }
        };
      }

      // Diagnostic logging of current service status
     //CD::console.log('[OpenAI] Current Service Status:', {
      //   status: this.status,
      //   clientInitialized: !!this.client,
      //   apiKeyPresent: !!this.config.apiKey
      // });

      // Determine domain
      //console.log("THESE ARE THE PARAMS", params)
      const domain = params.domain || 'default';
      //CD::console.log('[OpenAI] Using domain:', domain);

      const iqubes = params.iqubes || 'No connected iQubes';
      //console.log('[OpenAI] These are the connected iqubes:', iqubes);

      const iqubesMap = params.iqubes instanceof Map ? params.iqubes : new Map();
      const iqubesArray = Array.from(iqubesMap.values());


      // Process message with detailed error handling
      try {
        const response = await this.processMessage(message, domain, iqubesArray);
        //console.log('[OpenAI] Response generated successfully');

        return {
          success: true,
          data: response,
          metadata: { 
            domain, 
            timestamp: new Date(),
            conversationLength: this.conversationHistory.length 
          }
        };
      } catch (processError) {
        console.error('[OpenAI] Message processing error:', processError);
        return {
          success: false,
          error: processError instanceof Error 
            ? processError.message 
            : 'Unknown message processing error',
          metadata: { 
            timestamp: new Date(),
            domain,
            errorDetails: processError
          }
        };
      }
    } catch (error: any) {
      console.error('[OpenAI] Execution Error:', error);
      return {
        success: false,
        error: error.message || 'Unknown error during API execution',
        metadata: { 
          timestamp: new Date(),
          domain: params.domain || 'default',
          errorStack: error.stack
        }
      };
    }
  }

  private async processMessage(message: string, domain: string = 'default', iqubesArray: any[] = []): Promise<string> {
    //console.log(`[OpenAI] Processing message for domain: ${domain}`);
    //console.log(`[OpenAI - send message] Active iQubes received:`, iqubesArray);
    
    // Detailed initialization check
    // console.log('[OpenAI] Pre-processing service status:', {
    //   status: this.status,
    //   clientInitialized: !!this.client,
    //   apiKeyPresent: !!this.config.apiKey
    // });

    // Validate initialization status with more robust handling
    if (this.status !== ServiceStatus.READY) {
      console.warn('[OpenAI] Service not ready. Attempting to initialize...');
      
      try {
        // Force initialization
        await this.initialize('default');
        //console.log('[OpenAI] Initialization completed');
      } catch (initError) {
        console.error('[OpenAI] Initialization failed:', initError);
        throw new Error(`OpenAI service initialization failed: ${initError instanceof Error ? initError.message : 'Unknown error'}`);
      }
    }

    // Ensure client is available
    if (!this.client) {
      console.error('[OpenAI] Client is null after initialization');
      throw new Error('OpenAI client could not be created');
    }

    try {
      // Determine system prompt
      const systemPromptKey = Object.keys(this.SYSTEM_PROMPTS).includes(domain) 
        ? domain as keyof typeof this.SYSTEM_PROMPTS 
        : 'default';

      //console.log(`[OpenAI] Using system prompt key: ${systemPromptKey}`);

      // Format the iQube data as a string
      const iqubeDataString = iqubesArray.length > 0 
      ? iqubesArray.map(iq => 
          `ID: ${iq.id}\n` + 
          Object.entries(iq)
            .map(([key, value]) => `  ${key}: ${value}`)
            .join('\n')
        ).join('\n\n')
      : 'No connected iQubes';



      // Construct system prompt with iQube details
      const systemPromptContent = `${this.SYSTEM_PROMPTS[systemPromptKey]}\n\Here is your direct access to user's connected iQubes:\n${iqubeDataString}`;

      const existingSystemPrompt = this.conversationHistory.find(msg => msg.role === 'system');

      if (
        this.conversationHistory.length === 0 || 
        this.conversationHistory[0].role !== 'system'
      ) {
        this.conversationHistory.unshift({
          role: 'system',
          content: systemPromptContent
        });
      } else {
        // If a system message exists, update its content instead of adding a new one
        this.conversationHistory[0].content = systemPromptContent;
      }



      // Create chat completion
      const completion = await this.client.chat.completions.create({
        messages: [
          ...this.conversationHistory,
          { role: 'user', content: message }
        ],
        model: this.DEFAULT_MODEL,
      });

      

      // Extract response
      const response = completion.choices[0]?.message?.content;
      
      // Validate response
      if (!response) {
        console.warn('[OpenAI] No response generated');
        throw new Error('No response generated by OpenAI');
      }
      
      // Update conversation history
      this.conversationHistory.push(
        { role: 'user', content: message },
        { role: 'assistant', content: response }
      );
      
      this.trimConversationHistory();
      

      return response;
    } catch (error: any) {
      console.error(`[OpenAI] Message Processing Error for ${domain} domain:`, error);
      
      // Detailed error logging
      if (error.response) {
        console.error('Response Status:', error.response.status);
        console.error('Response Data:', error.response.data);
      }
      
      throw new Error(`Failed to process message: ${error.message}`);
    }
  }

  private trimConversationHistory(): void {
    // Keep system prompt and last MAX_HISTORY_LENGTH messages
    const systemPrompt = this.conversationHistory[0];
    const recentMessages = this.conversationHistory.slice(-this.MAX_HISTORY_LENGTH * 2 + 1);
    this.conversationHistory = [systemPrompt, ...recentMessages];
  }

  public clearHistory(domain: keyof typeof this.SYSTEM_PROMPTS = 'default'): void {
    this.resetConversationHistory(domain);
  }
}
