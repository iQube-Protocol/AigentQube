import { InjectedConnector } from '@web3-react/injected-connector';

// Polygon Amoy Testnet Configuration
export const POLYGON_AMOY_CHAIN_ID = 80002;
export const POLYGON_AMOY_RPC_URL = 'https://rpc-amoy.polygon.technology';

export const injected = new InjectedConnector({
  supportedChainIds: [POLYGON_AMOY_CHAIN_ID]
});

export async function switchToPolygonAmoy() {
  if (window.ethereum) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${POLYGON_AMOY_CHAIN_ID.toString(16)}` }]
      });
    } catch (switchError: any) {
      // If the chain is not added, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${POLYGON_AMOY_CHAIN_ID.toString(16)}`,
              chainName: 'Polygon Amoy Testnet',
              nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18
              },
              rpcUrls: [POLYGON_AMOY_RPC_URL],
              blockExplorerUrls: ['https://amoy.polygonscan.com/']
            }]
          });
        } catch (addError) {
          console.error("Could not add Polygon Amoy network", addError);
        }
      }
    }
  }
}
