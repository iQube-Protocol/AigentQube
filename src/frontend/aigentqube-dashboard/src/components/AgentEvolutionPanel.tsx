import React, { useState } from 'react';

export interface AgentEvolutionPanelProps {
  context: any;
  onContextChange: (context: any) => void;
  selectedAgent?: string | null;
  onAgentSelect?: (agentId: string | null) => void;
}

const AgentEvolutionPanel: React.FC<AgentEvolutionPanelProps> = ({ 
  context, 
  onContextChange, 
  selectedAgent, 
  onAgentSelect 
}) => {
  const [baseState, setBaseState] = useState('Generic AI');
  const [specializedState, setSpecializedState] = useState('');

  const agentDomains = [
    { name: 'Financial Advisor', icon: '💰' },
    { name: 'Tech Consultant', icon: '💻' },
    { name: 'Healthcare Analyst', icon: '🏥' },
    { name: 'Legal Assistant', icon: '⚖️' }
  ];

  const handleDomainSelection = (domain: string) => {
    setSpecializedState(domain);
    onContextChange({
      baseState,
      specializedState: domain
    });
  };

  return (
    <div className="agent-evolution-panel bg-gray-800 rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-bold mb-4">Agent Evolution</h2>
      
      {selectedAgent ? (
        <div>
          <p>Selected Agent: {selectedAgent}</p>
          <button 
            onClick={() => onAgentSelect?.(null)}
            className="btn btn-secondary mt-2"
          >
            Deselect Agent
          </button>
        </div>
      ) : (
        <p>No agent selected. Choose an agent to evolve.</p>
      )}

      <div className="base-state">
        <h3 className="font-medium mb-2">Base State</h3>
        <div className="bg-gray-700 rounded p-3">
          <span className="text-gray-300">{baseState}</span>
        </div>
      </div>

      <div className="payload-addition">
        <h3 className="font-medium mb-2">Specialize Agent Domain</h3>
        <div className="grid grid-cols-2 gap-2">
          {agentDomains.map((domain) => (
            <button
              key={domain.name}
              onClick={() => handleDomainSelection(domain.name)}
              className={`
                flex items-center justify-center space-x-2 
                p-3 rounded transition duration-300
                ${specializedState === domain.name 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
              `}
            >
              <span>{domain.icon}</span>
              <span>{domain.name}</span>
            </button>
          ))}
        </div>
      </div>

      {specializedState && (
        <div className="specialized-state mt-4">
          <h3 className="font-medium mb-2">Current Specialization</h3>
          <div className="bg-green-800 rounded p-3 flex items-center space-x-2">
            <span>🧠</span>
            <span>{specializedState} Mode Activated</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentEvolutionPanel;
