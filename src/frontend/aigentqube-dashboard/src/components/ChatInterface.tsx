import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Text, 
  Input, 
  Button, 
  VStack, 
  Flex, 
  useToast, 
  Heading, 
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider
} from '@chakra-ui/react';
import { OrchestrationAgent } from '../services/OrchestrationAgent';
import { SpecializedDomain, DOMAIN_METADATA } from '../types/domains';
import { OrganizeImportsMode } from 'typescript';

interface ChatInterfaceProps {
  context?: any;
  className?: string;
  orchestrationAgent: OrchestrationAgent;
}

interface Message {
  id: number;
  uniqueId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  error?: boolean;
}

// Define the structure for a prompt recommendation
interface PromptRecommendation {
  heading: string;
  subHeading: string;
  prompt: string;
  placeholders?: Record<string, string>;
}

// Mapping of domain-specific prompt recommendations
const DOMAIN_PROMPT_RECOMMENDATIONS: Record<SpecializedDomain, PromptRecommendation[]> = {
  'AigentQube': [
    {
      heading: 'iQube Overview',
      subHeading: 'Performance Metrics',
      prompt: 'Provide a comprehensive overview of my iQube\'s current performance metrics and suggest optimization strategies.'
    },
    {
      heading: 'Integration Assistance',
      subHeading: 'Workflow Optimization',
      prompt: 'Guide me through integrating AigentQube features into my existing workflow for maximum efficiency.'
    },
    {
      heading: 'Strategic Insights',
      subHeading: 'Future Planning',
      prompt: 'Develop a comprehensive strategy for future growth and technological advancement.'
    }
  ],
  'Bitcoin Advisor': [
    {
      heading: 'Network Analysis',
      subHeading: 'Connectivity Insights',
      prompt: 'Analyze Bitcoin network performance with connection strength at {network}. What improvements are recommended?'
    },
    {
      heading: 'Consensus Participation',
      subHeading: 'Governance Strategy',
      prompt: 'With current consensus participation at {governance}, what strategies should be implemented to optimize network contribution?'
    },
    {
      heading: 'Market Trend Prediction',
      subHeading: 'Advanced Analysis',
      prompt: 'Conduct an in-depth market analysis of Bitcoin, identifying potential trends and investment opportunities.'
    }
  ],
  'Guardian Aigent': [
    {
      heading: 'Sovereignty Review',
      subHeading: 'Data Protection',
      prompt: 'Current data sovereignty score is {sovereignty}. Analyze potential vulnerabilities and recommend improvements.'
    },
    {
      heading: 'AI Safety Optimization',
      subHeading: 'Security Measures',
      prompt: 'With an AI safety score of {safety}, what additional safety measures should be implemented?'
    },
    {
      heading: 'Ethical AI Compliance',
      subHeading: 'Regulatory Alignment',
      prompt: 'Provide a comprehensive review of current AI ethical standards and recommend strategies for regulatory compliance.'
    }
  ],
  'Crypto Analyst': [
    {
      heading: 'Token Analysis',
      subHeading: 'DeFi Performance',
      prompt: 'Analyze the current state of major DeFi protocols, focusing on TVL, yields, and risk metrics.'
    },
    {
      heading: 'Cross-Chain Security',
      subHeading: 'Risk Mitigation',
      prompt: 'Evaluate the security status of major cross-chain bridges and recommend risk mitigation strategies.'
    },
    {
      heading: 'Portfolio Optimization',
      subHeading: 'Digital Asset Strategy',
      prompt: 'Develop a comprehensive crypto portfolio strategy considering current market conditions, risk tolerance, and emerging blockchain technologies.'
    }
  ],
  'Agent AI Coach': [
    {
      heading: 'Model Evaluation',
      subHeading: 'Performance Metrics',
      prompt: 'Evaluate the current AI model performance metrics and suggest optimization strategies.'
    },
    {
      heading: 'Training Data Quality',
      subHeading: 'Data Improvement',
      prompt: 'Analyze training data quality and recommend improvements for better model performance.'
    },
    {
      heading: 'Learning Techniques',
      subHeading: 'Advanced Development',
      prompt: 'Explore and recommend advanced machine learning techniques to enhance the current AI model\'s capabilities and learning efficiency.'
    }
  ]
};

// Prompt Recommendation Component
const PromptRecommendations: React.FC<{
  currentDomain: string;
  onRecommendationSelect: (prompt: string) => void;
}> = ({ currentDomain, onRecommendationSelect }) => {
  const [recommendations, setRecommendations] = useState<PromptRecommendation[]>(
    DOMAIN_PROMPT_RECOMMENDATIONS[currentDomain as SpecializedDomain] || []
  );

  // Reset recommendations when domain changes
  useEffect(() => {
    setRecommendations(
      DOMAIN_PROMPT_RECOMMENDATIONS[currentDomain as SpecializedDomain] || []
    );
  }, [currentDomain]);

  // Handle recommendation selection
  const handleRecommendationSelect = (rec: PromptRecommendation) => {
    // Insert the prompt
    onRecommendationSelect(rec.prompt);
    
    // Remove the selected recommendation
    setRecommendations(prev => prev.filter(r => r !== rec));
  };

  // Determine grid columns based on remaining recommendations
  const gridColumns = recommendations.length === 3 ? 3 : 
                      recommendations.length === 2 ? 2 : 
                      recommendations.length === 1 ? 1 : 0;

  return (
    <Flex 
      position="absolute" 
      bottom="50px"  // Position just above chat input
      left="0"
      right="0"
      justifyContent="center"
      alignItems="center"
      px={4}
      zIndex={10}  // Ensure recommendations are above messages
      pointerEvents="none"  // Allow clicking through to messages
    >
      <SimpleGrid 
        columns={gridColumns} 
        spacing={2} 
        width="110%"  // Increase width to 110%
        maxWidth="880px"  // Proportionally increase max width
        pointerEvents="auto"  // Re-enable pointer events for the grid itself
      >
        {recommendations.map((rec, index) => (
          <Card 
            key={`recommendation-${rec.heading}-${index}`}  // Ensure unique key
            variant="elevated" 
            cursor="pointer" 
            transition="all 0.2s"
            height="60%" 
            opacity={1}  // Full opacity
            bg="rgba(17, 24, 39, 0.9)"  // Slightly lighter and slightly transparent grey
            _hover={{ 
              transform: 'scale(1.02)', 
              boxShadow: 'md',
              bg: "rgba(17, 24, 39, 0.95)"  // Even slightly lighter on hover
            }}
            onClick={() => handleRecommendationSelect(rec)}
            color="white"
            borderRadius="md"
            pointerEvents="auto"  // Enable pointer events for individual cards
          >
            <CardHeader 
              pb={1} 
              height="40%" 
              display="flex"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
            >
              <Heading 
                size="xs" 
                textTransform="uppercase" 
                color="white"
                textAlign="center"
              >
                {rec.heading}
              </Heading>
            </CardHeader>
            <CardBody 
              pt={1} 
              height="60%" 
              display="flex"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
            >
              <Text 
                fontSize="xs" 
                color="gray.400"
                textAlign="center"
              >
                {rec.subHeading}
              </Text>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
    </Flex>
  );
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  context,
  className = '',
  orchestrationAgent
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDomain, setCurrentDomain] = useState<string>(orchestrationAgent?.getCurrentDomain() || 'AigentQube');
  const [isApiInitialized, setIsApiInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  // Helper function to check if an error should be suppressed
  const shouldSuppressError = (errorMessage: string): boolean => {
    const suppressPatterns = [
      /Critical services not fully initialized/i,
      /initialization failed/i,
      /Layer alignment validation failed/i,
      /Layer alignment validation is not supported/i,
      /Layer validation error/i,
      /LAYER_VALIDATION_ERROR/i,
      /Failed to get domain context/i,
      /Domain manager not initialized/i,
      /Service layer initialization failed/i,
      /Context layer initialization failed/i,
      /State layer initialization failed/i,
      /NLP processor validation failed/i,
      /Metis service health check failed/i,
      /Failed to register services/i
    ];
    
    return suppressPatterns.some(pattern => pattern.test(errorMessage));
  };

  // Add initialization effect
  useEffect(() => {
    const initializeApi = async () => {
      if (!orchestrationAgent) {
        console.warn('No OrchestrationAgent provided');
        setError('OrchestrationAgent not initialized');
        return;
      }
      
      setIsLoading(true);
      try {
        // Check if OrchestrationAgent is initialized
        console.log('Checking OrchestrationAgent initialization status');
        const isInitialized = orchestrationAgent.isInitialized();
        console.log('OrchestrationAgent initialization status:', isInitialized);

        // If not initialized, attempt to initialize
        if (!isInitialized) {
          console.log('Attempting to initialize OrchestrationAgent');
          try {
            await orchestrationAgent.initialize();
            console.log('OrchestrationAgent initialized successfully');
          } catch (initError) {
            console.error('Failed to initialize OrchestrationAgent:', initError);
            const errorMessage = `Initialization failed: ${initError instanceof Error ? initError.message : 'Unknown error'}`;
            if (!shouldSuppressError(errorMessage)) {
              throw new Error(errorMessage);
            }
          }
        }

        const apiKey = process.env.REACT_APP_METIS_API_KEY;
        if (!apiKey) {
          throw new Error('Metis API key not found in environment variables');
        }

        // Only initialize if it's a specialized domain
        if (currentDomain !== 'AigentQube' && currentDomain !== 'Generic AI') {
          // Initialize Metis API for the current domain
          console.log(`Initializing specialized domain: ${currentDomain}`);
          await orchestrationAgent.initializeSpecializedDomain(currentDomain as SpecializedDomain, {
            apiKey,
            instructions: DOMAIN_METADATA[currentDomain as SpecializedDomain]?.defaultInstructions || ''
          });
          
          setIsApiInitialized(true);
          console.log(`API initialized for domain: ${currentDomain}`);
          
          // Add system message for successful initialization
          setMessages(prev => [...prev, {
            id: Date.now(),
            uniqueId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            role: 'system',
            content: `${currentDomain} services initialized and ready.`,
            timestamp: new Date()
          }]);
        } else {
          // For generic domains, just mark as initialized
          setIsApiInitialized(true);
          console.log('Using generic domain, no special initialization needed');
        }
      } catch (error: any) {
        const errorMessage = error.message;
        setError(errorMessage);
        console.error('API initialization error:', error);
        
        // Add error message to chat only if it's not suppressed
        if (!shouldSuppressError(errorMessage)) {
          setMessages(prev => [...prev, {
            id: Date.now(),
            uniqueId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            role: 'system',
            content: errorMessage,
            timestamp: new Date(),
            error: true
          }]);

          // Show toast notification
          toast({
            title: 'Initialization Error',
            description: errorMessage,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    // Retry mechanism with exponential backoff
    const initializeWithRetry = async (retries = 3, delay = 1000) => {
      try {
        await initializeApi();
      } catch (error) {
        if (retries > 0) {
          console.log(`Retrying initialization. Attempts left: ${retries}`);
          await new Promise(resolve => setTimeout(resolve, delay));
          await initializeWithRetry(retries - 1, delay * 2);
        } else {
          throw error;
        }
      }
    };

    initializeWithRetry();
  }, [currentDomain, orchestrationAgent, toast]);

  useEffect(() => {
    if (context?.specializedState && context.specializedState !== currentDomain) {
      handleDomainChange(context.specializedState);
    }
  }, [context?.specializedState]);

  const handleDomainChange = async (domain: string) => {
    if (!orchestrationAgent) return;

    setError(null);
    setIsLoading(true);
    setIsApiInitialized(false);

    try {
      setCurrentDomain(domain);
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        uniqueId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: 'system',
        content: `Switching to ${domain} mode...`,
        timestamp: new Date()
      }]);
    } catch (error: any) {
      setError(`Failed to switch to ${domain}: ${error.message}`);
      console.error('Error changing domain:', error);
    }
  };

  const createMessage = (content: string, role: 'user' | 'assistant' | 'system', error?: boolean): Message => {
    const timestamp = Date.now();
    const uniqueId = `${role}-${timestamp}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: timestamp,
      uniqueId,
      role,
      content,
      timestamp: new Date(),
      error: error || false
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !orchestrationAgent) {
      if (!orchestrationAgent) {
        console.warn('OrchestrationAgent not available');
      }
      return;
    }

    console.log('Submitted message:', inputValue); // Log the submitted message
    console.log("Orchestration agent initalized?", orchestrationAgent.isInitialized())
    console.log("Current Domain", orchestrationAgent.getCurrentDomain())
    
    const userMessage = createMessage(inputValue, 'user');
    
    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Check and attempt to initialize if not ready
      if (!isApiInitialized) {
        try {
          // Ensure OrchestrationAgent is initialized
          if (!orchestrationAgent.isInitialized()) {
            console.log('Attempting to initialize OrchestrationAgent before submission');
            await orchestrationAgent.initialize();
          }

          // Re-check API initialization
          const apiKey = process.env.REACT_APP_METIS_API_KEY;
          if (!apiKey) {
            throw new Error('Metis API key not found in environment variables');
          }

          // Initialize specialized domain if needed
          if (currentDomain !== 'AigentQube' && currentDomain !== 'Generic AI') {
            await orchestrationAgent.initializeSpecializedDomain(currentDomain as SpecializedDomain, {
              apiKey,
              instructions: DOMAIN_METADATA[currentDomain as SpecializedDomain]?.defaultInstructions || ''
            });
          }
        } catch (initError) {
          const errorMessage = `Initialization failed: ${initError instanceof Error ? initError.message : 'Unknown error'}`;
          if (!shouldSuppressError(errorMessage)) {
            throw new Error(errorMessage);
          }
          console.warn('Suppressed initialization error:', errorMessage);
        }
      }

      // Perform query using Metis service
      const response = await orchestrationAgent.queryDomain(inputValue);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to get response');
      }

      // Add assistant's response
      setMessages(prev => [...prev, createMessage(response.data.toString(), 'assistant')]);
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Chat error:', error);
      
      // Create error message
      const errorSystemMessage = createMessage(errorMessage, 'system', true);
      
      // Only add error message and show toast if it's not suppressed
      if (!shouldSuppressError(errorMessage)) {
        setMessages(prev => [...prev, errorSystemMessage]);
        
        toast({
          title: 'Chat Error',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Method to handle inserting recommended prompts
  const handlePromptInsert = (recommendedPrompt: string) => {
    // Set the input value to the recommended prompt
    setInputValue(recommendedPrompt);
    
    // Optional: Automatically trigger message sending
    // Uncomment the next line if you want to auto-send the recommended prompt
    // handleSubmit();
  };

  useEffect(() => {
    const keyCount: {[key: string]: number} = {};
    messages.forEach(message => {
      const key = `msg-${message.uniqueId}`;
      keyCount[key] = (keyCount[key] || 0) + 1;
      
      if (keyCount[key] > 1) {
        console.error('Duplicate key detected:', key, message);
      }
    });
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Box 
      className="chat-interface"
      bg="gray.800"
      height="600px"
      display="flex"
      flexDirection="column"
      position="relative"
    >
      <Flex 
        justify="space-between" 
        align="center" 
        bg="gray.700" 
        p={3} 
        borderTopRadius="lg"
      >
        <Text fontSize="lg" fontWeight="bold">{currentDomain}</Text>
        {isLoading && <Text fontSize="sm" color="gray.400">Processing...</Text>}
      </Flex>

      <Box 
        flex="1" 
        overflowY="auto"  // Enable vertical scrolling
        pb="100px"  // Add padding at the bottom to ensure last message is visible
        css={{
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '4px',
          },
        }}
      >
        <VStack 
          spacing={4} 
          align="stretch" 
          p={4}
        >
          {messages.map((message) => (
            <Box 
              key={`msg-${message.uniqueId}`}  
              alignSelf={
                message.role === 'user' ? 'flex-end' : 
                message.role === 'assistant' ? 'flex-start' : 
                'center'
              }
              maxWidth="80%"
            >
              <Box
                bg={
                  message.role === 'user' ? 'blue.600' : 
                  message.role === 'assistant' ? 'gray.700' : 
                  message.error ? 'red.600' : 'gray.600'
                }
                color="white"
                px={4}
                py={2}
                borderRadius="lg"
                boxShadow="md"
                position="relative"
              >
                <Text>{message.content}</Text>
                {message.error && (
                  <Box 
                    position="absolute" 
                    top="-8px" 
                    right="-8px"
                    bg="red.700"
                    color="white"
                    borderRadius="full"
                    p={1}
                    fontSize="xs"
                  >
                    Error
                  </Box>
                )}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </VStack>
      </Box>

      {error && (
        <Box color="red.500" p={4}>
          {error}
        </Box>
      )}

      <PromptRecommendations 
        currentDomain={currentDomain} 
        onRecommendationSelect={handlePromptInsert} 
      />

      <Box 
        p={4} 
        bg="gray.700"
      >
        <form onSubmit={handleSubmit}>
          <Flex gap={2}>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              bg="gray.800"
              color="white"
              _placeholder={{ color: 'gray.400' }}
              disabled={isLoading}
              borderColor="gray.600"
              _hover={{ borderColor: 'gray.500' }}
              _focus={{ borderColor: 'blue.500', boxShadow: 'none' }}
            />
            <Button
              type="submit"
              colorScheme="blue"
              isDisabled={isLoading || !inputValue.trim()}
              px={8}
              _hover={{ bg: 'blue.500' }}
            >
              Send
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
};

export default ChatInterface;
