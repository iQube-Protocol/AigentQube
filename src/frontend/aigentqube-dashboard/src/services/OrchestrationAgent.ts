import { ContextDomain } from '../types/context';
import { ServiceStatus } from '../types/service';
import { StateUpdate } from '../types/state';
import { APIIntegrationManager, APIIntegration, APIResponse } from './api/APIIntegrationManager';
import { OpenAIIntegration } from './api/OpenAIIntegration';

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

export class OrchestrationAgent {
  private contextLayer: LayerStatus;
  private serviceLayer: LayerStatus;
  private stateLayer: LayerStatus;
  private subscribers: ((state: OrchestrationState) => void)[];
  private apiManager: APIIntegrationManager;
  private nlpProcessor: OpenAIIntegration;
  private initialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    this.contextLayer = this.initializeLayer();
    this.serviceLayer = this.initializeLayer();
    this.stateLayer = this.initializeLayer();
    this.subscribers = [];
    this.apiManager = new APIIntegrationManager();
    
    // Initialize OpenAI integration with proper config
    this.nlpProcessor = new OpenAIIntegration({
      apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
      timeout: 30000,
      retryAttempts: 3
    });
  }

  public async initialize(): Promise<void> {
    // If already initialized, return immediately
    if (this.initialized) {
      return;
    }

    // If already initializing, wait for the existing promise
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      try {
        console.log('Initializing OrchestrationAgent...');
        console.log('OpenAI API Key:', this.nlpProcessor.config.apiKey ? 'Present' : 'Missing');

        // Initialize OpenAI integration
        try {
          await this.nlpProcessor.initialize();
          console.log('OpenAI integration initialized');
        } catch (error: any) {
          console.error('OpenAI initialization failed:', error);
          throw new Error(`OpenAI initialization failed: ${error.message}`);
        }

        // Register OpenAI integration
        try {
          await this.apiManager.registerAPI(this.nlpProcessor);
          console.log('OpenAI integration registered');
        } catch (error: any) {
          console.error('Failed to register OpenAI:', error);
          throw new Error(`Failed to register OpenAI: ${error.message}`);
        }
        
        // Update service layer status
        this.serviceLayer = {
          isActive: true,
          lastUpdate: new Date(),
          error: null
        };

        // Set initial context layer
        this.contextLayer = {
          isActive: true,
          lastUpdate: new Date(),
          error: null
        };

        // Set initial state layer
        this.stateLayer = {
          isActive: true,
          lastUpdate: new Date(),
          error: null
        };

        this.initialized = true;
        console.log('OrchestrationAgent initialized successfully');
        this.notifySubscribers();
      } catch (error: any) {
        console.error('Failed to initialize OrchestrationAgent:', error);
        this.handleError('service', error);
        throw error;
      } finally {
        this.initializationPromise = null;
      }
    })();

    return this.initializationPromise;
  }

  public async getStatus(): Promise<OrchestrationState> {
    return {
      context: { ...this.contextLayer },
      service: { ...this.serviceLayer },
      state: { ...this.stateLayer }
    };
  }

  public getLayerStatus(): OrchestrationState {
    return {
      context: { ...this.contextLayer },
      service: { ...this.serviceLayer },
      state: { ...this.stateLayer }
    };
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  private initializeLayer(): LayerStatus {
    return {
      isActive: false,
      lastUpdate: new Date(),
      error: null
    };
  }

  // Context Layer Management
  public async updateContext(context: Partial<ContextDomain>): Promise<void> {
    try {
      await this.ensureInitialized();
      
      // Update context layer
      this.contextLayer = {
        isActive: true,
        lastUpdate: new Date(),
        error: null
      };

      // Notify service layer of context change
      await this.propagateContextUpdate(context);
      
      this.notifySubscribers();
    } catch (error) {
      this.handleError('context', error);
    }
  }

  // Service Layer Management
  public async updateService(status: ServiceStatus): Promise<void> {
    try {
      await this.ensureInitialized();
      
      // Update service layer
      this.serviceLayer = {
        isActive: true,
        lastUpdate: new Date(),
        error: null
      };

      // Propagate service changes to state layer
      await this.propagateServiceUpdate(status);
      
      this.notifySubscribers();
    } catch (error) {
      this.handleError('service', error);
    }
  }

  // State Layer Management
  public async updateState(update: StateUpdate): Promise<void> {
    try {
      await this.ensureInitialized();
      
      // Update state layer
      this.stateLayer = {
        isActive: true,
        lastUpdate: new Date(),
        error: null
      };

      // Reflect state changes back to context if needed
      await this.reflectStateToContext(update);
      
      this.notifySubscribers();
    } catch (error) {
      this.handleError('state', error);
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized && this.initializationPromise) {
      await this.initializationPromise;
    }
    if (!this.initialized) {
      throw new Error('OrchestrationAgent not initialized');
    }
  }

  // Layer Propagation Methods
  private async propagateContextUpdate(context: Partial<ContextDomain>): Promise<void> {
    try {
      // Update service layer based on context
      this.serviceLayer = {
        ...this.serviceLayer,
        lastUpdate: new Date()
      };
      
      // Update state layer based on context
      this.stateLayer = {
        ...this.stateLayer,
        lastUpdate: new Date()
      };
    } catch (error) {
      console.error('Error propagating context update:', error);
      throw error;
    }
  }

  private async propagateServiceUpdate(status: ServiceStatus): Promise<void> {
    try {
      // Update state layer based on service status
      this.stateLayer = {
        ...this.stateLayer,
        lastUpdate: new Date()
      };
    } catch (error) {
      console.error('Error propagating service update:', error);
      throw error;
    }
  }

  private async reflectStateToContext(update: StateUpdate): Promise<void> {
    try {
      // Update context layer based on state changes
      this.contextLayer = {
        ...this.contextLayer,
        lastUpdate: new Date()
      };
    } catch (error) {
      console.error('Error reflecting state to context:', error);
      throw error;
    }
  }

  // Error Handling
  private handleError(layer: keyof OrchestrationState, error: Error): void {
    const layerStatus = this[`${layer}Layer`] as LayerStatus;
    layerStatus.error = error.message;
    layerStatus.isActive = false;
    layerStatus.lastUpdate = new Date();
    this.notifySubscribers();
  }

  // Subscription Management
  public subscribe(callback: (state: OrchestrationState) => void): () => void {
    this.subscribers.push(callback);
    // Immediately notify the new subscriber of the current state
    callback(this.getLayerStatus());
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers(): void {
    const state = this.getLayerStatus();
    this.subscribers.forEach(subscriber => subscriber(state));
  }

  // Process natural language command
  public async processCommand(command: string, context?: any): Promise<APIResponse> {
    try {
      await this.ensureInitialized();

      // Get current state for context
      const currentState = this.getLayerStatus();

      console.log('Processing command with context:', { command, currentState, context });

      // Process command through OpenAI
      const response = await this.apiManager.executeAPI(this.nlpProcessor.id, {
        message: command,
        context: { ...currentState, ...context }
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to process command');
      }

      return response;
    } catch (error: any) {
      console.error('Command processing error:', error);
      return {
        success: false,
        error: error.message,
        metadata: { timestamp: new Date() }
      };
    }
  }

  // Health Check Methods
  public async validateLayerAlignment(): Promise<boolean> {
    try {
      await this.ensureInitialized();
      
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      // Check if all layers are active and recently updated
      const layersAligned = 
        this.contextLayer.isActive &&
        this.serviceLayer.isActive &&
        this.stateLayer.isActive &&
        !this.contextLayer.error &&
        !this.serviceLayer.error &&
        !this.stateLayer.error &&
        this.contextLayer.lastUpdate > fiveMinutesAgo &&
        this.serviceLayer.lastUpdate > fiveMinutesAgo &&
        this.stateLayer.lastUpdate > fiveMinutesAgo;
      
      if (!layersAligned) {
        console.warn('Layer misalignment detected:', this.getLayerStatus());
      }
      
      return layersAligned;
    } catch (error) {
      console.error('Error validating layer alignment:', error);
      return false;
    }
  }
}
