import { ServiceStatus } from '../../types/service';
import { OrchestrationAgent } from '../OrchestrationAgent';


export interface APIConfig {
  apiKey?: string;
  endpoint?: string;
  model?: string; 
  maxTokens?: number; 
  timeout?: number; 
  retryAttempts?: number; 
  options?: Record<string, any>;
}

export interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}

export interface APIIntegration {
  id: string;
  name: string;
  description: string;
  status: ServiceStatus;
  config: APIConfig;
  initialize: () => Promise<void>;
  execute: (params: any) => Promise<APIResponse>;
  validate: () => Promise<boolean>;
}

export class APIIntegrationManager {
  private integrations: Map<string, APIIntegration>;
  private activeIntegrations: Set<string>;

  constructor() {
    this.integrations = new Map();
    this.activeIntegrations = new Set();
  }

  public async registerAPI(api: APIIntegration): Promise<void> {
    try {
      console.log(`[APIIntegrationManager] Attempting to register API: ${api.name} (ID: ${api.id})`);
      console.log(`[APIIntegrationManager] Current registered integrations:`, 
        Array.from(this.integrations.keys()));
      
      // Validate API status
      if (api.status === ServiceStatus.ERROR) {
        console.warn(`[APIIntegrationManager] Cannot register ${api.name}: Service is in error state`);
        throw new Error(`Cannot register ${api.name}: Service is in error state`);
      }

      // Check if API is already registered
      if (this.integrations.has(api.id)) {
        console.log(`[APIIntegrationManager] API ${api.name} (${api.id}) is already registered`);
        return;
      }

      // Validate the integration
      if (!api.id || !api.name) {
        console.warn(`[APIIntegrationManager] Invalid API integration: Missing required fields`);
        throw new Error('Invalid API integration: Missing required fields');
      }

      // Initialize the integration
      await api.initialize();

      // Validate the integration
      const isValid = await api.validate();
      if (!isValid) {
        console.warn(`[APIIntegrationManager] API integration ${api.name} validation failed`);
        throw new Error(`API integration ${api.name} validation failed`);
      }

      // Register the API
      this.integrations.set(api.id, api);
      console.log(`[APIIntegrationManager] API ${api.name} (${api.id}) registered successfully`);
      console.log(`[APIIntegrationManager] Updated registered integrations:`, 
        Array.from(this.integrations.keys()));
    } catch (error: any) {
      console.error(`[APIIntegrationManager] Failed to register API ${api.name}:`, error);
      throw new Error(`Failed to register API ${api.name}: ${error.message}`);
    }
  }

  public async executeAPI(integrationId: string, params: any): Promise<APIResponse> {
    
    console.log(`[APIIntegrationManager] Attempting to execute API: ${integrationId}`);
    console.log(`[APIIntegrationManager] Current registered integrations:`, 
      Array.from(this.integrations.keys()));

    const integration = this.integrations.get(integrationId);
    if (!integration) {
      console.warn(`[APIIntegrationManager] API integration ${integrationId} not found`);
      console.warn(`[APIIntegrationManager] Registered integrations:`, 
        Array.from(this.integrations.keys()));
      throw new Error(`API integration ${integrationId} not found`);
    }

    try {

      const response = await integration.execute(params);
      return response;
    } catch (error: any) {
      console.error(`[APIIntegrationManager] API execution failed for ${integrationId}:`, error);
      return {
        success: false,
        error: error.message,
        metadata: { timestamp: new Date(), integrationId }
      };
    }
  }

  public getAPIStatus(integrationId: string): ServiceStatus | null {
    const integration = this.integrations.get(integrationId);
    console.log(`[APIIntegrationManager] Checking status for ${integrationId}:`, 
      integration ? integration.status : 'Not Found');
    return integration ? integration.status : null;
  }

  public getAllIntegrations(): APIIntegration[] {
    const integrations = Array.from(this.integrations.values());
    console.log(`[APIIntegrationManager] Getting all integrations. Count:`, integrations.length);
    integrations.forEach(integration => {
      console.log(`- ${integration.name} (${integration.id}): ${integration.status}`);
    });
    return integrations;
  }

  public async validateAllIntegrations(): Promise<Map<string, boolean>> {
    console.log(`[APIIntegrationManager] Validating all integrations`);
    const validationResults = new Map<string, boolean>();
    
    for (const [id, integration] of this.integrations) {
      try {
        const isValid = await integration.validate();
        console.log(`[APIIntegrationManager] Validation for ${id}: ${isValid}`);
        validationResults.set(id, isValid);
      } catch (error) {
        console.warn(`[APIIntegrationManager] Validation error for ${id}:`, error);
        validationResults.set(id, false);
      }
    }

    return validationResults;
  }
}
