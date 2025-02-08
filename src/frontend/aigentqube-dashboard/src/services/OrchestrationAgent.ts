import { ContextDomain } from '../types/context';
import { ServiceStatus } from '../types/service';
import { StateUpdate } from '../types/state';
import { APIIntegrationManager, APIIntegration, APIResponse } from './api/APIIntegrationManager';
import { OpenAIIntegration } from './api/OpenAIIntegration';
import { MetisIntegration } from './api/MetisIntegration';
import { SpecializedDomainManager, DomainService, DomainConfig } from './SpecializedDomainManager';
import { SpecializedDomain } from '../types/domains';
import { IQubeData, ContextInsight, DomainContext } from '../types/context';

// Enhanced logging utility
class Logger {
  private static instance: Logger;
  private logHistory: string[] = [];
  private maxLogEntries: number = 100;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${level.toUpperCase()}] ${timestamp}: ${message}`;
    
    console.log(logEntry);
    
    // Store log entry
    this.logHistory.push(logEntry);
    
    // Maintain log history size
    if (this.logHistory.length > this.maxLogEntries) {
      this.logHistory.shift();
    }
  }

  public getLogHistory(): string[] {
    return [...this.logHistory];
  }

  public clearLogs(): void {
    this.logHistory = [];
  }
}

// Enhanced error handling class
class OrchestrationError extends Error {
  public readonly code: string;
  public readonly context: any;

  constructor(message: string, code: string, context?: any) {
    super(message);
    this.name = 'OrchestrationError';
    this.code = code;
    this.context = context;
  }

  public toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      stack: this.stack
    };
  }


}

interface LayerStatus {
  isActive: boolean;
  lastUpdate: Date;
  error: string | null;
}

interface OrchestrationState {
  context: LayerStatus;
  service: LayerStatus;
  state: LayerStatus;
}

export interface RecommendedAction {
  action: string;
  prompt: string;
  domain: string;
  priority: number;
  contextRelevance: {
    category: string;
    relevanceScore: number;
  }[];
}

export class OrchestrationAgent {
  private logger: Logger;
  private contextLayer: LayerStatus;
  private serviceLayer: LayerStatus;
  private stateLayer: LayerStatus;
  private subscribers: ((state: OrchestrationState) => void)[];
  private apiManager: APIIntegrationManager;
  private nlpProcessor?: OpenAIIntegration;
  private metisService?: MetisIntegration;
  private domainManager?: SpecializedDomainManager;
  private initialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;
  private currentDomain: string = 'Default';
  private domainContext: DomainContext | null;
  private iQubeData: IQubeData | null;

  constructor(
    private apiManager: APIIntegrationManager,
    private nlpProcessor?: OpenAIIntegration,
    private metisService?: MetisIntegration,
    private domainManager?: SpecializedDomainManager
  ) {
    // Ensure a valid APIIntegrationManager is always set
    if (!apiManager) {
      this.apiManager = new APIIntegrationManager();
    }

    this.logger = Logger.getInstance();
    this.initialized = false;
    this.currentDomain = 'Default';
    
    // Ensure APIIntegrationManager is properly set up
    try {
      // Register NLP Processor if available
      if (this.nlpProcessor) {
        this.apiManager.registerAPI(this.nlpProcessor);
      }

      // Register Metis Service if available
      if (this.metisService) {
        this.apiManager.registerAPI(this.metisService);
      }
    } catch (error) {
      this.logger.log(`Failed to register services: ${error}`, 'warn');
    }
    
    // Initialize layer statuses
    this.contextLayer = { 
      isActive: false, 
      lastUpdate: new Date(), 
      error: null 
    };
    this.serviceLayer = { 
      isActive: false, 
      lastUpdate: new Date(), 
      error: null 
    };
    this.stateLayer = { 
      isActive: false, 
      lastUpdate: new Date(), 
      error: null 
    };
    
    // Initialize subscribers
    this.subscribers = [];
  }

  private initializeLayer(): LayerStatus {
    return {
      isActive: false,
      lastUpdate: new Date(),
      error: null
    };
  }

  public async initialize(): Promise<void> {
    try {
      // Reset initialization state
      this.initialized = false;
      this.logger.log('Starting OrchestrationAgent initialization', 'info');
      console.log('[OrchestrationAgent] Initialization started');
      
      // Validate APIIntegrationManager
      if (!this.apiManager) {
        this.apiManager = new APIIntegrationManager();
        this.logger.log('Created new APIIntegrationManager', 'warn');
        console.warn('[OrchestrationAgent] Created new APIIntegrationManager');
      }
      
      // Initialize NLP Processor (OpenAI)
      try {
        const openAIKey = process.env.REACT_APP_OPENAI_API_KEY;
        console.log('[OrchestrationAgent] Initializing OpenAI Integration');
        
        if (!openAIKey) {
          throw new Error('No OpenAI API Key found in environment');
        }

        // Directly create and initialize OpenAI Integration
        this.nlpProcessor = new OpenAIIntegration({
          apiKey: openAIKey
        });

        console.log('[OrchestrationAgent] Created OpenAI Integration');

        // Initialize the NLP Processor
        await this.nlpProcessor.initialize('default');
        console.log('[OrchestrationAgent] OpenAI Integration initialized');

        // Explicitly register the OpenAI integration
        try {
          await this.apiManager.registerAPI(this.nlpProcessor);
          console.log('[OrchestrationAgent] OpenAI Integration registered with APIIntegrationManager');
        } catch (registerError) {
          console.error('[OrchestrationAgent] Failed to register OpenAI Integration:', registerError);
          throw new Error(`Failed to register OpenAI Integration: ${registerError}`);
        }

        // Mark as initialized ONLY if NLP Processor is ready
        this.initialized = this.nlpProcessor.status === ServiceStatus.READY;
        console.log(`[OrchestrationAgent] Initialization complete. Fully initialized: ${this.initialized}`);
      } catch (error) {
        console.error('[OrchestrationAgent] OpenAI Integration Initialization Error:', error);
        this.initialized = false;
        this.nlpProcessor = undefined;
        throw new Error('OpenAI Integration initialization failed');
      }

      // Validate registered services
      const serviceValidations = await this.apiManager.validateAllIntegrations();
      console.log('[OrchestrationAgent] Service Validations:', 
        Object.fromEntries(serviceValidations));
      
      serviceValidations.forEach((isValid, serviceId) => {
        this.logger.log(`Service ${serviceId} validation: ${isValid ? 'PASSED' : 'FAILED'}`, 
          isValid ? 'info' : 'warn'
        );
      });

      // Initialize layers
      try {
        await this.initializeContextLayer();
        await this.initializeServiceLayer();
        await this.initializeStateLayer();
      } catch (layerError) {
        console.error('[OrchestrationAgent] Layer initialization error:', layerError);
        this.logger.log(`Layer initialization error: ${layerError}`, 'warn');
        // Continue even if layers fail to initialize
      }

      // Broadcast initialization state
      this.notifySubscribers({
        context: this.contextLayer,
        service: this.serviceLayer,
        state: this.stateLayer
      });

      // If not fully initialized, throw an error to trigger fallback
      if (!this.initialized) {
        throw new Error('Critical services not fully initialized');
      }
    } catch (error) {
      console.error('[OrchestrationAgent] Initialization error:', error);
      this.logger.log(`Initialization error: ${error}`, 'error');
      
      // Ensure initialization is marked as failed
      this.initialized = false;
      
      // Broadcast error state
      this.notifySubscribers({
        context: { 
          isActive: false, 
          lastUpdate: new Date(), 
          error: error instanceof Error ? error.message : 'Unknown error' 
        },
        service: { 
          isActive: false, 
          lastUpdate: new Date(), 
          error: error instanceof Error ? error.message : 'Unknown error' 
        },
        state: { 
          isActive: false, 
          lastUpdate: new Date(), 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      });

      throw error;
    }
  }

  public isInitialized(): boolean {
    console.log(`[OrchestrationAgent] Checking initialization. Current state: ${this.initialized}`);
    return this.initialized;
  }

  private async initializeContextLayer(): Promise<void> {
    try {
      const serviceChecks: Promise<boolean>[] = [];

      // Check Metis service if available
      if (this.metisService) {
        serviceChecks.push(
          this.metisService.validate()
            .then(result => {
              this.serviceLayer.isActive = result;
              if (!result) {
                this.serviceLayer.error = 'Metis service health check failed: Service not responding';
                this.logger.log('Metis service health check failed: Service not responding', 'warn');
              } else {
                this.serviceLayer.error = null;
              }
              return result;
            })
            .catch(error => {
              const errorMsg = `Metis service health check failed: ${error.message || 'Unknown error'}`;
              this.logger.log(errorMsg, 'warn');
              this.serviceLayer.error = errorMsg;
              return false;
            })
        );
      }

      // Check NLP processor if available
      if (this.nlpProcessor) {
        serviceChecks.push(
          this.nlpProcessor.validate()
            .then(result => {
              this.contextLayer.isActive = result;
              if (!result) {
                this.contextLayer.error = 'NLP processor validation failed: Service not responding';
                this.logger.log('NLP processor validation failed: Service not responding', 'warn');
              } else {
                this.contextLayer.error = null;
              }
              return result;
            })
            .catch(error => {
              const errorMsg = `NLP processor validation failed: ${error.message || 'Unknown error'}`;
              this.logger.log(errorMsg, 'warn');
              this.contextLayer.error = errorMsg;
              return false;
            })
        );
      }

      // Wait for service checks but don't block if they fail
      const serviceResults = await Promise.allSettled(serviceChecks);
      
      // Log results for debugging
      serviceResults.forEach((result, index) => {
        if (result.status === 'rejected') {
          this.logger.log(`Service check ${index} failed: ${result.reason}`, 'warn');
        }
      });

      // Validate layers after initialization
      const contextValid = this.validateLayer(this.contextLayer, 'Context');
      const serviceValid = this.validateLayer(this.serviceLayer, 'Service');

      if (!contextValid || !serviceValid) {
        const errors = {
          context: this.contextLayer.error,
          service: this.serviceLayer.error
        };
        
        throw new OrchestrationError(
          'Layer alignment validation failed: Services not properly initialized', 
          'LAYER_VALIDATION_ERROR',
          { 
            contextLayerValid: contextValid,
            serviceLayerValid: serviceValid,
            errors 
          }
        );
      }
    } catch (error) {
      // Log the error but don't rethrow - this is an initialization error that should be suppressed
      this.logger.log(`Context layer initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'warn');
      return;
    }
  }

  private async initializeServiceLayer(): Promise<void> {
    try {
      // Initialize domain manager if available
      if (this.domainManager) {
        await this.domainManager.initialize();
        this.stateLayer.isActive = true;
      }

      // Validate state layer
      const stateValid = this.validateLayer(this.stateLayer, 'State');
      if (!stateValid) {
        throw new OrchestrationError(
          'State layer validation failed', 
          'LAYER_VALIDATION_ERROR',
          { stateLayerValid: stateValid }
        );
      }
    } catch (error) {
      this.logger.log(`Service layer initialization failed: ${error}`, 'error');
      throw error;
    }
  }

  private async initializeStateLayer(): Promise<void> {
    try {
      // Set initial domain context with fallback
      this.currentDomain = 'Default';
      
      // Attempt to get domain context
      try {
        this.domainContext = this.domainManager 
          ? await this.domainManager.getDomainContext(this.currentDomain)
          : { 
              domain: this.currentDomain, 
              description: 'Fallback domain context', 
              capabilities: [] 
            };
      } catch (contextError) {
        this.logger.log(`Failed to get domain context: ${contextError}`, 'warn');
        this.domainContext = { 
          domain: this.currentDomain, 
          description: 'Fallback domain context', 
          capabilities: [] 
        };
      }

      // Validate state layer
      const stateValid = this.validateLayer(this.stateLayer, 'State');
      if (!stateValid) {
        throw new OrchestrationError(
          'State layer validation failed', 
          'LAYER_VALIDATION_ERROR',
          { stateLayerValid: stateValid }
        );
      }
    } catch (error) {
      this.logger.log(`State layer initialization failed: ${error}`, 'error');
      throw error;
    }
  }

  private validateLayer(layer: LayerStatus, layerName: string): boolean {
    if (!layer) {
      this.logger.log(`Invalid ${layerName} layer: Layer object is null`, 'error');
      return false;
    }

    // Check if layer is active
    if (!layer.isActive) {
      this.logger.log(`${layerName} layer validation failed: Layer is not active`, 'warn');
      return false;
    }

    // Check if there are any errors
    if (layer.error) {
      this.logger.log(`${layerName} layer validation failed: ${layer.error}`, 'warn');
      return false;
    }

    // Check last update timestamp
    const now = new Date();
    const timeSinceUpdate = now.getTime() - layer.lastUpdate.getTime();
    if (timeSinceUpdate > 300000) { // 5 minutes
      this.logger.log(`${layerName} layer validation failed: Layer update is stale`, 'warn');
      return false;
    }

    return true;
  }

  public async validateLayerAlignment(): Promise<boolean> {
    try {
      // Validate all layers
      const contextValid = this.validateLayer(this.contextLayer, 'Context');
      const serviceValid = this.validateLayer(this.serviceLayer, 'Service');
      const stateValid = this.validateLayer(this.stateLayer, 'State');

      // Check if all services are properly initialized
      const servicesValid = await this.apiManager.validateAllIntegrations()
        .then(validations => Array.from(validations.values()).every(isValid => isValid))
        .catch(() => false);

      // All layers and services must be valid for alignment
      const isAligned = contextValid && serviceValid && stateValid && servicesValid;

      if (!isAligned) {
        this.logger.log('Layer alignment validation failed', 'warn');
      }

      return isAligned;
    } catch (error) {
      this.logger.log(`Layer alignment validation error: ${error}`, 'error');
      return false;
    }
  }

  public async switchDomain(domain: SpecializedDomain): Promise<void> {
    try {
      this.logger.log(`Switching to domain: ${domain}`, 'info');
      
      // Validate domain
      if (!this.domainManager || !this.domainManager.isValidDomain(domain)) {
        throw new OrchestrationError(
          `Invalid domain: ${domain}`, 
          'INVALID_DOMAIN', 
          { requestedDomain: domain }
        );
      }

      // Get domain-specific context
      this.domainContext = await this.domainManager.getDomainContext(domain);
      this.currentDomain = domain;

      // Reinitialize Metis service for the specific domain
      const apiKey = process.env[`REACT_APP_${domain.toUpperCase()}_API_KEY`];
      if (!apiKey) {
        throw new OrchestrationError(
          `No API key found for domain: ${domain}`, 
          'MISSING_API_KEY', 
          { domain }
        );
      }

      await this.metisService?.initialize();

      this.logger.log(`Domain switched to ${domain} successfully`, 'info');
    } catch (error) {
      this.logger.log(`Domain switch failed: ${error}`, 'error');
      throw error;
    }
  }

  public async processQuery(query: string, context?: any): Promise<APIResponse> {
    try {
      this.logger.log(`Processing query in domain: ${this.currentDomain}`, 'info');
      
      // Use Metis service to process query
      const response = await this.metisService?.processQuery(query, {
        ...context,
        domain: this.currentDomain,
        domainContext: this.domainContext
      });

      return response;
    } catch (error) {
      const orchestrationError = new OrchestrationError(
        'Query processing failed',
        'QUERY_PROCESSING_ERROR',
        { 
          query, 
          domain: this.currentDomain,
          originalError: error 
        }
      );

      this.logger.log(orchestrationError.message, 'error');
      throw orchestrationError;
    }
  }

  // Additional methods for error tracking and management
  public getErrorLogs(): string[] {
    return this.logger.getLogHistory()
      .filter(log => log.includes('[ERROR]'));
  }

  public clearErrorLogs(): void {
    this.logger.clearLogs();
  }

  public getIQubeData(): IQubeData | null {
    return this.iQubeData;
  }

  public getCurrentDomain(): string {
    return this.currentDomain;
  }

  public getServiceStatus(): OrchestrationState {
    return {
      context: this.contextLayer,
      service: this.serviceLayer,
      state: this.stateLayer
    };
  }

  public async initializeSpecializedDomain(
    domain: string,
    config: DomainConfig
  ): Promise<void> {
    if (!this.initialized) {
      throw new Error('OrchestrationAgent not initialized');
    }

    console.log(`Initializing specialized domain: ${domain}`);

    try {
      // Create and register the Metis service for the domain
      const metisService: DomainService = {
        id: `metis-${domain}`,
        name: 'Metis AI Service',
        description: 'Metis AI specialized domain service',
        api: new MetisIntegration({
          apiKey: config.apiKey,
          timeout: 30000,
          retryAttempts: 3,
          baseUrl: 'https://metisapi-8501e3beedcf.herokuapp.com'
        }),
        isActive: true
      };

      // Initialize the service's API
      await metisService.api.initialize();

      // Register the service with the domain manager
      await this.domainManager?.registerService(domain, metisService);

      // Set as current domain
      this.currentDomain = domain;

      console.log(`Successfully initialized domain: ${domain}`);
    } catch (error: any) {
      console.error(`Failed to initialize domain ${domain}:`, error);
      throw new Error(`Failed to initialize domain ${domain}: ${error.message}`);
    }
  }

  public async activateSpecializedDomain(domain: string): Promise<void> {
    if (!this.initialized) {
      throw new Error('OrchestrationAgent not initialized');
    }

    console.log(`Activating domain: ${domain}`);

    try {
      // For specialized domains, initialize Metis service
      if (domain === SpecializedDomain.CRYPTO_ANALYST || 
          domain === SpecializedDomain.AI_COACH) {
        const metisApiKey = process.env.REACT_APP_METIS_API_KEY;
        if (!metisApiKey) {
          throw new Error('Metis API key not found');
        }

        // Create and initialize Metis service for the domain
        const metisService = new MetisIntegration({
          apiKey: metisApiKey,
          timeout: 30000,
          retryAttempts: 3
        });

        // Initialize and validate the service
        const isValid = await metisService.validate();
        if (!isValid) {
          throw new Error('Failed to validate Metis service');
        }

        // Register the service with the domain manager
        await this.domainManager?.registerService(domain, {
          id: metisService.id,
          name: metisService.name,
          description: metisService.description,
          api: metisService,
          isActive: true
        });

        console.log(`Successfully activated specialized domain: ${domain}`);
      } else {
        // For non-specialized domains, deactivate any specialized services
        await this.domainManager?.deactivateAllServices();
        console.log(`Activated default domain: ${domain}`);
      }

      // Update current domain
      this.currentDomain = domain;

      // Update layers
      this.contextLayer = {
        isActive: true,
        lastUpdate: new Date(),
        error: null
      };

      this.serviceLayer = {
        isActive: true,
        lastUpdate: new Date(),
        error: null
      };

      // Notify subscribers
      this.notifySubscribers();

    } catch (error: any) {
      console.error(`Failed to activate domain ${domain}:`, error);
      throw new Error(`Failed to activate domain ${domain}: ${error.message}`);
    }
  }

  public async queryDomain(input: string): Promise<APIResponse> {
    try {
      // Validate initialization
      if (!this.initialized) {
        throw new Error('OrchestrationAgent not initialized');
      }

      // Determine domain-specific context
      const domainContext = this.getDomainContext(this.currentDomain);

      // Use domain manager if available and domain is specialized
      if (this.domainManager && 
          (this.currentDomain === SpecializedDomain.CRYPTO_ANALYST || 
           this.currentDomain === SpecializedDomain.AI_COACH)) {
        const service = await this.domainManager.getActiveService(this.currentDomain);
        if (!service) {
          throw new Error('No active service found for specialized domain');
        }
        return await this.apiManager.executeAPI(service.id, { 
          input, 
          domain: domainContext,
          context: { domain: this.currentDomain }
        });
      }

      // Default NLP processor execution
      return await this.apiManager.executeAPI(this.nlpProcessor.id, {
        input,
        domain: domainContext,
        context: { domain: this.currentDomain }
      });
    } catch (error) {
      this.logger.log(`Domain query error: ${error}`, 'error');
      throw error;
    }
  }

  private getDomainContext(domain: string): string {
    const domainMap: Record<string, string> = {
      'bitcoin': 'bitcoin_advisor',
      'crypto': 'bitcoin_advisor',
      'guardian': 'guardian_aigent',
      'security': 'guardian_aigent',
      'default': 'default'
    };

    // Find the best matching domain context
    const matchedDomain = Object.keys(domainMap).find(key => 
      domain.toLowerCase().includes(key)
    ) || 'default';

    return domainMap[matchedDomain];
  }

  public async querySpecializedDomain(
    domain: string,
    input: string
  ): Promise<APIResponse> {
    if (!this.initialized) {
      throw new Error('OrchestrationAgent not initialized');
    }

    return await this.domainManager?.queryDomain(domain, { input });
  }

  public async updateIQubeData(data: IQubeData): Promise<void> {
    this.iQubeData = data;
    await this.updateContextInsights();
  }

  private async updateContextInsights(): Promise<void> {
    if (!this.iQubeData) return;

    const insights: ContextInsight[] = [];
    
    // Generate insights based on iQube metrics
    switch (this.currentDomain) {
      case SpecializedDomain.BLOCKCHAIN_ADVISOR:
        insights.push(
          {
            label: 'Network Strength',
            value: this.iQubeData.networkMetrics.connectionStrength,
            category: 'network',
            importance: this.iQubeData.networkMetrics.connectionStrength < 0.7 ? 1 : 0.5
          },
          {
            label: 'Consensus Participation',
            value: this.iQubeData.networkMetrics.consensusParticipation,
            category: 'governance',
            importance: this.iQubeData.networkMetrics.consensusParticipation < 0.8 ? 1 : 0.5
          }
        );
        break;

      case SpecializedDomain.GUARDIAN_AIGENT:
        insights.push(
          {
            label: 'Data Sovereignty',
            value: this.iQubeData.sovereigntyMetrics.dataControlScore,
            category: 'sovereignty',
            importance: this.iQubeData.sovereigntyMetrics.dataControlScore < 0.9 ? 1 : 0.5
          },
          {
            label: 'AI Safety Score',
            value: this.iQubeData.aiMetrics.safetyScore,
            category: 'safety',
            importance: this.iQubeData.aiMetrics.safetyScore < 0.95 ? 1 : 0.5
          }
        );
        break;
    }

    this.domainContext = {
      specializedState: this.currentDomain,
      iQubeData: this.iQubeData,
      insights,
      lastUpdate: new Date()
    };
  }

  private generateContextInsights(iQubeData: IQubeData): ContextInsight[] {
    const insights: ContextInsight[] = [];
    
    // User Profile Insights
    if (iQubeData.userProfile) {
      insights.push(
        {
          label: 'Profession',
          value: iQubeData.userProfile.profession,
          category: 'Professional',
          importance: 0.9
        },
        {
          label: 'Industry',
          value: iQubeData.userProfile.industry,
          category: 'Professional',
          importance: 0.85
        },
        {
          label: 'Experience Level',
          value: iQubeData.userProfile.experience,
          category: 'Professional',
          importance: 0.8
        }
      );
    }

    // Performance Insights
    const performanceScore = (
      iQubeData.performanceMetrics.computeCapacity +
      iQubeData.performanceMetrics.reliability +
      iQubeData.performanceMetrics.uptime
    ) / 3;

    insights.push({
      label: 'iQube Performance',
      value: `${(performanceScore * 100).toFixed(1)}%`,
      category: 'Technical',
      importance: 0.95
    });

    // Network Health
    const networkScore = (
      iQubeData.networkMetrics.connectionStrength +
      iQubeData.networkMetrics.reputationScore
    ) / 2;

    insights.push({
      label: 'Network Health',
      value: `${(networkScore * 100).toFixed(1)}%`,
      category: 'Technical',
      importance: 0.85
    });

    return insights.sort((a, b) => b.importance - a.importance);
  }

  public async useIQube(tokenId: string): Promise<boolean> {
    try {
      // For now, use mock data
      const mockProfile = Object.values(mockIQubeProfiles).find(
        profile => profile.tokenId === tokenId
      );

      if (!mockProfile) {
        throw new Error('Invalid iQube Token ID');
      }

      this.iQubeData = mockProfile;
      
      // Generate insights from iQube data
      const insights = this.generateContextInsights(mockProfile);
      
      // Update domain context with new insights
      this.domainContext = {
        specializedState: this.currentDomain,
        iQubeData: mockProfile,
        insights: insights,
        lastUpdate: new Date()
      };

      this.notifySubscribers();
      return true;
    } catch (error) {
      console.error('Failed to use iQube:', error);
      throw error;
    }
  }

  

  public getContextInsights(): ContextInsight[] {
    return this.domainContext?.insights || [];
  }

  private getContextAwarePrompts(domain: string): RecommendedAction[] {
    if (!this.iQubeData || !this.domainContext) {
      return this.getDefaultPrompts(domain);
    }

    const basePrompts = this.getDefaultPrompts(domain);
    const contextualizedPrompts: RecommendedAction[] = [];

    for (const prompt of basePrompts) {
      let priority = prompt.priority;
      const relevantInsights = this.domainContext.insights.filter(insight =>
        prompt.contextRelevance.some(rel => rel.category === insight.category)
      );

      // Adjust priority based on relevant insights
      for (const insight of relevantInsights) {
        const relevance = prompt.contextRelevance.find(rel => rel.category === insight.category);
        if (relevance) {
          priority += insight.importance * relevance.relevanceScore;
        }
      }

      // Customize prompt based on context
      let customizedPrompt = prompt.prompt;
      for (const insight of relevantInsights) {
        customizedPrompt = customizedPrompt.replace(
          `{${insight.category}}`,
          insight.value.toString()
        );
      }

      contextualizedPrompts.push({
        ...prompt,
        prompt: customizedPrompt,
        priority
      });
    }

    // Sort by priority and return top 4
    return contextualizedPrompts
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 4);
  }

  private getDefaultPrompts(domain: string): RecommendedAction[] {
    switch (domain) {
      case SpecializedDomain.BLOCKCHAIN_ADVISOR:
        return [
          {
            action: "Network Performance Analysis",
            prompt: "Analyze Bitcoin network performance with connection strength at {network}. What improvements are recommended?",
            domain,
            priority: 0.8,
            contextRelevance: [
              { category: 'network', relevanceScore: 1.0 }
            ]
          },
          {
            action: "Consensus Participation Strategy",
            prompt: "With current consensus participation at {governance}, what strategies should be implemented to optimize network contribution?",
            domain,
            priority: 0.7,
            contextRelevance: [
              { category: 'governance', relevanceScore: 0.8 }
            ]
          },
          {
            action: "Bitcoin Market Analysis",
            prompt: "Provide a comprehensive market analysis for Bitcoin, including on-chain metrics and market sentiment indicators.",
            domain,
            priority: 0.75,
            contextRelevance: [
              { category: 'market', relevanceScore: 0.9 }
            ]
          },
          {
            action: "Lightning Network Status",
            prompt: "Analyze the current state of the Lightning Network, including node count, channel capacity, and network growth metrics.",
            domain,
            priority: 0.65,
            contextRelevance: [
              { category: 'network', relevanceScore: 0.7 }
            ]
          }
        ];

      case SpecializedDomain.GUARDIAN_AIGENT:
        return [
          {
            action: "Data Sovereignty Assessment",
            prompt: "Current data sovereignty score is {sovereignty}. Analyze potential vulnerabilities and recommend improvements.",
            domain,
            priority: 0.9,
            contextRelevance: [
              { category: 'sovereignty', relevanceScore: 1.0 }
            ]
          },
          {
            action: "AI Safety Optimization",
            prompt: "With an AI safety score of {safety}, what additional safety measures should be implemented?",
            domain,
            priority: 0.85,
            contextRelevance: [
              { category: 'safety', relevanceScore: 1.0 }
            ]
          },
          {
            action: "Identity Management Review",
            prompt: "Review my iQube's identity management system with current strength of {identity}. What improvements are needed?",
            domain,
            priority: 0.8,
            contextRelevance: [
              { category: 'identity', relevanceScore: 0.9 }
            ]
          },
          {
            action: "Privacy Compliance Check",
            prompt: "Evaluate privacy compliance status at {privacy}. What adjustments are needed to maintain optimal data protection?",
            domain,
            priority: 0.75,
            contextRelevance: [
              { category: 'privacy', relevanceScore: 0.8 }
            ]
          }
        ];

      case SpecializedDomain.CRYPTO_ANALYST:
        return [
          {
            action: "DeFi Protocol Analysis",
            prompt: "Analyze the current state of major DeFi protocols, focusing on TVL, yields, and risk metrics.",
            domain,
            priority: 0.85,
            contextRelevance: []
          },
          {
            action: "Cross-Chain Bridge Security",
            prompt: "Evaluate the security status of major cross-chain bridges and recommend risk mitigation strategies.",
            domain,
            priority: 0.8,
            contextRelevance: []
          },
          {
            action: "Layer 2 Scaling Solutions",
            prompt: "Compare the performance and adoption metrics of different Layer 2 scaling solutions.",
            domain,
            priority: 0.75,
            contextRelevance: []
          },
          {
            action: "MEV Analysis",
            prompt: "Analyze current MEV trends and their impact on network efficiency and user experience.",
            domain,
            priority: 0.7,
            contextRelevance: []
          }
        ];

      case SpecializedDomain.AI_COACH:
        return [
          {
            action: "Model Evaluation",
            prompt: "Evaluate the current AI model performance metrics and suggest optimization strategies.",
            domain,
            priority: 0.9,
            contextRelevance: []
          },
          {
            action: "Training Data Quality",
            prompt: "Analyze training data quality and recommend improvements for better model performance.",
            domain,
            priority: 0.85,
            contextRelevance: []
          },
          {
            action: "AI Safety Implementation",
            prompt: "Review current AI safety measures and suggest additional safeguards.",
            domain,
            priority: 0.8,
            contextRelevance: []
          },
          {
            action: "Model Architecture Review",
            prompt: "Evaluate the current model architecture and suggest potential improvements.",
            domain,
            priority: 0.75,
            contextRelevance: []
          }
        ];

      default:
        return [
          {
            action: "iQube Performance Overview",
            prompt: "Provide a comprehensive overview of my iQube's current performance metrics and suggest optimization strategies.",
            domain,
            priority: 0.9,
            contextRelevance: []
          },
          {
            action: "Integration Assistance",
            prompt: "Guide me through integrating AigentQube features into my existing workflow for maximum efficiency.",
            domain,
            priority: 0.85,
            contextRelevance: []
          },
          {
            action: "Security Best Practices",
            prompt: "Review current security settings and recommend best practices for optimal protection.",
            domain,
            priority: 0.8,
            contextRelevance: []
          },
          {
            action: "Feature Optimization",
            prompt: "Help me optimize my use of AigentQube's features for my specific needs and use cases.",
            domain,
            priority: 0.75,
            contextRelevance: []
          }
        ];
    }
  }

  public getRecommendedActions(): RecommendedAction[] {
    return this.getContextAwarePrompts(this.currentDomain);
  }

  private handleError(layer: keyof OrchestrationState, error: Error): void {
    const layerRef = this[`${layer}Layer` as keyof this] as LayerStatus;
    if (layerRef) {
      layerRef.isActive = false;
      layerRef.error = error.message;
      layerRef.lastUpdate = new Date();
    }
    this.notifySubscribers();
  }

  public subscribe(callback: (state: OrchestrationState) => void): () => void {
    // Validate callback
    if (typeof callback !== 'function') {
      throw new OrchestrationError(
        'Invalid subscriber callback', 
        'INVALID_SUBSCRIBER', 
        { providedCallback: callback }
      );
    }

    // Add subscriber
    this.subscribers.push(callback);

    // Return an unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index !== -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  private notifySubscribers(state: OrchestrationState): void {
    try {
      // Log subscriber notification
      this.logger.log(`Notifying ${this.subscribers.length} subscribers`, 'info');

      // Notify each subscriber
      this.subscribers.forEach(subscriber => {
        try {
          subscriber(state);
        } catch (subscriberError) {
          // Log individual subscriber errors without stopping notification
          this.logger.log(
            `Subscriber notification error: ${subscriberError}`, 
            'warn'
          );
        }
      });
    } catch (error) {
      // Log any unexpected errors during notification
      this.logger.log(
        `Unexpected error during subscriber notification: ${error}`, 
        'error'
      );
    }
  }

  public getSubscribersCount(): number {
    return this.subscribers.length;
  }

  // Ensure APIIntegrationManager is registered with services
  private async registerServicesWithAPIManager(): Promise<void> {
    try {
      // Register NLP Processor if available
      if (this.nlpProcessor) {
        await this.apiManager.registerAPI(this.nlpProcessor);
      }

      // Register Metis Service if available
      if (this.metisService) {
        await this.apiManager.registerAPI(this.metisService);
      }
    } catch (error) {
      this.logger.log(`Failed to register services: ${error}`, 'warn');
    }
  }
}
