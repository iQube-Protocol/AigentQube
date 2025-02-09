import React, { ReactNode, useState, useEffect } from 'react';
import Web3 from 'web3';
import { ethers } from 'ethers';
import AgentEvolutionPanel from './AgentEvolutionPanel';
import ContextTransformationPanel from './ContextTransformationPanel';
import NotificationCenter from './NotificationCenter';
import WalletConnector from './WalletConnector';
import IQubeOperations from './IQubeOperations';
import IQubeCreatingPanel from './iQubeCreatingPanel';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from "lucide-react";


// Configure axios base URL and default headers
axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

interface DashboardLayoutProps {
  children: ReactNode;
  context?: any;
  onContextChange?: (context: any) => void;
  agentId?: string | null;
  orchestrationAgent?: OrchestrationAgent;
  isAgentReady?: boolean;
}

interface IQubeOperationsProps {
  onViewMetaQube?: (iQubeId: string) => void;
  onDecryptBlakQube?: (iQubeId: string) => void;
  onShareiQube?: (iQubeId: string) => void;
  onMintiQube?: (iQubeId: string) => void;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  context, 
  onContextChange, 
  agentId,
  orchestrationAgent,
  isAgentReady
}) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  const handleWalletConnect = async (address: string) => {
    try {
      setWalletAddress(address);
      setAccount(address);
      
      // Get signer when wallet is connected
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum as ethers.providers.ExternalProvider);
        const signer = provider.getSigner();
        setSigner(signer);
      }
    } catch (error) {
      console.error('Wallet connection failed', error);
    }
  };

  const initWeb3 = async () => {
    try {
      if ((window as any).ethereum) {
        try {
          // Request account access
          await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
          const web3Instance = new Web3((window as any).ethereum);
          setWeb3(web3Instance);
          
          // Get connected account
          const accounts = await web3Instance.eth.getAccounts();
          if (accounts.length > 0) {
            handleWalletConnect(accounts[0]);
          }
        } catch (error) {
          console.error('Web3 initialization error:', error);
        }
      } else {
        console.warn('Web3 provider not found');
      }
    } catch (error) {
      console.error('Wallet connection failed', error);
    }
  };

  const registerAgent = async () => {
    try {
      console.log('Attempting to register agent...');
      const response = await axios.post('http://localhost:8000/agent/register', {
        name: `AigentQube Agent ${Date.now()}`,
        version: '0.1.0',
        blockchain_networks: ['ethereum']
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000  // 5 seconds timeout
      });

      console.log('Agent registered:', response.data);
    } catch (error) {
      console.error('Agent registration failed', error);
      
      // More detailed error logging
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // The request was made and the server responded with a status code
          console.error('Error response:', error.response.data);
          console.error('Error status:', error.response.status);
        } else if (error.request) {
          // The request was made but no response was received
          console.error('No response received:', error.request);
        } else {
          // Something happened in setting up the request
          console.error('Error setting up request:', error.message);
        }
      }
    }
  };

  const registerIQube = async () => {
    try {
      console.log('Attempting to register iQube...');
      const response = await axios.post('http://localhost:8000/iqube/register', { 
        walletAddress: walletAddress,
        timestamp: Date.now()
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000  // 5 seconds timeout
      });
      
      console.log('iQube registered:', response.data);
    } catch (error) {
      console.error('iQube registration failed', error);
      
      // More detailed error logging
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // The request was made and the server responded with a status code
          console.error('Error response:', error.response.data);
          console.error('Error status:', error.response.status);
        } else if (error.request) {
          // The request was made but no response was received
          console.error('No response received:', error.request);
        } else {
          // Something happened in setting up the request
          console.error('Error setting up request:', error.message);
        }
      }
    }
  };

  const viewRegistry = async () => {
    try {
      // Future implementation for navigating to iQube and Agent registry
      console.log('Navigating to iQube and Agent Registry');
      // Potential future implementation:
      // router.push('/registry') or window.location.href = '/registry'
    } catch (error) {
      console.error('Registry navigation failed', error);
    }
  };

  // Provide a default no-op function if onContextChange is not provided
  const handleContextChange = onContextChange || ((context: any) => {});

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="aigentqube-dashboard min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white">
      <header className="flex justify-center items-center p-4 border-b border-gray-700">
        <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute top-4 left-4 bg-blue-500 text-white p-2 rounded transition-all duration-300"
          >
          {isSidebarOpen ? "Close Menu" : <span className="text-lg">☰</span>}
          </button>
        
          <h1 className="text-2xl font-bold text-center">AigentQube: Dynamic Context Intelligence</h1>        
          <div className="absolute flex top-4 right-4 items-center space-x-4">
          <WalletConnector 
            onConnect={handleWalletConnect} 
            connectedAddress={walletAddress}
          />
          <NotificationCenter />
        </div>
      </header>

      <main className="grid grid-cols-12 gap-4 p-4">

        <div
          className={`transition-all duration-300 relative bg-gray-800 h-full min-h-screen p-4 rounded-lg ${
            isSidebarOpen ? "col-span-4 space-y-4" : "hidden"
          }`}
          >

          {/* Sidebar Content */}
          {isSidebarOpen && (
            <div className="pt-4">
              <div className="bg-gray-700 border border-gray-600">
                <AgentEvolutionPanel
                    context={context}
                    onContextChange={handleContextChange}
                    agentId={agentId || undefined}
                    orchestrationAgent={orchestrationAgent}
                    isAgentReady={isAgentReady}
                />
              </div>

              {/* Context Insights */}
              <div className="pt-4">
                <h2 className="text-lg font-medium text-gray-300 mb-3">
                  Current Context Insights
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  {orchestrationAgent?.getContextInsights().slice(0, 3).map((insight, index) => (
                    <div
                      key={index}
                      className="bg-gray-700 p-4 rounded-lg border border-gray-600"
                    >
                      <div className="text-sm font-medium text-gray-400 mb-1">
                        {insight.label}
                      </div>
                      <div className="text-lg font-semibold text-white">
                        {insight.value}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {insight.category}
                      </div>
                    </div>
                  ))}
                  {(!orchestrationAgent || orchestrationAgent.getContextInsights().length === 0) && (
                    <div className="col-span-3">
                      <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 text-center">
                        <span className="text-gray-400">
                          No context insights available. Connect an iQube to see insights.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
                <IQubeOperations
                  onViewMetaQube={(iQubeId: string) => console.log(`View MetaQube: ${iQubeId}`)}
                  onDecryptBlakQube={(iQubeId: string) => console.log(`Decrypt BlakQube: ${iQubeId}`)}
                  onShareiQube={(iQubeId: string) => console.log(`Share iQube: ${iQubeId}`)}
                  onMintiQube={(iQubeId: string) => console.log(`Mint iQube: ${iQubeId}`)}
                  signer={signer || undefined}
                  context={context}
                  onContextChange={handleContextChange}
                  agentId={agentId || undefined}
                  orchestrationAgent={orchestrationAgent}
                  isAgentReady={isAgentReady}
                />
            </div>
          )}
        </div>
        
        <div className={`transition-all duration-300 h-full min-h-screen ${isSidebarOpen ? "col-span-8" : "col-span-12"}`}>
          <ContextTransformationPanel 
            context={context} 
            orchestrationAgent={orchestrationAgent}
            isAgentReady={isAgentReady}
          />

          {/* Wallet and Register Buttons Section */}
          {/* <div className="flex justify-center items-center mt-4 p-4 bg-gray-800 rounded-lg space-x-4">
            <button 
              onClick={initWeb3}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-300"
            >
              {account ? `Connected: ${account.slice(0, 6)}...` : 'Connect Wallet'}
            </button>
            {account && (
              <>
                <button 
                  onClick={registerAgent}
                  className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-300"
                >
                  Register New Agent
                </button>
                <button 
                  onClick={registerIQube}
                  className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-300"
                >
                  Register New iQube
                </button>
                <button 
                  onClick={viewRegistry}
                  className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-300"
                >
                  View Registry
                </button>
              </>
            )}
          </div> */}


        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
