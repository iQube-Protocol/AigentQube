import { APIIntegration, APIResponse, APIConfig } from './APIIntegrationManager';
import { ServiceStatus } from '../../types/service';
import OpenAI from 'openai';
//import React from 'react';

interface OpenAIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export class VeniceIntegration implements APIIntegration {

    //using OpenAI API class setup as Venice uses openAI
    public readonly id: string = 'veniceai'
    public readonly name: string = 'Venice AI'
    public readonly description: string = 'AI Service powered by Venice for general AI'
    public status: ServiceStatus = ServiceStatus.INITIALIZING
    public readonly config: APIConfig
    private client: OpenAI | null = null
    private conversationHistory: OpenAIMessage[] = []
    private initializationPromise: Promise<void> | null = null

    //Enhanced Configuration copied from OpenAiIntegration.ts

    private readonly MAX_RETRIES = 3;
    private readonly RETRY_DELAY = 1000; // 1 second
    private readonly MAX_HISTORY_LENGTH = 10;
    private readonly DEFAULT_MODEL = 'llama-3.3-70b'

    private readonly SYSTEM_PROMPTS: Record<string, string> = {
        'default': `You are an advanced AI assistant integrated with the AigentQube platform. 
    Your core mission is to provide intelligent, context-aware support for agentic AI and digital sovereignty.
    
    Key Operational Guidelines:
    - Understand and explain AigentQube's agentic AI technology
    - Guide users in leveraging iQubes for AI enhancement
    - Prioritize user security and digital sovereignty
    - Provide clear, actionable guidance
    - Adapt communication to user's technical expertise
    
    Core Knowledge:
    - AigentQube platform architecture and capabilities
    - iQube integration and tokenization
    - Agent-to-agent interaction patterns
    - Digital sovereignty principles
    - AI security best practices`,
  };
    constructor(config: APIConfig) {
    const apiKey =  config.apiKey || process.env.REACT_APP_VENICE_API_KEY;
    if(!apiKey){
        console.error('Venice API key not found')
        throw new Error('Venice API key is required')
    }
  
    //Copied from OpenAIIntegration --> prevents external mods.
    this.config = { 
        ...config, 
        apiKey,
        timeout: config.timeout || 60000,
        retryAttempts: config.retryAttempts || 3
      };
      //keep conversation history secure
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
        if (this.initializationPromise) {
            return this.initializationPromise;
        }
        this.initializationPromise = (async () => {
            try {
                console.log('[Venice API] Initializing...');

                // Check and Validate API Key
                if (!this.config.apiKey) {
                    const envApiKey = process.env.REACT_APP_VENICE_API_KEY;
                    if (!envApiKey) {
                        throw new Error('Venice API key not found');
                    }
                    this.config.apiKey = envApiKey;
                }

                // Initialize VeniceAI client
                this.client = new OpenAI({
                    apiKey: this.config.apiKey,
                    dangerouslyAllowBrowser: true,
                    timeout: this.config.timeout,
                });

                // Reset Conversation History
                this.resetConversationHistory(domain);

                // Attempt to validate the API key (allow retries)
                let validationAttempts = 0;
                while (validationAttempts < this.MAX_RETRIES) {
                    try {
                        const isValid = await this.validate();
                        if (isValid) {
                            this.status = ServiceStatus.READY;
                            console.log('[Venice API] Validation Attempt:', validationAttempts);
                            console.log('[Venice API] Successfully initialized');
                            return;
                        }
                        validationAttempts++;
                        await this.delay(this.RETRY_DELAY * Math.pow(2, validationAttempts));
                    } catch (error: any) {
                        console.error('[Venice API] Validation Error:', error.message);
                        if (validationAttempts === this.MAX_RETRIES - 1) {
                            throw error;
                        }
                    }
                }
                throw new Error('Failed to validate Venice API key');
            } catch (error: any) {
                this.status = ServiceStatus.ERROR;
                console.error('[Venice API] Initialization Error:', error);
            } finally {
                this.initializationPromise = null;
            }
        })();
    }
    public async validate(): Promise<boolean> {
        try{
            if(!this.client){
                throw new Error('Venice API client not initialized')
            }
            const options = {method: 'GET', headers: {Authorization: `Bearer ${this.config.apiKey}`}};
            const response = await fetch('https://api.venice.ai/api/v1/models', options);
            const responseData = await response.json();
            console.log(responseData);
            const availableModels = responseData.data.map((model: any) => model.id);
            console.log('[Venice API] Call to validate()');
            //Ensure default model is available
            const isDefaultModelAvailable = availableModels.includes(this.DEFAULT_MODEL);
            this.status = isDefaultModelAvailable ? ServiceStatus.READY : ServiceStatus.ERROR;
            return this.status === ServiceStatus.READY;
        }
        catch (error:any){
            this.status = ServiceStatus.ERROR;
            //check if more debug info available
            if(error.response){
                console.error('[Venice API] Validation Error:', error.response.data);
            }
            else{
                console.log('[Venice API] Validation Error:', error);
            }
            this.status = ServiceStatus.ERROR
            return false;
        }
    }
    public async execute(params: Record<string, any>): Promise<APIResponse> {
        console.log('[Venice API] Executing...');

        try {
            // Validate input with logging
            const message = params.message || params.input || params.query;
            console.log('[Venice API] Input Message:', message);
            console.log('[Venice API] Params:', params);

            if (!message) {
                console.warn('[Venice API] Invalid input: message, input, or query is required');
                return {
                    success: false,
                    error: 'Invalid input: message, input, or query is required',
                    metadata: { timestamp: new Date() }
                };
            }

            // Future:: Add more logging and domain determination
            const domain = params.domain || 'default';
            const iqubes = params.iqubes instanceof Map ? params.iqubes : new Map();
            const iqubesArray = Array.from(iqubes.values());

            try {
                const response = await this.processMessage(message, domain, iqubesArray);
                return {
                    success: true,
                    data: response,
                    metadata: { timestamp: new Date() }
                };
            } catch (processError) {
                console.log('[Venice API] Processing Error:', processError);
                return {
                    success: false,
                    error: processError instanceof Error ? processError.message : 'Processing error',
                    metadata: { timestamp: new Date() }
                };
            }
        } catch (error: any) {
            console.error('[Venice API] Execution Error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Execution error',
                metadata: { timestamp: new Date() }
            };
        }
    }
    private async processMessage(message: string, domain: string, iqubesArray: any[]): Promise<string> {
        if (this.status !== ServiceStatus.READY) {
            console.warn('Venice API is not initialized--attempting force Init');
            try {
                await this.initialize('default');
                console.log('Venice API initialized successfully');
            } catch (initError) {
                console.error('Venice API initialization failed:', initError);
                throw new Error('Venice API initialization failed');
            }
        }
    
        if (!this.client) {
            throw new Error('Venice API client not initialized');
        }
    
        try {
            const systemPromptKey = Object.keys(this.SYSTEM_PROMPTS).includes(domain) 
                ? domain as keyof typeof this.SYSTEM_PROMPTS 
                : 'default';
    
            const iqubeDataString = iqubesArray.length > 0
                ? iqubesArray.map(iq =>
                    `ID: ${iq.id}\n` +
                    Object.entries(iq)
                        .map(([key, value]) => `  ${key}: ${value}`)
                        .join('\n')
                ).join('\n\n')
                : 'No connected iQubes';
    
            console.log(iqubeDataString);
    
            const systemPromptContent = `${this.SYSTEM_PROMPTS[systemPromptKey]}\n\nConnected iQubes:\n${iqubeDataString}`;
            
            if (this.conversationHistory.length === 0 || this.conversationHistory[0].role !== 'system') {
                this.conversationHistory.unshift({ role: 'system', content: systemPromptContent });
            } else {
                this.conversationHistory[0].content = systemPromptContent;
            }
    
            const requestBody = {
                model: this.DEFAULT_MODEL || 'llama-3.3-70b',
                messages: [...this.conversationHistory, { role: 'user', content: message }],
                venice_parameters: {
                    enable_web_search: 'auto',
                    include_venice_system_prompt: true
                },
                frequency_penalty: 0,
                presence_penalty: 0,
                n: 1,
                max_tokens: 4096, //Future:: Change upper bound to feasible number
                temperature: 0.7,
                top_p: 0.9,
                stream: false
            };
    
            console.log('Request Payload:', JSON.stringify(requestBody, null, 2));
    
            const response = await fetch('https://api.venice.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.config.apiKey}`,  
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
    
            const completion = await response.json();
    
            if (!response.ok) {
                console.error('Venice API Error Response:', completion);
                throw new Error(`Venice API Error: ${completion.error?.message || 'Unknown error'}`);
            }
    
            console.log('Venice API Response:', JSON.stringify(completion, null, 2));
    
            const responseContent = completion.choices?.[0]?.message?.content;
            if (!responseContent) {
                throw new Error('Venice API response is empty or malformed');
            }
            
            // Extract content after </think>
            const cleanedResponse = responseContent.includes('</think>') 
                ? responseContent.split('</think>')[1].trim()  // Remove everything before </think>
                : responseContent;  // If </think> not found, return original response

            this.conversationHistory.push(
                { role: 'user', content: message },
                { role: 'assistant', content: cleanedResponse }
            );

            this.trimConversationHistory();
            return cleanedResponse;
        } catch (error: any) {
            console.error('[Venice API] Process Message Error:', error);
            throw error;
        }
    }
    
    private trimConversationHistory(): void {
        const systemPrompt = this.conversationHistory[0];
        const recentMessages = this.conversationHistory.slice(this.MAX_HISTORY_LENGTH * 2 + 1);
        this.conversationHistory = [systemPrompt, ...recentMessages];
    }
    public clearHistory(domain: keyof typeof this.SYSTEM_PROMPTS = 'default'): void {
        this.resetConversationHistory(domain);
      }        
}