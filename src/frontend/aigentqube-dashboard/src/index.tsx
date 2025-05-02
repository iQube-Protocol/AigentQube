import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import App from './app';
import { ChakraProvider } from '@chakra-ui/react';
import IQubeNFTMinter from './iQube/NFTMinter';
import { ThirdwebProvider } from '@thirdweb-dev/react';
import { Polygon } from '@thirdweb-dev/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
      <ThirdwebProvider activeChain={Polygon}>
        <RouterProvider router={router} />
      </ThirdwebProvider>
    </ChakraProvider>
  </QueryClientProvider>
);
