// /*

// import React, { useState } from 'react';
// import Web3 from 'web3';
// import Onboard from '@web3-onboard/core'
// import injectedModule from '@web3-onboard/injected-wallets'

// interface WalletConnectorProps {
//   onConnect: (address: string) => void;
//   connectedAddress: string | null;
// }

// const WalletConnector: React.FC<WalletConnectorProps> = ({ onConnect, connectedAddress }) => {
//   const [isConnecting, setIsConnecting] = useState(false);

//   const connectWallet = async () => {
//     const injected = injectedModule()
//     const onboard = Onboard({
//       wallets: [injected],
//     )}
 
//     const connectedWallets = await onboard.connectWallet()

//     console.log(connectedWallets)
//     /*
//     if ((window as any).ethereum) {
//       try {
//         setIsConnecting(true);
//         // Request account access
//         const accounts = await (window as any).ethereum.request({ 
//           method: 'eth_requestAccounts' 
//         });

//         if (accounts.length > 0) {
//           const address = accounts[0];
//           onConnect(address);
//         }
//       } catch (error) {
//         console.error('Wallet connection failed', error);
//       } finally {
//         setIsConnecting(false);
//       }
//     } else {
//       alert('Please install MetaMask or another Web3 wallet');
//     }
    
//   };

//   const formatAddress = (address: string) => {
//     return `${address.slice(0, 6)}...${address.slice(-4)}`;
//   };



//   return (
//     <div className="wallet-connector">
//       {!connectedAddress ? (
//         <button 
//           onClick={connectWallet} 
//           disabled={isConnecting}
//           className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
//         >
//           {isConnecting ? 'Connecting...' : 'Connect Wallet'}
//         </button>
//       ) : (
//         <div className="wallet-info flex items-center space-x-2">
//           <span className="wallet-icon">🔗</span>
//           <span className="wallet-address">
//             {formatAddress(connectedAddress)}
//           </span>
//         </div>
//       )}
//     </div>
//   );
// };

// export default WalletConnector;
// */

// import React, { useState, useMemo } from 'react';
// import Onboard from '@web3-onboard/core';
// import injectedModule from '@web3-onboard/injected-wallets';

// interface WalletConnectorProps {
//   onConnect: (address: string) => void;
//   connectedAddress: string | null;
// }

// // 🔧 Polygon Amoy Configuration
// const POLYGON_AMOY_CHAIN_ID = 80002;
// const POLYGON_AMOY_RPC_URL = 'https://rpc-amoy.polygon.technology';

// const injected = injectedModule();



// const WalletConnector: React.FC<WalletConnectorProps> = ({ onConnect, connectedAddress }) => {
//   const [isConnecting, setIsConnecting] = useState(false);
//   const onboard = useMemo(() => {
//     const injected = injectedModule();
//     return Onboard({
//       wallets: [injected],
//       chains: [
//         {
//           id: `0x${POLYGON_AMOY_CHAIN_ID.toString(16)}`,
//           token: 'MATIC',
//           label: 'Polygon Amoy Testnet',
//           rpcUrl: POLYGON_AMOY_RPC_URL
//         }
//       ],
//       accountCenter: {
//         desktop: { enabled: false },
//         mobile: { enabled: false }
//       },
//       notify: { enabled: false }
//     });
//   }, []);

//   const connectWallet = async () => {
//     try {
//       setIsConnecting(true);
//       const wallets = await onboard.connectWallet();
//       const connectedWallets =  onboard.state.get().wallets;
//       if (connectedWallets.length) {
//         await onboard.disconnectWallet({ label: connectedWallets[0].label });
//       }
//       if (wallets.length > 0) {
//         const address = wallets[0].accounts[0].address;
//         onConnect(address);
//       }
//     } catch (error) {
//       console.error('Wallet connection failed:', error);
//     } finally {
//       setIsConnecting(false);
//     }
//   };

//   const formatAddress = (address: string) => {
//     return `${address.slice(0, 6)}...${address.slice(-4)}`;
//   };
 

//   return (
//     <div className="wallet-connector">
//       <button
//         onClick={connectWallet}
//         disabled={isConnecting}
//         className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
//       >
//         <span className="wallet-icon">🔗</span>
//         <span className="wallet-address">
//           {connectedAddress ? formatAddress(connectedAddress) : isConnecting ? 'Connecting...' : 'Connect Wallet'}
//         </span>
//       </button>
//     </div>
//   );
// };

// export default WalletConnector;


import { inAppWallet } from "thirdweb/wallets";

const wallets = [
  inAppWallet(
    // built-in auth methods
    {
      auth: {
        options: [
          "google",
          "x",
          "apple",
          "discord",
          "facebook",
          "farcaster",
          "telegram",
          "coinbase",
          "line",
          "email",
          "phone",
          "passkey",
          "guest",
        ],
        passkeyDomain: window.location.origin,
      },
    },
    // or bring your own auth endpoint
  ),
];

export default wallets;
