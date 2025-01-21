import { ethers } from 'ethers';
import iQubeRegistryJSON from '../contracts/iQubeRegistry.json';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import { NETWORK_CONFIG } from '../config/network';

const iQubeRegistryABI = iQubeRegistryJSON.abi;

interface QubeData {
  id: string;
  name: string;
  owner: string;
  createdAt: number;
  qubeType: 'MetaQube' | 'BlakQube' | 'TokenQube';
  metadata: Record<string, any>;
}

export class BlockchainService {
  private static instance: BlockchainService;
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  private readonly POLYGON_AMOY_RPC_URL: string;
  private readonly IQUBE_REGISTRY_ADDRESS: string;
  private web3: Web3;
  private account: string | null = null;

  private constructor() {
    this.POLYGON_AMOY_RPC_URL = process.env.REACT_APP_POLYGON_AMOY_RPC_URL || '';
    this.IQUBE_REGISTRY_ADDRESS = process.env.REACT_APP_AIGENTQUBE_REGISTRY_ADDRESS || '';
    
    // Initialize Web3 with the RPC URL
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      this.web3 = new Web3((window as any).ethereum);
    } else {
      this.web3 = new Web3(new Web3.providers.HttpProvider(this.POLYGON_AMOY_RPC_URL));
    }
  }

  public static getInstance(): BlockchainService {
    if (!BlockchainService.instance) {
      BlockchainService.instance = new BlockchainService();
    }
    return BlockchainService.instance;
  }

  public async initialize(): Promise<void> {
    try {
      if (!(window as any).ethereum) {
        throw new Error('Ethereum provider not found. Please install MetaMask.');
      }

      // Request account access
      const accounts = await (window as any).ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      this.account = accounts[0];

      // Initialize provider
      this.provider = new ethers.providers.Web3Provider((window as any).ethereum);
      
      // Initialize signer
      this.signer = this.provider.getSigner();

      // Initialize contract
      this.contract = new ethers.Contract(
        this.IQUBE_REGISTRY_ADDRESS,
        iQubeRegistryABI,
        this.signer
      );

      // Listen for account changes
      (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
        this.account = accounts[0];
      });

    } catch (error) {
      console.error('Failed to initialize blockchain service:', error);
      throw error;
    }
  }

  public async connectWallet(): Promise<string> {
    try {
      if (!this.provider) {
        await this.initialize();
      }

      if (!this.signer) {
        throw new Error('No signer available');
      }

      const address = await this.signer.getAddress();
      this.account = address;
      return address;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  private convertToBytes32(hash: string): string {
    // Remove '0x' if present
    const cleanHash = hash.startsWith('0x') ? hash.slice(2) : hash;
    
    // Pad the hash to 32 bytes (64 characters)
    const paddedHash = cleanHash.padStart(64, '0');
    
    // Add '0x' prefix back
    return '0x' + paddedHash;
  }

  public async registerQube(
    qubeType: string,
    address: string,
    hash: string
  ): Promise<ethers.ContractTransaction> {
    try {
      if (!this.contract || !this.signer) {
        throw new Error('Contract or signer not initialized');
      }

      // Format address and hash
      const formattedAddress = ethers.utils.getAddress(address);
      const hashBytes32 = this.convertToBytes32(hash);

      // Get the registration function based on qube type
      const registerFunction = this.mapQubeTypeToFunction(qubeType);

      // Estimate gas
      const gasEstimate = await this.contract.estimateGas[registerFunction](
        formattedAddress,
        hashBytes32
      );

      // Add 20% buffer to gas estimate
      const gasLimit = Math.floor(gasEstimate.toNumber() * 1.2);

      // Send transaction
      const tx = await this.contract[registerFunction](
        formattedAddress,
        hashBytes32,
        { gasLimit }
      );

      return tx;
    } catch (error) {
      console.error('Failed to register qube:', error);
      throw error;
    }
  }

  private mapQubeTypeToFunction(qubeType: string): string {
    switch (qubeType.toLowerCase()) {
      case 'dataqube':
        return 'registerDataQube';
      case 'contentqube':
        return 'registerContentQube';
      case 'agentqube':
        return 'registerAgentQube';
      default:
        throw new Error('Invalid Qube type');
    }
  }

  public async getQubesByOwner(owner: string): Promise<QubeData[]> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const qubes = await this.contract.getQubesByOwner(owner);
      return qubes.map((qube: any) => ({
        id: qube.id.toString(),
        name: qube.name,
        owner: qube.owner,
        createdAt: qube.createdAt.toNumber(),
        qubeType: qube.qubeType,
        metadata: qube.metadata
      }));
    } catch (error) {
      console.error('Failed to get qubes:', error);
      throw error;
    }
  }

  public getProvider(): ethers.providers.Web3Provider | null {
    return this.provider;
  }

  public getSigner(): ethers.Signer | null {
    return this.signer;
  }

  public getContract(): ethers.Contract | null {
    return this.contract;
  }

  public async getSignedContract(signer: ethers.Signer): Promise<ethers.Contract> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    return this.contract.connect(signer);
  }

  public async isWalletConnected(): Promise<boolean> {
    try {
      const accounts = await this.web3.eth.getAccounts();
      return accounts.length > 0;
    } catch {
      return false;
    }
  }

  public async getCurrentAccount(): Promise<string | null> {
    return this.account;
  }
}

// Export singleton instance
export const blockchainService = BlockchainService.getInstance();
