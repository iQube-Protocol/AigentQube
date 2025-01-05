import React from 'react';

interface ContextTransformationPanelProps {
  context: any;
  onPromptInsert?: (prompt: string) => void;
}

interface DomainRecommendation {
  action: string;
  prompt: string;
}

const domainRecommendedActions: Record<string, DomainRecommendation[]> = {
  'Financial Advisor': [
    {
      action: 'Help Me Optimize My Investment Portfolio',
      prompt: 'I want to improve my investment strategy. Can you help me analyze my current portfolio, identify potential areas for optimization, and suggest ways to balance risk and returns based on my financial goals and risk tolerance?'
    },
    {
      action: 'Assess My Investment Risk',
      prompt: 'I\'m concerned about the risk in my current investment approach. Could you perform a comprehensive risk assessment, help me understand my exposure, and provide strategies to mitigate potential financial vulnerabilities?'
    },
    {
      action: 'Plan My Retirement Savings',
      prompt: 'I want to secure my financial future. Help me develop a detailed retirement savings plan that considers my current age, income, expected retirement age, and the lifestyle I want to maintain. What steps should I take to ensure financial stability?'
    },
    {
      action: 'Optimize My Tax Strategy',
      prompt: 'I\'m looking to minimize my tax burden and maximize my financial efficiency. Can you review my current financial situation and suggest tax optimization strategies, including investment approaches, retirement account contributions, and potential deductions?'
    },
    {
      action: 'Diversify My Investments',
      prompt: 'I want to reduce my investment risk and potentially increase returns. Help me explore diversification strategies across different asset classes, sectors, and geographic regions. What balanced approach would you recommend for my financial profile?'
    }
  ],
  'Tech Consultant': [
    {
      action: 'Explore Emerging Tech Trends',
      prompt: 'I want to stay ahead of technological innovations. Can you provide a comprehensive analysis of the latest emerging technology trends in my industry? Help me understand their potential impact, adoption strategies, and how they could give me a competitive advantage.'
    },
    {
      action: 'Assess Digital Transformation',
      prompt: 'My organization needs to modernize. Can you perform a detailed digital transformation assessment? Help me identify current technological gaps, recommend strategies for modernization, and outline a step-by-step implementation plan.'
    },
    {
      action: 'Plan Cloud Migration',
      prompt: 'I\'m considering moving to the cloud. Help me develop a comprehensive cloud migration strategy tailored to my organization\'s infrastructure and business objectives. What are the key considerations, potential challenges, and expected benefits?'
    },
    {
      action: 'Evaluate Cybersecurity',
      prompt: 'I\'m worried about potential security risks. Can you conduct a thorough cybersecurity vulnerability assessment? Help me identify potential threats, recommend mitigation strategies, and improve our overall security posture.'
    },
    {
      action: 'Create AI Integration Roadmap',
      prompt: 'I want to leverage AI in my organization. Help me create a strategic roadmap for AI integration. What are the most promising use cases, potential implementation challenges, required resources, and expected return on investment?'
    }
  ],
  'Crypto Analyst': [
    {
      action: 'Analyze Crypto Market Trends',
      prompt: 'I want to understand the current cryptocurrency landscape. Can you provide a comprehensive analysis of recent market trends, emerging cryptocurrencies, and potential investment opportunities? What insights can you share about the crypto market?'
    },
    {
      action: 'Assess Blockchain Innovations',
      prompt: 'I\'m interested in blockchain technology beyond cryptocurrencies. Help me understand the latest blockchain innovations, their potential applications across different industries, and how they might transform existing business models.'
    },
    {
      action: 'Develop Crypto Investment Strategy',
      prompt: 'I\'m looking to invest in cryptocurrencies but need guidance. Can you help me develop a balanced and informed investment strategy? Consider my risk tolerance, financial goals, and the volatile nature of the crypto market.'
    },
    {
      action: 'Evaluate DeFi Opportunities',
      prompt: 'I want to explore Decentralized Finance (DeFi). Can you help me understand the current DeFi landscape, potential risks and rewards, and how I might strategically engage with decentralized financial platforms?'
    },
    {
      action: 'Understand Crypto Regulations',
      prompt: 'I need clarity on cryptocurrency regulations. Can you help me navigate the complex regulatory environment for cryptocurrencies? What are the current legal considerations, potential future changes, and how might they impact crypto investments?'
    }
  ],
  'Agentic AI Advisor': [
    {
      action: 'Design AI Agent Workflow',
      prompt: 'I want to create an effective AI agent workflow. Help me design a comprehensive strategy for developing, deploying, and managing AI agents. What are the key considerations for creating intelligent, adaptive, and ethical AI systems?'
    },
    {
      action: 'Explore AI Interaction Protocols',
      prompt: 'I\'m interested in improving AI-human interactions. Can you help me develop robust interaction protocols that ensure clear communication, maintain user trust, and create meaningful exchanges between humans and AI agents?'
    },
    {
      action: 'Assess AI Ethical Frameworks',
      prompt: 'I want to ensure my AI development is ethical and responsible. Help me develop a comprehensive ethical framework for AI agents. What are the key principles, potential pitfalls, and strategies for maintaining ethical AI behavior?'
    },
    {
      action: 'Optimize AI Learning Strategies',
      prompt: 'I want to improve the learning capabilities of my AI agents. Can you help me develop advanced learning strategies that enhance adaptability, reduce bias, and enable more nuanced and contextual understanding?'
    },
    {
      action: 'Plan Multi-Agent Collaboration',
      prompt: 'I\'m interested in creating collaborative AI systems. Help me design strategies for multi-agent collaboration, including communication protocols, conflict resolution mechanisms, and ways to ensure coherent and effective collective intelligence.'
    }
  ]
};

const defaultRecommendedActions: DomainRecommendation[] = [
  {
    action: 'Startup Investment Strategy',
    prompt: 'Provide a comprehensive analysis of investment strategies for early-stage startups. Include risk assessment, funding options, and potential growth opportunities.'
  },
  {
    action: 'Tax Optimization for Professionals',
    prompt: 'Develop a personalized tax optimization strategy for high-income professionals. Identify potential deductions, tax-efficient investment strategies, and retirement planning considerations.'
  },
  {
    action: 'Blockchain Investment Opportunities',
    prompt: 'Analyze current blockchain investment opportunities. Provide insights into emerging blockchain technologies, potential investment vehicles, and risk assessment for blockchain-related investments.'
  }
];

const ContextTransformationPanel: React.FC<ContextTransformationPanelProps> = ({ 
  context, 
  onPromptInsert 
}) => {
  const defaultInsights = [
    { label: 'Profession', value: 'Not Detected' },
    { label: 'Income Bracket', value: 'Not Available' },
    { label: 'Investment Interests', value: 'Pending' }
  ];

  const insights = context ? [
    { label: 'Profession', value: 'Software Engineer' },
    { label: 'Income Bracket', value: '$120,000/year' },
    { label: 'Investment Interests', value: 'Tech Startups' }
  ] : defaultInsights;

  // Determine recommended actions based on specialized domain
  const recommendedActions = context && context.specializedState 
    ? domainRecommendedActions[context.specializedState as keyof typeof domainRecommendedActions] 
    : defaultRecommendedActions;

  return (
    <div className="context-transformation-panel bg-gray-800 rounded-lg p-6 mb-4">
      <h2 className="text-xl font-semibold mb-4">Context Transformation</h2>
      
      <div className="payload-insights">
        <h3 className="font-medium mb-2">Decrypted Payload Insights</h3>
        <div className="grid grid-cols-3 gap-4">
          {insights.map((insight, index) => (
            <div 
              key={index} 
              className="bg-gray-700 rounded p-4 flex flex-col"
            >
              <span className="text-gray-400 text-sm mb-1">
                {insight.label}
              </span>
              <span className="font-semibold">
                {insight.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {context && context.specializedState && (
        <div className="agent-adaptation mt-6">
          <h3 className="font-medium mb-2">Agent Adaptation</h3>
          <div className="bg-green-900 rounded p-4 space-y-2">
            <div className="flex items-center space-x-2">
              <span>🧠</span>
              <span>Switching to {context.specializedState}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>💼</span>
              <span>Generating Personalized Strategy</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>📊</span>
              <span>Analyzing Relevant Market Trends</span>
            </div>
          </div>
        </div>
      )}

      <div className="recommended-actions mt-6">
        <h3 className="font-medium mb-2">
          Recommended Actions 
          {context && context.specializedState && ` for ${context.specializedState}`}
        </h3>
        <ul className="list-disc list-inside space-y-2 bg-gray-700 rounded p-4">
          {recommendedActions.map((recommendation, index) => (
            <li 
              key={index} 
              className="flex justify-between items-center"
            >
              {recommendation.action}
              {onPromptInsert && (
                <button 
                  onClick={() => onPromptInsert(recommendation.prompt)}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                >
                  Insert Prompt
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ContextTransformationPanel;
