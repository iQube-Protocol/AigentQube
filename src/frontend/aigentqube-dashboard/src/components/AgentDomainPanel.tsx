import React from 'react';

// Predefined Agent Domains
const AGENT_DOMAINS = {
  GENERIC: {
    name: 'Generic AI',
    description: 'Versatile and adaptable across multiple contexts',
    color: 'bg-gray-600',
    icon: '🌐'
  },
  FINANCIAL_ANALYST: {
    name: 'Financial Analyst',
    description: 'Specialized in financial market analysis and investment strategies',
    color: 'bg-green-700',
    icon: '📊'
  },
  TECH_INNOVATOR: {
    name: 'Tech Innovator',
    description: 'Focused on emerging technologies and innovation trends',
    color: 'bg-blue-700',
    icon: '💡'
  },
  STRATEGIC_CONSULTANT: {
    name: 'Strategic Consultant',
    description: 'Expert in business strategy and organizational optimization',
    color: 'bg-purple-700',
    icon: '🏢'
  },
  CREATIVE_DESIGNER: {
    name: 'Creative Designer',
    description: 'Specializing in creative problem-solving and design thinking',
    color: 'bg-pink-700',
    icon: '🎨'
  }
};

export interface AgentDomainPanelProps {
  selectedAgent?: string | null;
  currentDomain?: keyof typeof AGENT_DOMAINS;
  context?: any;
}

const AgentDomainPanel: React.FC<AgentDomainPanelProps> = ({ 
  selectedAgent, 
  currentDomain = 'GENERIC',
  context 
}) => {
  const domain = AGENT_DOMAINS[currentDomain];

  return (
    <div className="agent-domain-panel bg-gray-800 rounded-lg p-6 space-y-4">
      <div className="flex items-center space-x-4 mb-4">
        <span className="text-3xl">{domain.icon}</span>
        <div>
          <h2 className="text-xl font-bold">{domain.name}</h2>
          <p className="text-sm text-gray-400">{domain.description}</p>
        </div>
      </div>

      {selectedAgent ? (
        <div className={`${domain.color} rounded-lg p-4 bg-opacity-20`}>
          <h3 className="font-semibold mb-2">Agent Context</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Selected Agent', value: selectedAgent },
              { label: 'Domain Expertise', value: domain.name },
              { 
                label: 'Interaction Complexity', 
                value: context?.interactionComplexity || 'Moderate' 
              },
              { 
                label: 'Contextual Adaptability', 
                value: context?.adaptability || 'Advanced' 
              }
            ].map((item, index) => (
              <div 
                key={index} 
                className="bg-gray-700 rounded p-3"
              >
                <p className="text-xs text-gray-400">{item.label}</p>
                <p className="text-white font-medium">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 p-4 bg-gray-700 rounded">
          <p>Share an iQube to activate Agent Domain</p>
        </div>
      )}

      <div className="available-domains">
        <h3 className="font-semibold mb-2 text-gray-300">Available Domains</h3>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(AGENT_DOMAINS).map(([key, domain]) => (
            <div 
              key={key} 
              className={`${domain.color} rounded p-2 text-center opacity-50 hover:opacity-100 cursor-not-allowed`}
              title="Domain activation through iQube sharing"
            >
              <span className="text-xl">{domain.icon}</span>
              <p className="text-xs mt-1">{domain.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgentDomainPanel;
