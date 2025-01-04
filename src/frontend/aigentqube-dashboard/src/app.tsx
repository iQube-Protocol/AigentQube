import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import axios from 'axios';

interface AgentStatus {
  agent_id: string;
  status: 'active' | 'inactive' | 'processing';
  last_updated: string;
  context_depth: number;
  blockchain_sync: boolean;
}

const App: React.FC = () => {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string>('');
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([]);

  useEffect(() => {
    const initWeb3 = async () => {
      if ((window as any).ethereum) {
        try {
          // Request account access
          await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
          
          // Create Web3 instance
          const web3Instance = new Web3((window as any).ethereum);
          
          // Get connected wallet address
          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);
          setWeb3(web3Instance);
        } catch (error) {
          console.error("Could not connect to Web3 wallet", error);
        }
      } else {
        console.log('Please install MetaMask!');
      }
    };

    const fetchAgentStatuses = async () => {
      try {
        // Mock API call - replace with actual backend endpoint
        const response = await axios.get('/api/agent-statuses');
        setAgentStatuses(response.data);
      } catch (error) {
        console.error("Could not fetch agent statuses", error);
        // Set mock data if API fails
        setAgentStatuses([
          { 
            agent_id: 'agent1', 
            status: 'active', 
            last_updated: new Date().toISOString(), 
            context_depth: 5, 
            blockchain_sync: true 
          },
          { 
            agent_id: 'agent2', 
            status: 'processing', 
            last_updated: new Date().toISOString(), 
            context_depth: 3, 
            blockchain_sync: false 
          }
        ]);
      }
    };

    initWeb3();
    fetchAgentStatuses();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">AigentQube Dashboard</h1>
        
        {/* Wallet Connection Section */}
        <div className="bg-white shadow-md rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold mb-4">Wallet Connection</h2>
          {account ? (
            <div className="flex items-center">
              <span className="mr-2">🔗 Connected Wallet:</span>
              <code className="bg-green-100 p-2 rounded">{account}</code>
            </div>
          ) : (
            <p className="text-yellow-600">Connecting to Web3 wallet...</p>
          )}
        </div>

        {/* Agent Statuses Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agentStatuses.map((agent) => (
            <div 
              key={agent.agent_id} 
              className={`
                p-4 rounded-lg shadow-md
                ${agent.status === 'active' ? 'bg-green-100' : 
                  agent.status === 'processing' ? 'bg-yellow-100' : 
                  'bg-red-100'}
              `}
            >
              <h3 className="font-bold text-lg mb-2">Agent: {agent.agent_id}</h3>
              <div className="space-y-2">
                <p>Status: <span className="font-semibold">{agent.status}</span></p>
                <p>Context Depth: {agent.context_depth}</p>
                <p>
                  Blockchain Sync: 
                  <span className={agent.blockchain_sync ? 'text-green-600' : 'text-red-600'}>
                    {agent.blockchain_sync ? ' ✓ Synced' : ' ✗ Not Synced'}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
