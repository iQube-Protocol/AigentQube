import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import App from './app';
import { ChakraProvider } from '@chakra-ui/react';
import IQubeNFTMinter from './iQube/NFTMinter';

// Debug environment variables
console.log('Environment variables loaded:', {
  NODE_ENV: process.env.NODE_ENV,
  OPENAI_KEY_PRESENT: !!process.env.REACT_APP_OPENAI_API_KEY,
  OPENAI_KEY_TYPE: process.env.REACT_APP_OPENAI_API_KEY?.startsWith('sk-proj-') ? 'Project' : 'Standard'
});

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
});

// Prevent unhandled promise rejections from crashing the app
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault();
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

// Single root creation and render
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ChakraProvider>
      <RouterProvider router={router} />
    </ChakraProvider>
  </React.StrictMode>
);
