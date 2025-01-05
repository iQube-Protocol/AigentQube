import React from 'react';

// Predefined Specialized Agent Domains
const AGENT_DOMAINS = {
  FINANCIAL_ADVISOR: {
    name: 'Financial Advisor',
    description: 'Specialized in investment strategies, financial planning, and market analysis',
    icon: '💼',
    insights: [
      { label: 'Investment Strategy', value: 'Personalized Portfolio Optimization' },
      { label: 'Risk Assessment', value: 'Advanced Multi-Factor Analysis' },
      { label: 'Market Trend', value: 'Real-time Predictive Modeling' }
    ]
  },
  TECH_INNOVATION_CONSULTANT: {
    name: 'Tech Innovation Consultant',
    description: 'Focused on emerging technologies, startup ecosystems, and innovation strategies',
    icon: '🚀',
    insights: [
      { label: 'Tech Trend', value: 'Blockchain & AI Convergence' },
      { label: 'Innovation Potential', value: 'High Disruptive Capacity' },
      { label: 'Startup Ecosystem', value: 'Global Emerging Markets' }
    ]
  },
  CREATIVE_CONTENT_STRATEGIST: {
    name: 'Creative Content Strategist',
    description: 'Specializing in content creation, audience engagement, and narrative design',
    icon: '🎨',
    insights: [
      { label: 'Content Type', value: 'Adaptive Multimedia' },
      { label: 'Audience Engagement', value: 'Personalized Storytelling' },
      { label: 'Creative Approach', value: 'Data-Driven Narrative Design' }
    ]
  }
};

export interface AgentContextPanelProps {
  selectedAgent?: string | null;
  context?: {
    domain?: keyof typeof AGENT_DOMAINS;
    specialization?: string;
  };
}

const AgentContextPanel: React.FC<AgentContextPanelProps> = ({ 
  selectedAgent, 
  context 
}) => {
  // Determine the current agent domain
  const currentDomain = context?.domain 
    ? AGENT_DOMAINS[context.domain] 
    : {
        name: 'Generic AI',
        description: 'Versatile and adaptable across multiple domains',
        icon: '🧠',
        insights: [
          { label: 'Adaptability', value: 'High Generalization' },
          { label: 'Learning Capacity', value: 'Continuous Improvement' },
          { label: 'Domain Flexibility', value: 'Multi-Domain Competence' }
        ]
      };

  return (
    <div className="agent-context-panel bg-gray-800 rounded-lg p-6 space-y-6">
      <div className="agent-domain-header flex items-center space-x-4 mb-4">
        <span className="text-4xl">{currentDomain.icon}</span>
        <div>
          <h2 className="text-xl font-bold text-white">{currentDomain.name}</h2>
          <p className="text-sm text-gray-400">{currentDomain.description}</p>
        </div>
      </div>

      {selectedAgent && (
        <div className="selected-agent-info bg-gray-700 rounded-lg p-4 mb-4">
          <h3 className="text-md font-semibold text-white mb-2">Selected Agent</h3>
          <p className="text-gray-300">{selectedAgent}</p>
        </div>
      )}

      <div className="agent-insights grid grid-cols-3 gap-4">
        {currentDomain.insights.map((insight, index) => (
          <div 
            key={index} 
            className="insight-card bg-gray-700 rounded-lg p-3 hover:bg-gray-600 transition-colors"
          >
            <p className="text-sm text-gray-400 mb-1">{insight.label}</p>
            <p className="text-white font-semibold">{insight.value}</p>
          </div>
        ))}
      </div>

      {context?.specialization && (
        <div className="agent-specialization mt-4 bg-green-900/20 rounded-lg p-4">
          <h3 className="text-md font-semibold text-green-300 mb-2">Current Specialization</h3>
          <p className="text-green-100">{context.specialization}</p>
        </div>
      )}
    </div>
  );
};

export default AgentContextPanel;
