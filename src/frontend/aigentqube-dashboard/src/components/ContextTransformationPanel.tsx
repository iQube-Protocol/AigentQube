import React from 'react';
import ChatInterface from './ChatInterface';

interface ContextTransformationPanelProps {
  context: any;
  onPromptInsert?: (prompt: string) => void;
}

interface DomainRecommendation {
  action: string;
  prompt: string;
}

const domainRecommendedActions: Record<string, DomainRecommendation[]> = {
  'Bitcoin Advisor': [
    {
      action: 'Analyze Cryptocurrency Market Trends',
      prompt: 'I want to understand the current cryptocurrency landscape. Can you provide a comprehensive analysis of recent market trends, emerging cryptocurrencies, and potential investment opportunities? What insights can you share about the crypto market?'
    },
    {
      action: 'Develop Personalized Investment Strategies',
      prompt: 'I\'m looking to invest in cryptocurrencies but need guidance. Can you help me develop a balanced and informed investment strategy? Consider my risk tolerance, financial goals, and the volatile nature of the crypto market.'
    }
  ],
  'Crypto Analyst': [
    {
      action: 'Analyze Blockchain Technology Potential',
      prompt: 'I\'m interested in blockchain technology beyond cryptocurrencies. Help me understand the latest blockchain innovations, their potential applications across different industries, and how they might transform existing business models.'
    },
    {
      action: 'Provide Cryptocurrency Ecosystem Insights',
      prompt: 'Give me a deep dive into the current cryptocurrency ecosystem. What are the emerging trends, technological innovations, and potential disruptive technologies in the blockchain space?'
    }
  ],
  'Guardian Aigent': [
    {
      action: 'Assess Cybersecurity Risks',
      prompt: 'I\'m worried about potential security risks. Can you conduct a thorough cybersecurity vulnerability assessment? Help me identify potential threats, recommend mitigation strategies, and improve our overall security posture.'
    },
    {
      action: 'Protect Data Sovereignty',
      prompt: 'I want to ensure my data is secure. Can you help me develop a comprehensive data protection strategy, including data encryption, access controls, and incident response planning?'
    }
  ],
  'Agent AI Coach': [
    {
      action: 'Guide AI Strategy Development',
      prompt: 'I want to create an effective AI strategy. Help me design a comprehensive strategy for developing, deploying, and managing AI agents. What are the key considerations for creating intelligent, adaptive, and ethical AI systems?'
    },
    {
      action: 'Analyze Emerging AI Technologies',
      prompt: 'I want to stay ahead of technological innovations. Can you provide a comprehensive analysis of the latest emerging AI technologies, their potential impact, adoption strategies, and how they could give me a competitive advantage.'
    }
  ],
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

      {/* Integrated ChatInterface */}
      <div className="aigent-chat-section mt-4 w-full">
        <ChatInterface context={context} className="w-full" />
      </div>

      <div className="recommended-actions mt-4">
        <h3 className="font-medium mb-2">Recommended Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendedActions.map((action, index) => (
            <div 
              key={index} 
              className="bg-gray-700 rounded p-4 cursor-pointer hover:bg-gray-600 transition-colors"
              onClick={() => onPromptInsert && onPromptInsert(action.prompt)}
            >
              <h4 className="font-semibold mb-2">{action.action}</h4>
              <p className="text-sm text-gray-300 line-clamp-2">{action.prompt}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContextTransformationPanel;
