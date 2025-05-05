import React, { ReactNode, useState } from 'react';
import AgentEvolutionPanel from './AgentEvolutionPanel';
import ContextTransformationPanel from './ContextTransformationPanel';
import NotificationCenter from './NotificationCenter';
import IQubeOperations from './IQubeOperations';
import { ThirdwebProvider, ConnectWallet, ConnectEmbed } from "@thirdweb-dev/react";
// import { ConnectButton } from "@thirdweb/react";
import { OrchestrationAgent } from "../services/OrchestrationAgent";
import { thirdWebClient } from '../utils/3rdWebClient';

interface DashboardLayoutProps {
  children: ReactNode;
  context?: any;
  onContextChange?: (context: any) => void;
  agentId?: string | null;
  orchestrationAgent?: OrchestrationAgent;
  isAgentReady?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  context, 
  onContextChange, 
  agentId,
  orchestrationAgent,
  isAgentReady
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const goToMintDashboard = (): void => {
    window.location.href = window.location.href + "minter";
  };

  const handleContextChange = onContextChange || ((context: any) => {});

  return (
      <div className="aigentqube-dashboard min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white">
        <header id="dashboard-Header" className="flex justify-center items-center p-4 border-b border-gray-700 relative">
          {/* Button Container */}
          <div className="absolute top-4 left-4 flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded transition-all duration-300 h-[2.5rem]"
            >
              {isSidebarOpen ? "Close Menu" : <span className="text-lg">☰</span>}
            </button>
            
            <button
              onClick={goToMintDashboard}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded transition-all duration-300"
            >
              Create iQube
            </button>  
          </div>

          <h1 id="Aigentz" className="text-2xl font-bold text-center flex-grow whitespace-normal break-words">
            Aigent Z: Dynamic Contextual Intelligence
          </h1>
          <div id="wallet-connection" className="absolute flex inset-y-2 right-4 items-center space-x-2">
            <ConnectWallet client={thirdWebClient} 
            className="group inline-flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            // showThirdwebBranding={false}
            showAllWallets={true}
            modalSize="wide"
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
                
                <IQubeOperations
                  onViewMetaQube={(iQubeId: string) => console.log(`View MetaQube: ${iQubeId}`)}
                  onDecryptBlakQube={(iQubeId: string) => console.log(`Decrypt BlakQube: ${iQubeId}`)}
                  onShareiQube={(iQubeId: string) => console.log(`Share iQube: ${iQubeId}`)}
                  onMintiQube={(iQubeId: string) => console.log(`Mint iQube: ${iQubeId}`)}
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
          </div>
        </main>
      </div>
  );
};

export default DashboardLayout;
