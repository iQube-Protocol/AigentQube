import React, { useState } from 'react';
import Web3 from 'web3';

interface WalletConnectorProps {
  onConnect: (address: string) => void;
  connectedAddress: string | null;
}

const WalletConnector: React.FC<WalletConnectorProps> = ({ onConnect, connectedAddress }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    if ((window as any).ethereum) {
      try {
        setIsConnecting(true);
        // Request account access
        const accounts = await (window as any).ethereum.request({ 
          method: 'eth_requestAccounts' 
        });

        if (accounts.length > 0) {
          const address = accounts[0];
          onConnect(address);
        }
      } catch (error) {
        console.error('Wallet connection failed', error);
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert('Please install MetaMask or another Web3 wallet');
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="wallet-connector">
      {!connectedAddress ? (
        <button 
          onClick={connectWallet} 
          disabled={isConnecting}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div className="wallet-info flex items-center space-x-2">
          <span className="wallet-icon">🔗</span>
          <span className="wallet-address">
            {formatAddress(connectedAddress)}
          </span>
        </div>
      )}
    </div>
  );
};

export default WalletConnector;
