import React, { useState, useCallback, useEffect } from 'react';
import { SpecializedDomain, DOMAIN_METADATA } from '../types/domains';
import { OrchestrationAgent } from '../services/OrchestrationAgent';

interface AgentEvolutionPanelProps {
  context: any;
  onContextChange: (context: any) => void;
  agentId?: string;
  orchestrationAgent: OrchestrationAgent | null;
  isAgentReady: boolean;
}

const AgentEvolutionPanel: React.FC<AgentEvolutionPanelProps> = ({ 
  context, 
  onContextChange, 
  agentId,
  orchestrationAgent 
}) => {
  const [baseState, setBaseState] = useState('Generic AI');
  const [specializedState, setSpecializedState] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Verify orchestrationAgent is ready
  useEffect(() => {
    if (orchestrationAgent && !orchestrationAgent.isInitialized()) {
      console.error('Agent Not Ready: The orchestration agent is not fully initialized');
    }
  }, [orchestrationAgent]);

  const agentDomains = [
    { name: SpecializedDomain.BLOCKCHAIN_ADVISOR, icon: '₿' },
    { name: SpecializedDomain.CRYPTO_ANALYST, icon: '💰' },
    { name: SpecializedDomain.GUARDIAN_AIGENT, icon: '🛡️' },
    { name: SpecializedDomain.AI_COACH, icon: '🧠' }
  ];

  const handleDomainChange = async (domain: SpecializedDomain) => {
    if (!orchestrationAgent) {
      console.error('Orchestration agent not available');
      return;
    }

    try {
      // Update the specialized state immediately
      setSpecializedState(domain);
      
      // Update context
      if (onContextChange) {
        onContextChange({
          ...context,
          specializedState: domain
        });
      }

      console.log(`Domain selection updated: ${domain}`);
    } catch (error: any) {
      console.error('Failed to update domain selection:', error);
      setError(`Failed to select ${domain}: ${error.message}`);
    }
  };

  const handleResetBaseState = () => {
    orchestrationAgent.setCurrentDomain("Default")
    setSpecializedState('');
    setBaseState('Generic AI');
    onContextChange({
      baseState: 'Generic AI',
      specializedState: '',
      iQubeDetails: null
    });
  };

  return (
    <div className="agent-evolution-panel bg-gray-800 rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-semibold mb-4">Agent Evolution</h2>
      
      {/* Base State Section */}
      <div className="base-state-section mt-4 p-3 bg-gray-800 rounded">
        <h3 className="text-lg font-semibold mb-2">Base State</h3>
        <button 
          onClick={handleResetBaseState}
          className={`
            w-full py-2 rounded transition-all duration-300 ease-in-out
            ${!specializedState 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}
          `}
          disabled={!specializedState}
        >
          Generic AI
        </button>
      </div>

      {/* Specialized Domains Section */}
      <div className="specialized-domains-section mt-4">
        <h3 className="text-lg font-semibold mb-2">Specialized Domains</h3>
        <div className="grid grid-cols-2 gap-2">
          {agentDomains.map((domain) => (
            <button
              key={domain.name}
              onClick={() => handleDomainChange(domain.name as SpecializedDomain)}
              className={`
                p-3 rounded flex items-center justify-center space-x-2 transition-all duration-300 ease-in-out
                ${specializedState === domain.name
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-700 hover:bg-gray-600'}
              `}
            >
              <span>{domain.icon}</span>
              <span>{domain.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Status Display */}
      {specializedState && (
        <div className="status-display mt-4">
          <div className="bg-green-800 rounded p-3">
            <div className="flex items-center space-x-2">
              <span>🧠</span>
              <span>
                {specializedState} 
              </span>
            </div>
            <div className="text-sm text-gray-300 mt-2">
              Use chat interface to engage specialist agents.
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AgentEvolutionPanel;
