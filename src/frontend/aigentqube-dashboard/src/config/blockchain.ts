import Web3 from 'web3';

// Polygon Amoy Testnet Configuration
export const BLOCKCHAIN_CONFIG = {
  NETWORK_ID: 80002,
  RPC_URL: 'https://rpc-amoy.polygon.technology/',
  CHAIN_NAME: 'Polygon Amoy Testnet',
  CURRENCY_SYMBOL: 'MATIC',
  EXPLORER_URL: 'https://amoy.polygonscan.com/'
};

// iQubeNFT Contract Details
export const IQUBE_NFT_CONTRACT = {
  // Confirmed contract address
  ADDRESS: '0x632E1d32e34F0A690635BBcbec0D066daa448ede',
  ABI: [
    {
      "inputs": [
        {"name": "name", "type": "string"},
        {"name": "symbol", "type": "string"},
        {"name": "_lzEndpoint", "type": "address"},
        {"name": "_delegate", "type": "address"}
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {"name": "tokenURI", "type": "string"},
        {"name": "encryptionKey", "type": "string"}
      ],
      "name": "mintToken",
      "outputs": [{"name": "tokenId", "type": "uint256"}],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"name": "tokenId", "type": "uint256"}],
      "name": "tokenURI",
      "outputs": [{"name": "uri", "type": "string"}],
      "stateMutability": "view",
      "type": "function"
    }
  ]
};

// Utility function to get Web3 instance
export const getWeb3Instance = async () => {
  if ((window as any).ethereum) {
    const web3 = new Web3((window as any).ethereum);
    try {
      // Request account access
      await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      
      // Verify network
      const networkId = Number(await web3.eth.net.getId());
      if (networkId !== BLOCKCHAIN_CONFIG.NETWORK_ID) {
        throw new Error(`Please connect to ${BLOCKCHAIN_CONFIG.CHAIN_NAME}`);
      }
      
      return web3;
    } catch (error) {
      console.error('Web3 connection error:', error);
      throw error;
    }
  } else {
    throw new Error('Please install MetaMask');
  }
};

// Utility function to get iQubeNFT Contract instance
export const getIQubeNFTContract = async (web3: Web3) => {
  return new web3.eth.Contract(
    IQUBE_NFT_CONTRACT.ABI as any, 
    IQUBE_NFT_CONTRACT.ADDRESS
  );
};

// Utility function to check network compatibility
export const isCorrectNetwork = async (web3: Web3): Promise<boolean> => {
  try {
    const networkId = Number(await web3.eth.net.getId());
    return networkId === BLOCKCHAIN_CONFIG.NETWORK_ID;
  } catch (error) {
    console.error('Network check error:', error);
    return false;
  }
};
