import Web3 from 'web3';
import iQubeRegistryJSON from '../contracts/iQubeRegistry.json';

const iQubeRegistryABI = iQubeRegistryJSON.abi;
const iQubeRegistryAddress = iQubeRegistryJSON.address;

// Configuration for different networks
const NETWORK_CONFIG = {
  amoy: {
    chainId: 80002,
    name: 'Polygon Amoy Testnet',
    rpcUrl: process.env.REACT_APP_POLYGON_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology',
    contractAddress: process.env.REACT_APP_IQUBE_REGISTRY_ADDRESS || iQubeRegistryAddress,
    blockExplorer: 'https://www.oklink.com/amoy'
  }
};

// Add logging for debugging
const logContractInteraction = (action: string, data: any) => {
  console.log(`[Contract Interaction] ${action}:`, data);
};

// Define MetaQube interface
export interface MetaQubeDetails {
  name: string;
  description: string;
  creator: string;
  encryptionLevel: string;
  ownerType: string;
  ownerIdentifiability: string;
  customAddress: string;
  customHash: string;
  transactionDate: number;
  sensitivityScore?: number;
  verifiabilityScore?: number;
  accuracyScore?: number;
  riskScore?: number;
}

export interface QubeRegistrationParams {
  qubeType: 'DataQube' | 'ContentQube' | 'AgentQube';
  qubeAddress: string;
  qubeHash: string;
  metadata?: {
    name: string;
    description: string;
    details?: any;
  };
  metaQube: MetaQubeDetails;
}

// Mapping function to convert QubeType to MetaQube type
export const mapQubeTypeToFunction = (qubeType: string): string => {
  switch (qubeType.toLowerCase()) {
    case 'dataqube':
      return 'registerDataQube';
    case 'contentqube':
      return 'registerContentQube';
    case 'agentqube':
      return 'registerAgentQube';
    default:
      throw new Error(`Invalid qube type: ${qubeType}`);
  }
};

// Generate a deterministic address for the Qube
export const generateQubeAddress = async (account: string, qubeHash: string): Promise<string> => {
  try {
    console.log('Using account:', account);

    // Create a deterministic private key from account and hash
    const web3 = new Web3();
    const encodedParams = web3.eth.abi.encodeParameters(
      ['address', 'bytes32'],
      [account, qubeHash]
    );
    const privateKey = web3.utils.keccak256(encodedParams).slice(2); // Remove '0x' prefix
    console.log('Generated private key:', privateKey);

    // Create account from private key
    const qubeAccount = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
    const qubeAddress = qubeAccount.address;
    console.log('Generated Qube address:', qubeAddress);

    return qubeAddress;
  } catch (error) {
    console.error('Error generating Qube address:', error);
    throw error;
  }
};

// Register a Qube
export const registerQube = async (
  qubeType: string,
  qubeAddress: string,
  qubeHash: string,
  account: string,
  metadata: any
) => {
  try {
    // Initialize Web3 with the current provider
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed');
    }
    const web3 = new Web3(window.ethereum);

    // Validate addresses
    const validatedQubeAddress = web3.utils.toChecksumAddress(qubeAddress);
    const validatedAccount = web3.utils.toChecksumAddress(account);
    
    console.log('Validated addresses:', {
      qubeAddress: validatedQubeAddress,
      account: validatedAccount
    });

    const contract = new web3.eth.Contract(iQubeRegistryABI as any, iQubeRegistryAddress);

    // Convert hash to bytes32 format
    const hashBytes32 = web3.utils.padLeft(qubeHash, 64);
    console.log('Hash as bytes32:', hashBytes32);

    console.log('Registering Qube:', {
      type: qubeType,
      address: validatedQubeAddress,
      hash: hashBytes32,
      metadata
    });

    let method;
    switch (qubeType) {
      case 'DataQube':
        method = contract.methods.registerDataQube(validatedQubeAddress, hashBytes32);
        break;
      case 'ContentQube':
        method = contract.methods.registerContentQube(validatedQubeAddress, hashBytes32);
        break;
      case 'AgentQube':
        method = contract.methods.registerAgentQube(validatedQubeAddress, hashBytes32);
        break;
      default:
        throw new Error(`Invalid Qube type: ${qubeType}`);
    }

    // Get gas estimate
    const gas = await method.estimateGas({ from: validatedAccount });
    console.log('Estimated gas:', gas);

    // Send transaction
    const tx = await method.send({
      from: validatedAccount,
      gas: Math.floor(gas * 1.2) // Add 20% buffer
    });

    console.log('Transaction sent:', tx.transactionHash);
    return tx;
  } catch (error) {
    console.error('Error registering Qube:', error);
    throw error;
  }
};

export class ContractInteraction {
  private web3: Web3;
  private contract: any;
  private account: string;

  constructor(web3: Web3, network: keyof typeof NETWORK_CONFIG = 'amoy') {
    logContractInteraction('Initializing', { network, web3 });
    
    if (!NETWORK_CONFIG[network].contractAddress) {
      throw new Error('Contract address not configured. Please set REACT_APP_IQUBE_REGISTRY_ADDRESS');
    }

    this.web3 = web3;
    this.account = web3.eth.accounts[0];
    this.contract = new web3.eth.Contract(iQubeRegistryABI as any, NETWORK_CONFIG[network].contractAddress);

    // Validate network
    this.validateNetwork(network);
    
    logContractInteraction('Initialized', {
      network,
      contractAddress: NETWORK_CONFIG[network].contractAddress
    });
  }

  private async validateNetwork(network: keyof typeof NETWORK_CONFIG) {
    const chainId = await this.web3.eth.getChainId();
    if (chainId !== NETWORK_CONFIG[network].chainId) {
      throw new Error(`Wrong network. Please connect to ${network} (Chain ID: ${NETWORK_CONFIG[network].chainId})`);
    }
  }

  public async registerQube(params: QubeRegistrationParams): Promise<any> {
    try {
      logContractInteraction('Registering Qube', params);

      // Validate input parameters
      if (!params.qubeAddress || !params.qubeHash) {
        throw new Error('Qube address and hash are required');
      }

      // Ensure we have a valid address
      const userAddress = this.account;
      
      // Get the appropriate registration function
      const registerFunction = mapQubeTypeToFunction(params.qubeType);

      // Generate a deterministic address for the Qube
      const generatedQubeAddress = await generateQubeAddress(this.account, params.qubeHash);
      
      // Convert hash to bytes32
      const hashBytes32 = this.web3.utils.padLeft(params.qubeHash, 64);

      console.log('Registering qube with:', {
        function: registerFunction,
        qubeAddress: generatedQubeAddress,
        hash: hashBytes32
      });

      // Call the appropriate registration function
      const method = this.contract.methods[registerFunction](generatedQubeAddress, hashBytes32);
      const gas = await method.estimateGas({ from: this.account });
      const tx = await method.send({
        from: this.account,
        gas: Math.floor(gas * 1.2) // Add 20% buffer
      });

      logContractInteraction('Transaction submitted', tx.transactionHash);
      return tx;

    } catch (error) {
      logContractInteraction('Error registering Qube', error);
      throw error;
    }
  }
}

// Store BlackQube data in local storage or your preferred storage method
export const storeBlackQubeData = async (qubeHash: string, blackQubeData: any) => {
  try {
    const data = {
      dataPoints: [
        { name: 'Profession', value: 'Tech Consultant', source: 'Manual Entry' },
        { name: 'City', value: 'New York', source: 'Manual Entry' },
        { name: 'Web3 Interests', value: 'Learning', source: 'Manual Entry' },
        { name: 'Wallet Address', value: '0x17E1B6c2BfBC721c1dc03d488746E0C6F7ef5242', source: 'MetaMask' }
      ]
    };
    
    // Store in localStorage (you might want to use a proper database in production)
    localStorage.setItem(`blackqube_${qubeHash}`, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error storing BlackQube data:', error);
    throw error;
  }
};
