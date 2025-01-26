import { ethers } from 'ethers';
import axios from 'axios';

// Import the interface from types
import { OrchestrationAgentInterface, DomainConfig } from '../types/orchestration';

// Custom error for orchestration
class OrchestrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrchestrationError';
  }
}

export class OrchestrationAgent implements OrchestrationAgentInterface {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  private initialized: boolean = false;
  private currentDomain: string = 'default';
  private iQubeData: any = null;

  // Service layers tracking
  private serviceLayer: { [key: string]: boolean } = {
    context: false,
    service: false,
    state: false,
    openai: false
  };

  constructor(ethereum: any) {
    try {
      this.initializeServiceLayer(ethereum);
    } catch (error) {
      console.error('Initialization failed:', error);
      this.initialized = false;
    }
  }

  private initializeServiceLayer(ethereum: any): void {
    try {
      // Validate OpenAI service
      this.validateOpenAIService();

      // Initialize Web3 provider
      this.provider = new ethers.providers.Web3Provider(ethereum);
      this.signer = this.provider.getSigner();
      
      // Initialize contract
      const contractAddress = '0x632E1d32e34F0A690635BBcbec0D066daa448ede';
      const ABI = [
        "function getBlakQube(uint256 tokenId) public view returns (string memory)",
        "function getEncryptionKey(uint256 tokenId) public view returns (bytes32)"
      ];
      this.contract = new ethers.Contract(contractAddress, ABI, this.signer);

      // Mark service layers as active
      this.serviceLayer.context = true;
      this.serviceLayer.service = true;
      this.serviceLayer.state = true;

      this.initialized = true;
    } catch (error) {
      console.error('Service layer initialization failed:', error);
      this.serviceLayer.context = false;
      this.serviceLayer.service = false;
      this.serviceLayer.state = false;
      this.initialized = false;
      throw new OrchestrationError('State layer validation failed');
    }
  }

  private validateOpenAIService(): void {
    // Check OpenAI service availability
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    this.serviceLayer.openai = !!openaiKey && openaiKey.startsWith('sk-');
    
    if (!this.serviceLayer.openai) {
      console.warn('OpenAI service validation failed');
    }
  }

  async initialize(): Promise<void> {
    // Validate service layers
    const serviceStatus = await this.getStatus();
    
    if (!serviceStatus.initialized) {
      throw new OrchestrationError('Initialization failed: Service layers not active');
    }
  }

  async initializeSpecializedDomain(domain: string, config: DomainConfig): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    // Set current domain based on input
    this.currentDomain = domain;
    // Additional domain-specific initialization logic can be added here
  }

  async querySpecializedDomain(domain: string, query: string): Promise<any> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    // Placeholder for domain-specific query logic
    console.log(`Querying domain ${domain} with query: ${query}`);
    return {};
  }

  async getStatus(): Promise<any> {
    return {
      initialized: this.initialized,
      currentDomain: this.currentDomain,
      contractAddress: this.contract ? this.contract.address : null,
      serviceStatus: this.serviceLayer
    };
  }

  isInitialized(): boolean {
    return this.initialized && 
           this.serviceLayer.context && 
           this.serviceLayer.service && 
           this.serviceLayer.state;
  }

  // iQube-specific methods
  async retrieveIQubeMetadata(tokenId: string): Promise<any> {
    if (!this.isInitialized()) {
      await this.initialize();
    }

    if (!this.contract) {
      throw new OrchestrationError('Contract not initialized');
    }

    try {
      // Retrieve metadata URI from blockchain
      const metadataURI = await this.contract.getBlakQube(tokenId);
      
      // Fetch metadata from IPFS gateway
      const response = await axios.get(
        metadataURI.replace(
          'ipfs://', 
          `${import.meta.env.VITE_GATEWAY_URL}/ipfs/`
        )
      );

      return response.data;
    } catch (error) {
      console.error('Error retrieving iQube metadata:', error);
      throw error;
    }
  }

  async decryptBlakQube(tokenId: string): Promise<Record<string, string>> {
    if (!this.isInitialized()) {
      await this.initialize();
    }

    if (!this.contract) {
      throw new OrchestrationError('Contract not initialized');
    }

    try {
      // Retrieve encryption key
      const encryptionKey = await this.contract.getEncryptionKey(tokenId);
      
      // Make decryption request to server
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/decrypt-member-data`,
        {
          key: encryptionKey,
          tokenId: tokenId
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Return decrypted data
      return response.data.decryptedData || {};
    } catch (error) {
      console.error('Error decrypting BlakQube:', error);
      throw error;
    }
  }

  async useIQube(tokenId: string): Promise<boolean> {
    try {
      // Retrieve metadata as part of using the iQube
      const metadata = await this.retrieveIQubeMetadata(tokenId);
      
      // Set current domain based on metadata
      this.currentDomain = metadata.domain || 'default';
      this.iQubeData = metadata;

      return true;
    } catch (error) {
      console.error('Error using iQube:', error);
      return false;
    }
  }

  getCurrentDomain(): string {
    return this.currentDomain;
  }

  getIQubeData(): any {
    return this.iQubeData;
  }
}

// Utility function to create OrchestrationAgent
export const createOrchestrationAgent = (ethereum: any): OrchestrationAgent => {
  return new OrchestrationAgent(ethereum);
};
