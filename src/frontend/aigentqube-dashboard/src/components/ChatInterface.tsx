import React, { useState, useRef, useEffect } from 'react';
import { Box, Text, Input, Button, VStack, Flex, useToast } from '@chakra-ui/react';
import { OrchestrationAgent } from '../services/OrchestrationAgent';
import { SpecializedDomain, DOMAIN_METADATA } from '../types/domains';

interface ChatInterfaceProps {
  context?: any;
  className?: string;
  orchestrationAgent: OrchestrationAgent;
}

interface Message {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  error?: boolean;
}

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
            throw new Error(`Initialization failed: ${initError instanceof Error ? initError.message : 'Unknown error'}`);
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
        const errorMessage = `API initialization failed: ${error.message}`;
        setError(errorMessage);
        console.error('API initialization error:', error);
        
        // Add error message to chat
        setMessages(prev => [...prev, {
          id: Date.now(),
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
        role: 'system',
        content: `Switching to ${domain} mode...`,
        timestamp: new Date()
      }]);
    } catch (error: any) {
      setError(`Failed to switch to ${domain}: ${error.message}`);
      console.error('Error changing domain:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !orchestrationAgent) {
      toast({
        title: 'Submission Error',
        description: !orchestrationAgent 
          ? 'OrchestrationAgent not available' 
          : 'Please enter a message',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

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
          throw new Error(`Initialization failed: ${initError instanceof Error ? initError.message : 'Unknown error'}`);
        }
      }

      // Perform query using Metis service
      const response = await orchestrationAgent.queryDomain(currentDomain, inputValue);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to get response');
      }

      // If the response is for Metis service in Crypto Analyst domain, use the new method
      if (currentDomain === 'Crypto Analyst') {
        const url = new URL('https://metisapi-8501e3beedcf.herokuapp.com/service');
        const params = { input: inputValue };
        url.search = new URLSearchParams(params).toString();

        try {
          const metisResponse = await fetch(url.toString(), {
            method: 'GET',
          });

          if (!metisResponse.ok) {
            throw new Error(`HTTP error! status: ${metisResponse.status}`);
          }

          const data = await metisResponse.json();

          // Ensure we have a valid response
          if (!data || !data.response) {
            throw new Error('No valid response received from Metis API');
          }

          // Update messages with Metis response
          setMessages(prev => [...prev, { 
            id: Date.now() + 1,
            role: 'assistant',
            content: data.response,
            timestamp: new Date()
          }]);
        } catch (metisError) {
          throw new Error(`Metis API Error: ${metisError instanceof Error ? metisError.message : 'Unknown error'}`);
        }
      } else {
        // For other domains, use existing response handling
        setMessages(prev => [...prev, { 
          id: Date.now() + 1,
          role: 'assistant',
          content: response.data.toString(),
          timestamp: new Date()
        }]);
      }
    } catch (error: any) {
      const errorMessage = `Error: ${error.message}`;
      
      // More detailed error handling
      if (error.message.includes('not initialized')) {
        setIsApiInitialized(false);
        toast({
          title: 'Service Unavailable',
          description: 'Please wait while services are reinitialized',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Chat Error',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }

      setError(errorMessage);
      console.error('Chat error:', error);
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'system',
        content: errorMessage,
        timestamp: new Date(),
        error: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptInsert = (prompt: string) => {
    setInputValue(prompt);
    const inputElement = document.querySelector('.chat-interface input') as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
    }
  };

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
        overflowY="auto"
        p={4}
        css={{
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            width: '10px',
            background: 'var(--chakra-colors-gray-900)',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'var(--chakra-colors-gray-700)',
            borderRadius: '24px',
          },
        }}
      >
        <VStack spacing={4} align="stretch">
          {messages.map((message, index) => (
            <Box 
              key={index}
              alignSelf={message.role === 'user' ? 'flex-end' : message.role === 'assistant' ? 'flex-start' : 'center'}
              maxWidth="80%"
            >
              <Box
                bg={message.role === 'user' 
                  ? 'blue.600' 
                  : message.role === 'assistant' 
                    ? 'gray.700' 
                    : 'gray.600'}
                color="white"
                px={4}
                py={2}
                borderRadius="lg"
                boxShadow="md"
              >
                <Text whiteSpace="pre-wrap">{message.content}</Text>
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </VStack>
      </Box>

      {error && (
        <Box 
          bg="red.600" 
          color="white" 
          p={2} 
          mx={4} 
          mb={2} 
          borderRadius="md"
        >
          {error}
        </Box>
      )}

      <Box 
        p={4} 
        bg="gray.700" 
        borderBottomRadius="lg"
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
