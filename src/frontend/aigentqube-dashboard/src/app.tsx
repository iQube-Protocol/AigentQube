import React, { useState, useCallback, useEffect } from 'react';
import Web3 from 'web3';
import axios from 'axios';
import DashboardLayout from './components/DashboardLayout';
import AgentEvolutionPanel from './components/AgentEvolutionPanel';

// Define comprehensive interfaces
interface BlockchainMetrics {
  transaction_count: number;
  total_value: number;
  gas_used: number;
}

interface AgentStatus {
  agent_id: string;
  status: string;
  blockchain_metrics: BlockchainMetrics;
}

interface AgentInteraction {
  query: string;
  response: string;
  timestamp: Date;
}

const App: React.FC = () => {
  // Web3 and Wallet State
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string>('');
  
  // Agent Management State
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  
  // Interaction State
  const [userQuery, setUserQuery] = useState<string>('');
  const [interactions, setInteractions] = useState<AgentInteraction[]>([]);
  
  // WebSocket State
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);

  // Add context management state
  const [context, setContext] = useState<any>(null);

  // Initialize Web3 and Wallet Connection
  const initWeb3 = useCallback(async () => {
    if ((window as any).ethereum) {
      try {
        // Request account access
        await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        const web3Instance = new Web3((window as any).ethereum);
        setWeb3(web3Instance);
        
        // Get connected account
        const accounts = await web3Instance.eth.getAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (error) {
        console.error('Web3 initialization error:', error);
      }
    } else {
      console.warn('Web3 provider not found');
    }
  }, []);

  // Register Agent with Backend
  const registerAgent = useCallback(async () => {
    try {
      const response = await axios.post('http://localhost:8000/agent/register', {
        name: `AigentQube Agent ${Date.now()}`,
        wallet_address: account,
        api_keys: {
          // Add any necessary API keys
        }
      });

      const newAgent = response.data;
      setSelectedAgent(newAgent.agent_id);
    } catch (error) {
      console.error('Agent registration error:', error);
    }
  }, [account]);

  // WebSocket Connection for Real-time Updates
  const connectWebSocket = useCallback(() => {
    const ws = new WebSocket('ws://localhost:8000/agent/status');
    
    ws.onopen = () => {
      console.log('WebSocket connection established');
      setWebsocket(ws);
    };

    ws.onmessage = (event) => {
      const agentStatus: AgentStatus = JSON.parse(event.data);
      setAgentStatuses(prev => 
        prev.map(status => 
          status.agent_id === agentStatus.agent_id ? agentStatus : status
        )
      );
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setWebsocket(null);
    };

    return () => {
      ws.close();
    };
  }, []);

  // Interact with Agent
  const interactWithAgent = useCallback(async () => {
    if (!selectedAgent) return;
    
    try {
      const response = await axios.post('http://localhost:8000/agent/interact', {
        query: userQuery,
        agent_id: selectedAgent
      });

      const interaction: AgentInteraction = {
        query: userQuery,
        response: response.data.response,
        timestamp: new Date()
      };
      
      setInteractions(prev => [...prev, interaction]);
      setUserQuery('');
    } catch (error) {
      console.error("Agent interaction error:", error);
    }
  }, [selectedAgent, userQuery]);

  // Context change handler
  const handleContextChange = (newContext: any) => {
    setContext(newContext);
    // Additional logic for context updates can be added here
    console.log('Context Updated:', newContext);
  };

  // Lifecycle Hooks
  useEffect(() => {
    initWeb3();
  }, [initWeb3]);

  useEffect(() => {
    const cleanup = connectWebSocket();
    return cleanup;
  }, [connectWebSocket]);

  // Render Blockchain Metrics
  const renderBlockchainMetrics = (metrics: BlockchainMetrics) => (
    <div className="blockchain-metrics">
      <p>Transactions: {metrics.transaction_count}</p>
      <p>Total Value: {metrics.total_value}</p>
      <p>Gas Used: {metrics.gas_used}</p>
    </div>
  );

  // Render Interaction History
  const renderInteractions = () => (
    <div className="space-y-2">
      {interactions.map((interaction, index) => (
        <div key={index} className="border p-2 rounded">
          <p><strong>Query:</strong> {interaction.query}</p>
          <p><strong>Response:</strong> {interaction.response}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="aigentqube-app">
      <DashboardLayout
        context={context}
        onContextChange={handleContextChange}
        agentId={selectedAgent}
      >
        {/* Wallet Connection */}
        <div className="mb-4">
          <button 
            onClick={initWeb3}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {account ? `Connected: ${account.slice(0, 6)}...` : 'Connect Wallet'}
          </button>
        </div>
        
        {/* Agent Registration */}
        {account && (
          <button 
            onClick={registerAgent}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Register New Agent
          </button>
        )}
        
        {/* Agent Status */}
        {agentStatuses.map(status => (
          <div key={status.agent_id} className="mb-4">
            <h2>Agent: {status.agent_id}</h2>
            <p>Status: {status.status}</p>
            {renderBlockchainMetrics(status.blockchain_metrics)}
          </div>
        ))}
        
        {/* Agent Interaction */}
        {selectedAgent && (
          <div className="mt-4">
            <input 
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="Enter your query"
              className="border p-2 w-full rounded"
            />
            <button 
              onClick={interactWithAgent}
              className="bg-purple-500 text-white px-4 py-2 rounded mt-2"
            >
              Send Query
            </button>
            
            {/* Interaction History */}
            <div className="mt-4">
              <h3 className="font-bold">Interaction History</h3>
              {renderInteractions()}
            </div>
          </div>
        )}
      </DashboardLayout>
    </div>
  );
};

export default App;
