// Define types for domain configuration
export interface DomainConfig {
  [key: string]: any;
}

export interface OrchestrationAgentInterface {
  // Core initialization methods
  initialize(): Promise<void>;
  initializeSpecializedDomain(domain: string, config: DomainConfig): Promise<void>;
  querySpecializedDomain(domain: string, query: string): Promise<any>;
  getStatus(): Promise<any>;
  isInitialized(): boolean;

  // iQube-specific methods
  retrieveIQubeMetadata(tokenId: string): Promise<any>;
  decryptBlakQube(tokenId: string): Promise<Record<string, string>>;
  useIQube(tokenId: string): Promise<boolean>;
  getCurrentDomain(): string;
  getIQubeData(): any;
}
