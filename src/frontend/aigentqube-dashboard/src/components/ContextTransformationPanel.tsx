import React, { useEffect, useState } from 'react';
import ChatInterface from './ChatInterface';
import { OrchestrationAgent } from '../services/OrchestrationAgent';
import { Box, Text } from '@chakra-ui/react';
import { SpecializedDomain, DOMAIN_METADATA } from '../types/domains';

interface ContextTransformationPanelProps {
  context?: any;
  onPromptInsert?: (prompt: string) => void;
  orchestrationAgent?: OrchestrationAgent;
}

interface DomainRecommendation {
  action: string;
  prompt: string;
}

const domainRecommendedActions: Record<string, DomainRecommendation[]> = {
  [SpecializedDomain.CRYPTO_ANALYST]: [
    {
      action: 'Analyze Blockchain Technology Potential',
      prompt: 'I\'m interested in blockchain technology beyond cryptocurrencies. Help me understand the latest blockchain innovations, their potential applications across different industries, and how they might transform existing business models.'
    },
    {
      action: 'Provide Cryptocurrency Ecosystem Insights',
      prompt: 'Give me a deep dive into the current cryptocurrency ecosystem. What are the emerging trends, technological innovations, and potential disruptive technologies in the blockchain space?'
    }
  ],
  [SpecializedDomain.AI_COACH]: [
    {
      action: 'Guide AI Strategy Development',
      prompt: 'I want to create an effective AI strategy. Help me design a comprehensive strategy for developing, deploying, and managing AI agents. What are the key considerations for creating intelligent, adaptive, and ethical AI systems?'
    },
    {
      action: 'Analyze Emerging AI Technologies',
      prompt: 'I want to stay ahead of technological innovations. Can you provide a comprehensive analysis of the latest emerging AI technologies, their potential impact, adoption strategies, and how they could give me a competitive advantage.'
    }
  ],
  'AigentQube': [
    {
      action: 'Explore AigentQube Features',
      prompt: 'Tell me about the key features and capabilities of AigentQube. How can I leverage its functionality for my blockchain and AI needs?'
    },
    {
      action: 'Get Started with AigentQube',
      prompt: 'I\'m new to AigentQube. Can you guide me through the initial setup and basic operations? What are the first steps I should take?'
    }
  ]
};

const defaultRecommendedActions: DomainRecommendation[] = [
  {
    action: 'Explore AigentQube',
    prompt: 'What is AigentQube and how can it help me with blockchain and AI integration?'
  },
  {
    action: 'Get Started',
    prompt: 'How do I get started with AigentQube? What are the basic features and capabilities?'
  }
];

const ContextTransformationPanel: React.FC<ContextTransformationPanelProps> = ({ 
  context,
  onPromptInsert,
  orchestrationAgent
}) => {
  const [recommendedActions, setRecommendedActions] = useState<DomainRecommendation[]>([]);
  const [recommendedPrompts, setRecommendedPrompts] = useState<any[]>([]);

  // Determine recommended actions based on specialized domain
  useEffect(() => {
    if (orchestrationAgent) {
      const actions = orchestrationAgent.getRecommendedActions();
      setRecommendedActions(actions);
    } else {
      if (!context?.specializedState) {
        setRecommendedActions(defaultRecommendedActions);
      } else {
        // Check if the specialized state exists in domainRecommendedActions
        const actions = domainRecommendedActions[context.specializedState];
        if (!actions) {
          console.warn(`No recommended actions found for domain: ${context.specializedState}`);
          setRecommendedActions(defaultRecommendedActions);
        } else {
          setRecommendedActions(actions);
        }
      }
    }
  }, [orchestrationAgent, context?.specializedState]);

  // Update recommendations when iQube data changes
  useEffect(() => {
    if (orchestrationAgent && context?.iQubeData) {
      orchestrationAgent.updateIQubeData(context.iQubeData).then(() => {
        const actions = orchestrationAgent.getRecommendedActions();
        setRecommendedActions(actions);
      });
    }
  }, [orchestrationAgent, context?.iQubeData, context?.specializedState]);

  useEffect(() => {
    if (orchestrationAgent) {
      const prompts = orchestrationAgent.getContextAwarePrompts(context?.specializedState || 'AigentQube');
      setRecommendedPrompts(prompts);
    }
  }, [orchestrationAgent, context?.specializedState]);

  const renderContextInsights = () => {
    if (!orchestrationAgent) {
      return (
        <div className="text-gray-500 italic">
          Waiting for orchestration agent to initialize...
        </div>
      );
    }

    const insights = orchestrationAgent.getContextInsights();
    if (!insights || insights.length === 0) {
      return (
        <div className="text-gray-500 italic">
          No context insights available. Connect an iQube to see insights.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-3 gap-4 mb-4">
        {insights.slice(0, 3).map((insight, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="text-sm font-medium text-gray-500 mb-1">
              {insight.label}
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {insight.value}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {insight.category}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const getDomainTitle = () => {
    if (!context?.specializedState) return 'Recommended';
    
    const metadata = DOMAIN_METADATA[context.specializedState as SpecializedDomain];
    return metadata ? `${metadata.name} Prompts` : 'Recommended Prompts';
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-xl font-semibold text-white mb-4">
        Context Transformation
      </h2>
      
      {/* Context Insights */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-300 mb-3">
          Current Context Insights
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {orchestrationAgent?.getContextInsights().slice(0, 3).map((insight, index) => (
            <div
              key={index}
              className="bg-gray-700 p-4 rounded-lg border border-gray-600"
            >
              <div className="text-sm font-medium text-gray-400 mb-1">
                {insight.label}
              </div>
              <div className="text-lg font-semibold text-white">
                {insight.value}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {insight.category}
              </div>
            </div>
          ))}
          {(!orchestrationAgent || orchestrationAgent.getContextInsights().length === 0) && (
            <div className="col-span-3">
              <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 text-center">
                <span className="text-gray-400">
                  No context insights available. Connect an iQube to see insights.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Interface */}
      <div className="mb-6">
        {orchestrationAgent ? (
          <ChatInterface 
            orchestrationAgent={orchestrationAgent}
            context={{
              specializedState: context?.specializedState || 'AigentQube',
              web3: context?.web3,
              account: context?.account,
              isSignedIn: context?.isSignedIn,
              iQubeData: context?.iQubeData
            }}
            onPromptInsert={onPromptInsert}
          />
        ) : (
          <Box 
            height="600px"
            bg="gray.700" 
            borderRadius="lg"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <div className="text-center">
              <Text mb={2}>
                {context?.error ? 'Initialization Error' : 'Initializing AI Assistant...'}
              </Text>
              {context?.error && (
                <Text color="red.500" fontSize="sm">
                  {context.error}
                </Text>
              )}
            </div>
          </Box>
        )}
      </div>

      {/* Recommended Actions */}
      <div>
        <h3 className="text-lg font-medium text-gray-300 mb-3">
          {getDomainTitle()} 
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {recommendedPrompts.slice(0, 2).map((prompt, index) => (
            <div
              key={index}
              className="bg-gray-700 p-4 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-600 transition-colors"
              onClick={() => onPromptInsert && onPromptInsert(prompt.prompt)}
            >
              <div className="text-sm font-medium text-white mb-2">
                {prompt.action}
              </div>
              <div className="text-sm text-gray-400">
                {prompt.prompt}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Actions */}
      {recommendedActions && recommendedActions.length > 0 && (
        <div className="recommended-actions mt-6">
          <h3 className="text-lg font-medium text-gray-300 mb-3">
            {getDomainTitle()}
            {context?.iQubeData && (
              <span className="text-sm text-gray-400 ml-2">
                (Personalized based on your iQube data)
              </span>
            )}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {recommendedActions.slice(0, 2).map((action, index) => (
              <div 
                key={index} 
                className="bg-gray-700 p-4 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-600 transition-colors"
                onClick={() => {
                  if (onPromptInsert) {
                    onPromptInsert(action.prompt);
                    const inputElement = document.querySelector('.chat-interface input');
                    if (inputElement) {
                      inputElement.scrollIntoView({ behavior: 'smooth' });
                      inputElement.focus();
                    }
                  }
                }}
              >
                <h4 className="font-semibold mb-2">{action.action}</h4>
                <p className="text-sm text-gray-400">
                  {action.prompt}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContextTransformationPanel;
