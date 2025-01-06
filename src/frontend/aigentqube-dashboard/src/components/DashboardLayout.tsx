import React, { ReactNode, useState } from 'react';
import AgentEvolutionPanel from './AgentEvolutionPanel';
import ContextTransformationPanel from './ContextTransformationPanel';
import ChatInterface from './ChatInterface';
import NotificationCenter from './NotificationCenter';
import WalletConnector from './WalletConnector';
import IQubeOperations from './IQubeOperations';
import axios from 'axios';

interface DashboardLayoutProps {
  children: ReactNode;
  context?: any;
  onContextChange?: (context: any) => void;
  agentId?: string | null;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  context, 
  onContextChange, 
  agentId 
}) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [account, setAccount] = useState<string | null>(null);

  const handleWalletConnect = async (address: string) => {
    try {
      setWalletAddress(address);
      setAccount(address);
    } catch (error) {
      console.error('Wallet connection failed', error);
    }
  };

  const registerAgent = async () => {
    try {
      const response = await axios.post('/api/register-agent', { 
        walletAddress: walletAddress 
      });
      
      console.log('Agent registered:', response.data);
    } catch (error) {
      console.error('Agent registration failed', error);
    }
  };

  // Provide a default no-op function if onContextChange is not provided
  const handleContextChange = onContextChange || ((context: any) => {});

  return (
    <div className="aigentqube-dashboard min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white">
      <header className="flex justify-between items-center p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold">AigentQube: Dynamic Context Intelligence</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-4">
            <WalletConnector 
              onConnect={handleWalletConnect} 
              connectedAddress={walletAddress}
            />
            {account && (
              <button 
                onClick={registerAgent}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-300"
              >
                Register New Agent
              </button>
            )}
          </div>
          <NotificationCenter />
        </div>
      </header>

      <main className="grid grid-cols-12 gap-4 p-4">
        <div className="col-span-4 space-y-4">
          <AgentEvolutionPanel 
            context={context} 
            onContextChange={handleContextChange} 
            agentId={agentId || undefined}
          />
          
          <IQubeOperations 
            onViewMetaQube={(iQubeId) => console.log(`View MetaQube: ${iQubeId}`)}
            onDecryptBlakQube={(iQubeId) => console.log(`Decrypt BlakQube: ${iQubeId}`)}
            onShareiQube={(iQubeId) => console.log(`Share iQube: ${iQubeId}`)}
            onMintiQube={(iQubeId) => console.log(`Mint iQube: ${iQubeId}`)}
          />
        </div>
        
        <div className="col-span-8">
          <ContextTransformationPanel context={context} />
          <ChatInterface context={context} />
          
          {/* Render any additional children passed to the layout */}
          {children && (
            <div className="mt-4">
              {children}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
