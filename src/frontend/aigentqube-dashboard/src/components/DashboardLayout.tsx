import React, { ReactNode } from 'react';
import AgentEvolutionPanel from './AgentEvolutionPanel';
import ContextTransformationPanel from './ContextTransformationPanel';
import ChatInterface from './ChatInterface';
import NotificationCenter from './NotificationCenter';
import WalletConnector from './WalletConnector';

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
  const [walletAddress, setWalletAddress] = React.useState<string | null>(null);

  const handleWalletConnect = (address: string) => {
    setWalletAddress(address);
  };

  // Provide a default no-op function if onContextChange is not provided
  const handleContextChange = onContextChange || ((context: any) => {});

  return (
    <div className="aigentqube-dashboard min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white">
      <header className="flex justify-between items-center p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold">AigentQube: Dynamic Context Intelligence</h1>
        <div className="flex items-center space-x-4">
          <WalletConnector 
            onConnect={handleWalletConnect} 
            connectedAddress={walletAddress}
          />
          <NotificationCenter />
        </div>
      </header>

      <main className="grid grid-cols-12 gap-4 p-4">
        <div className="col-span-4">
          <AgentEvolutionPanel 
            context={context} 
            onContextChange={handleContextChange} 
            agentId={agentId || undefined}
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
