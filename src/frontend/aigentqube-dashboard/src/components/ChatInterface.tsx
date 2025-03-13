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
} from '@chakra-ui/react';
import { OrchestrationAgent } from '../services/OrchestrationAgent';
import { SpecializedDomain, DOMAIN_METADATA } from '../types/domains';
import { VoiceService } from '../services/VoiceService';
import VoiceRecorder from './VoiceRecorder';
import AudioPlayer from './AudioPlayer';
import AudioWaveform from './AudioWaveform';
import LocalTTSToggle from './LocalTTSToggle';

interface ChatInterfaceProps {
  context?: any;
  className?: string;
  orchestrationAgent: OrchestrationAgent;
}

export interface AudioChunk {
  id: string;        // Unique identifier for the chunk
  text: string;      // The text content of this chunk
  audioUrl: string | null;  // URL to the audio file (null if not generated yet)
  isLoading: boolean;  // Whether this chunk is still being processed
  error: string | null;  // Error message if processing failed
  index: number;     // Position in the sequence of chunks
}

interface Message {
  id: number;
  uniqueId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  error?: boolean;
  audioUrl?: string;
  isAudioLoading?: boolean;
  audioChunks?: AudioChunk[]
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
      subHeading: 'iQube Utilization',
      prompt: 'Give me insights from my iQubes and suggestions on how I might use them.'
    },
    {
      heading: 'Integration Assistance',
      subHeading: 'Workflow Optimization',
      prompt: 'Guide me through how I might integrate Aigent Z into my existing workflow for maximum efficiency.'
    },
    {
      heading: 'Strategic Insights',
      subHeading: 'Future Planning',
      prompt: 'How might I use Aigent Z and iQubes to enhance my understanding and use of agentic AI?.'
    }
  ],
  'Bitcoin Advisor': [
    {
      heading: 'Network Analysis',
      subHeading: 'Connectivity Insights',
      prompt: 'Propose a personalized strategy for growing my Bitcoin portfolio based on bitcoin technology advancements and my current portfolio.'
    },
    {
      heading: 'Consensus Participation',
      subHeading: 'Governance Strategy',
      prompt: 'Tell me about Bitcoin Layer 2s.  What are they and what are notable innovations in this space?'
    },
    {
      heading: 'Market Trend Prediction',
      subHeading: 'Advanced Analysis',
      prompt: 'Conduct an in-depth market analysis of Bitcoin, identifying potential trends and investment opportunities.'
    }
  ],
  'Guardian Aigent': [
    {
      heading: 'Risk Review',
      subHeading: 'Data Protection',
      prompt: 'Analyze the current value of my portfolio, focusing on TVL, yields, and risk.'
    },
    {
      heading: 'AI Safety Optimization',
      subHeading: 'Security Measures',
      prompt: 'Have any of my wallets interacted with wallets with suspicious transactions and if so how might I mitigate any risk?'
    },
    {
      heading: 'Ethical AI Investment',
      subHeading: 'Regulatory Alignment',
      prompt: 'Propose an ethical investment strategy for my portfolio based on my interests, risk tolerance, current market conditions, and emerging blockchain technologies.'
    }
  ],
  'Crypto Analyst': [
    {
      heading: 'Nebula Introduction',
      subHeading: 'Service Inquiry',
      prompt: 'Tell me about all of the services avaliable to Nebula. What kind of operations are possible with this API and what kind of information can you tell me about blockchain.'
    },
    {
      heading: 'Token Analysis',
      subHeading: 'Emrging Regulation',
      prompt: 'Analyze the maturity of crypto regulation and the strength of the Crypto market in my local region. What changes are on the horizon?'
    },
    {
      heading: 'Portfolio Optimization',
      subHeading: 'Digital Asset Strategy',
      prompt: 'Show me how to create a Smart Contracts.'
    }
  ],
  'Agent AI Coach': [
    {
      heading: 'Model Evaluation',
      subHeading: 'Performance Metrics',
      prompt: 'What is crypto-agentic AI and how does it differ from agentic AI?.'
    },
    {
      heading: 'Training Data Quality',
      subHeading: 'Data Improvement',
      prompt: 'Evaluate the current state of the agentic AI market and what strategies are being deployed.'
    },
    {
      heading: 'Learning Techniques',
      subHeading: 'Advanced Development',
      prompt: 'How might I go about developing my own AI agent?.'
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
  const voiceApiKey = process.env.REACT_APP_CHIRP_TTS_API_KEY
  const [voiceService, setVoiceService] = useState<VoiceService | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [useLocalTTS, setUseLocalTTS] = useState<boolean>(false);
  const [isLocalTTSReady, setIsLocalTTSReady] = useState<boolean>(false);
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

  useEffect(() => {
    if (voiceApiKey) {
      const newVoiceService = new VoiceService({
        apiKey: voiceApiKey,
        useLocalTTS: useLocalTTS,
        modelPath: '/', // Adjust path to where your model files are stored
        onReadyStateChange: (isReady) => setIsLocalTTSReady(isReady)
      });
      
      setVoiceService(newVoiceService);
      
      // Cleanup function
      return () => {
        // Revoke any object URLs that might be in messages
        messages.forEach(message => {
          if (message.audioChunks) {
            message.audioChunks.forEach(chunk => {
              if (chunk.audioUrl) {
                URL.revokeObjectURL(chunk.audioUrl);
              }
            });
          }
        });
      };
    }
  }, [voiceApiKey]);

// Handle transcription from voice input
const handleTranscription = (text: string) => {
  setInputValue(text);
};

  // Init orchestration agent
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
            // For generic domains, initialize Venice API
            const veniceApiKey = process.env.REACT_APP_VENICE_API_KEY;
            if (!veniceApiKey) {
            throw new Error('Venice API key not found in environment variables');
            }

            

            setIsApiInitialized(true);
            console.log('Venice API initialized for generic domain');
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
      
      // setMessages(prev => [...prev, {
      //   id: Date.now(),
      //   uniqueId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      //   role: 'system',
      //   content: `Starting ${domain} mode...`,
      //   timestamp: new Date()
      // }]);
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

  const handleSubmit = async () => {
    if (!inputValue.trim() || !orchestrationAgent) {
      if (!orchestrationAgent) {
        console.warn('OrchestrationAgent not available');
      }
      return;
    }
  
    console.log('Submitted message:', inputValue);
    console.log("Orchestration agent initialized?", orchestrationAgent.isInitialized())
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
  
      // Create assistant's response message
      const assistantMessage = createMessage(response.data.toString(), 'assistant');
      
      // Initialize audio chunks array
      assistantMessage.audioChunks = [];
      assistantMessage.isAudioLoading = true;
      
      // Add the message immediately with loading state for audio
      setMessages(prev => [...prev, assistantMessage]);
      
      // Generate speech in the background using the streaming approach
      if (voiceService) {
        try {
          // Use streamAudio to process the text in chunks
          voiceService.streamAudio(
            response.data.toString(),
            (chunk, isComplete) => {
              // Update the message with the new audio chunk
              setMessages(prev => {
                // Find the assistant message to update
                const messageIndex = prev.findIndex(msg => msg.uniqueId === assistantMessage.uniqueId);
                
                if (messageIndex >= 0) {
                  // Create a copy of the messages array
                  const updatedMessages = [...prev];
                  const message = {...updatedMessages[messageIndex]};
                  
                  // Initialize audioChunks if not present
                  const currentChunks = message.audioChunks || [];
                  
                  // Find if the chunk already exists
                  const chunkIndex = currentChunks.findIndex(c => c.index === chunk.index);
                  
                  let newChunks;
                  if (chunkIndex >= 0) {
                    // Update existing chunk
                    newChunks = [...currentChunks];
                    newChunks[chunkIndex] = chunk;
                  } else {
                    // Add new chunk
                    newChunks = [...currentChunks, chunk];
                  }
                  
                  // Update the message with new chunks
                  message.audioChunks = newChunks;
                  
                  // Mark as not loading when all chunks are complete
                  if (isComplete) {
                    message.isAudioLoading = false;
                  }
                  
                  // Update the message in our array
                  updatedMessages[messageIndex] = message;
                  return updatedMessages;
                }
                
                return prev;
              });
            }
          ).catch(audioError => {
            console.error('Error streaming audio:', audioError);
            
            // Update message to indicate audio streaming error
            setMessages(prev => {
              const messageIndex = prev.findIndex(msg => msg.uniqueId === assistantMessage.uniqueId);
              
              if (messageIndex >= 0) {
                const updatedMessages = [...prev];
                updatedMessages[messageIndex] = {
                  ...updatedMessages[messageIndex],
                  isAudioLoading: false
                };
                return updatedMessages;
              }
              
              return prev;
            });
            
            toast({
              title: 'Audio Generation Error',
              description: audioError instanceof Error ? audioError.message : 'Failed to generate audio',
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
          });
        } catch (audioError) {
          console.error('Error initiating audio streaming:', audioError);
          
          // Update message to indicate audio error
          setMessages(prev => {
            const messageIndex = prev.findIndex(msg => msg.uniqueId === assistantMessage.uniqueId);
            
            if (messageIndex >= 0) {
              const updatedMessages = [...prev];
              updatedMessages[messageIndex] = {
                ...updatedMessages[messageIndex],
                isAudioLoading: false
              };
              return updatedMessages;
            }
            
            return prev;
          });
        }
      }
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

  const handleTTSModeChange = async (useLocal: boolean) => {
    setUseLocalTTS(useLocal);
    
    // Show loading indicator for local mode
    if (useLocal && !isLocalTTSReady) {
      toast({
        title: "Loading local TTS",
        description: "Initializing browser-based speech synthesis...",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    }
    
    // Update voice service configuration
    if (voiceService) {
      try {
        const success = await voiceService.updateTTSMode(useLocal);
        
        if (success) {
          toast({
            title: `Using ${useLocal ? "local" : "remote"} TTS`,
            description: useLocal 
              ? "Speech will be generated in your browser" 
              : "Speech will be generated using our cloud API",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          
          // Update local TTS ready state
          if (useLocal) {
            setIsLocalTTSReady(voiceService.isLocalReady());
          }
        } else if (useLocal) {
          // If switching to local failed, revert back to API
          setUseLocalTTS(false);
          toast({
            title: "Local TTS Unavailable",
            description: "Failed to initialize local speech engine. Using API instead.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error("Error changing TTS mode:", error);
        toast({
          title: "Error Changing TTS Mode",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  return (
    <Box 
      className="chat-interface"
      bg="gray.800"
      height="700px"
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
      <Flex align="center" gap={3}>
        {voiceApiKey && (
          <LocalTTSToggle
            isLocalTTS={useLocalTTS}
            isLocalReady={isLocalTTSReady}
            isLoading={isLoading}
            onChange={handleTTSModeChange}
          />
        )}
        
        {isLoading && (
          <Flex align="center">
            <Text fontSize="sm" color="gray.400" mr={2}>Processing</Text>
            <AudioWaveform 
              isActive={true} 
              color="gray.400" 
              height={16}
              width={40}
              barCount={3}
            />
          </Flex>
        )}
      </Flex>
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
              mb={4}
              position="relative" // Add relative positioning to the container
              pr={message.role === 'assistant' && 
                  (message.audioUrl || message.audioChunks?.length || message.isAudioLoading) 
                  ? 6 : 0} // Add padding if we have audio
            >
              <Box
                bg={
                  message.role === 'user' ? 'blue.600' : 
                  message.role === 'assistant' ? 'gray.700' : 
                  message.error ? 'red.600' : 'gray.600'
                }
                color="white"
                px={4}
                py={3}
                borderRadius="lg"
                boxShadow="md"
                position="relative"
              >
                {/* Message content */}
                <Text>
                  {message.content}
                </Text>
                
                {/* Error indicator */}
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
              
              {/* Audio player for assistant messages */}
              {message.role === 'assistant' && (
                <AudioPlayer 
                  audioChunks={message.audioChunks}
                  isLoading={message.isAudioLoading || false}
                />
              )}
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
          <Flex gap={2}>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              bg="gray.800"
              color="white"
              _placeholder={{ color: "gray.400" }}
              disabled={isLoading}
              borderColor="gray.600"
              _hover={{ borderColor: "gray.500" }}
              _focus={{ borderColor: "blue.500", boxShadow: "none" }}
              flex="1"
              onKeyDown={(e) => {
                // Allow Enter key to submit
                if (e.key === 'Enter' && !e.shiftKey && inputValue.trim()) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            
            {/* Voice recorder button */}
            {voiceApiKey && (
              <VoiceRecorder 
                onTranscription={handleTranscription}
                apiKey={voiceApiKey}
                disabled={isLoading}
                existingText={inputValue}
              />
            )}
            
            <Button
              colorScheme="blue"
              isDisabled={isLoading || !inputValue.trim()}
              px={8}
              _hover={{ bg: "blue.500" }}
              onClick={() => {
                console.log('Send button clicked');
                handleSubmit();  // Call handleSubmit on button click
              }}
            >
              Send
            </Button>
          </Flex>
        </Box>
    </Box>
  );
};

export default ChatInterface;