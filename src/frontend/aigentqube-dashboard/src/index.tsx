import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import App from './app';
import { ChakraProvider } from '@chakra-ui/react';
import IQubeNFTMinter from './iQube/NFTMinter';
import { coinbaseWallet, embeddedWallet, metamaskWallet, phantomWallet, rainbowWallet, ThirdwebProvider, trustWallet, walletConnect, zerionWallet } from '@thirdweb-dev/react';
// import {getAllWalletsList } from 'thirdweb/wallets';
import { Polygon } from '@thirdweb-dev/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { thirdWebClient } from './utils/3rdWebClient';

// Initialize QueryClient
const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
});

// Prevent unhandled promise rejections from crashing the app
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault(); // Prevent the error from being logged to the console
});

// Create router configuration
const router = createBrowserRouter([
  {
    path: '/minter',
    element: <IQubeNFTMinter />,
  },
  {
    path: '/',
    element: <App />,
    children: [
      // Add nested routes here if needed
    ],
  },
]);

// Mount the app
root.render(
  <QueryClientProvider client={queryClient}>
    <ChakraProvider>
      <ThirdwebProvider activeChain={Polygon}
      supportedWallets={
        [
        embeddedWallet({
          auth:{
            options:['email','phone'], //add 'google','apple','facebook' 
            redirectUrl: window.location.origin,
          }
        }),
        metamaskWallet(),
        coinbaseWallet(),
        walletConnect(),
        trustWallet(),
        rainbowWallet(),
        zerionWallet(),
        phantomWallet(),
      ]
      }
      clientId={thirdWebClient.clientId}>
      
        <RouterProvider router={router} />
      </ThirdwebProvider>
    </ChakraProvider>
  </QueryClientProvider>
);
