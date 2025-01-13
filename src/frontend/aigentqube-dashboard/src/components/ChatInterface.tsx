import React, { useState, useRef, useEffect } from 'react';
import { OrchestrationAgent } from '../services/OrchestrationAgent';
import { Box, Input, Button, VStack, Text, useToast, Flex } from '@chakra-ui/react';

interface ChatInterfaceProps {
  context?: any;
  className?: string;
  orchestrationAgent: OrchestrationAgent;
}

interface Message {
  id: number;
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
  error?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  context,
  className = '',
  orchestrationAgent
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const checkInitialization = async () => {
      if (orchestrationAgent) {
        try {
          console.log('Checking orchestration agent status...');
          const status = await orchestrationAgent.getStatus();
          console.log('Status:', status);
          const isReady = status.context.isActive && 
                         status.service.isActive && 
                         status.state.isActive;
          
          console.log('Is agent ready?', isReady);
          setIsInitialized(isReady);
          
          if (!isReady) {
            console.log('Agent not ready. Layers:', {
              context: status.context.isActive,
              service: status.service.isActive,
              state: status.state.isActive
            });
          }
        } catch (error) {
          console.error('Failed to check orchestration agent status:', error);
          setIsInitialized(false);
        }
      } else {
        console.log('No orchestration agent provided');
        setIsInitialized(false);
      }
    };

    // Initial check
    checkInitialization();

    // Set up status check interval
    const interval = setInterval(checkInitialization, 2000);

    return () => clearInterval(interval);
  }, [orchestrationAgent]);

  const sendMessage = async () => {
    if (inputMessage.trim() === '') return;
    if (!isInitialized) {
      toast({
        title: 'Not Ready',
        description: 'The AI Assistant is still initializing. Please wait.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (isProcessing) return;

    const newUserMessage: Message = {
      id: Date.now(),
      sender: 'user',
      text: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsProcessing(true);

    try {
      // Process through orchestration agent
      const response = await orchestrationAgent.processCommand(inputMessage, context);

      if (response.success) {
        const agentResponse: Message = {
          id: Date.now() + 1,
          sender: 'agent',
          text: response.data,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, agentResponse]);
      } else {
        throw new Error(response.error || 'Unknown error occurred');
      }
    } catch (error: any) {
      console.error('Chat processing error:', error);
      
      const errorMessage: Message = {
        id: Date.now() + 1,
        sender: 'agent',
        text: `I apologize, but I encountered an error: ${error.message}`,
        timestamp: new Date(),
        error: true
      };

      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Box 
      className={className}
      height="100%"
      display="flex"
      flexDirection="column"
      bg="gray.800"
      p={6}
      borderRadius="lg"
    >
      {!isInitialized ? (
        <Flex justify="center" align="center" height="100%">
          <Text>Initializing chat interface...</Text>
        </Flex>
      ) : (
        <VStack spacing={4} flex={1}>
          <Box 
            width="full"
            overflowY="auto"
            flex={1}
            bg="gray.900"
            borderRadius="md"
            p={4}
            minHeight="300px"
          >
            <VStack spacing={3} align="stretch">
              {messages.map((message) => (
                <Box 
                  key={message.id} 
                  alignSelf={message.sender === 'user' ? 'flex-end' : 'flex-start'}
                  maxWidth="80%"
                >
                  <Box
                    bg={message.sender === 'user' 
                      ? 'blue.600' 
                      : message.error 
                        ? 'red.600' 
                        : 'gray.700'}
                    color="white"
                    borderRadius="lg"
                    px={4}
                    py={2}
                  >
                    <Text>{message.text}</Text>
                    <Text 
                      fontSize="xs" 
                      opacity={0.7}
                      mt={1}
                    >
                      {message.timestamp.toLocaleTimeString()}
                    </Text>
                  </Box>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </VStack>
          </Box>

          <Flex width="full" gap={2}>
            <Input
              flex={1}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isProcessing}
              bg="gray.700"
              color="white"
              _placeholder={{ color: 'gray.400' }}
            />
            <Button
              onClick={sendMessage}
              isLoading={isProcessing}
              loadingText="Sending..."
              colorScheme="blue"
              px={8}
            >
              Send
            </Button>
          </Flex>
        </VStack>
      )}
    </Box>
  );
};

export default ChatInterface;
