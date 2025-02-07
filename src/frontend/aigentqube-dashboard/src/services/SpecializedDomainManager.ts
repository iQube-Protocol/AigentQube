import { APIIntegration, APIResponse } from './api/APIIntegrationManager';
import { ServiceStatus } from '../types/service';

interface DomainService {
  id: string;
  name: string;
  description: string;
  api: APIIntegration;
  isActive: boolean;
}

export class SpecializedDomainManager {
  private services: Map<string, DomainService>;

  constructor() {
    this.services = new Map();
  }

  public async initialize(): Promise<void> {
    console.log('Initializing SpecializedDomainManager...');
    // Perform any setup if needed
  }

  public async registerService(domain: string, service: DomainService): Promise<void> {
    try {
      console.log(`Registering service for domain: ${domain}`);

      // Validate service status
      if (service.api.status === ServiceStatus.ERROR) {
        throw new Error(`Cannot register service: ${service.name} is in error state`);
      }

      // Deactivate any existing service for this domain
      const existingService = this.services.get(domain);
      if (existingService) {
        existingService.isActive = false;
      }

      // Register the new service
      this.services.set(domain, service);
      console.log(`Successfully registered service for domain: ${domain}`);
    } catch (error: any) {
      console.error(`Failed to register service for domain ${domain}:`, error);
      throw error;
    }
  }

  public async getActiveService(domain: string): Promise<DomainService | null> {
    const service = this.services.get(domain);
    if (!service || !service.isActive) {
      return null;
    }
    return service;
  }

  public async deactivateAllServices(): Promise<void> {
    for (const [domain, service] of this.services.entries()) {
      service.isActive = false;
      console.log(`Deactivated service for domain: ${domain}`);
    }
  }

  public async deactivateService(domain: string): Promise<void> {
    const service = this.services.get(domain);
    if (service) {
      service.isActive = false;
      console.log(`Deactivated service for domain: ${domain}`);
    }
  }

  public isServiceActive(domain: string): boolean {
    const service = this.services.get(domain);
    return service?.isActive || false;
  }

  public async queryDomain(domain: string, params: { input: string }): Promise<APIResponse> {
    const service = this.services.get(domain);
    if (!service || !service.isActive) {
      return {
        success: false,
        error: `No active service found for domain: ${domain}`
      };
    }

    try {
      return await service.api.execute(params);
    } catch (error: any) {
      console.error(`Error querying domain ${domain}:`, error);
      return {
        success: false,
        error: `Failed to query domain ${domain}: ${error.message}`
      };
    }
  }
}
