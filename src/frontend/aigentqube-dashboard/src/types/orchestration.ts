import { DomainConfig } from '../services/SpecializedDomainManager';

export interface OrchestrationAgentInterface {
  initialize(): Promise<void>;
  initializeSpecializedDomain(domain: string, config: DomainConfig): Promise<void>;
  querySpecializedDomain(domain: string, query: string): Promise<any>;
  getStatus(): Promise<any>;
  isInitialized(): boolean;
}
