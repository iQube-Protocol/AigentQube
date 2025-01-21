import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Input,
  Button,
  VStack,
  Text,
  useToast,
  IconButton,
  Flex,
  Divider
} from '@chakra-ui/react';
import { ChatIcon, DeleteIcon } from '@chakra-ui/icons';
import { OrchestrationAgent } from '../services/OrchestrationAgent';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface Props {
  orchestrationAgent: OrchestrationAgent;
}

export const NaturalLanguageInterface: React.FC<Props> = ({ orchestrationAgent }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    try {
      setIsProcessing(true);
      
      // Add user message
      const userMessage: Message = {
        role: 'user',
        content: input,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      setInput('');

      // Process command through orchestration agent
      const response = await orchestrationAgent.processCommand(input);

      // Add assistant response
      if (response.success && response.data) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.data,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(response.error || 'Failed to process command');
      }
    } catch (error: any) {
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

  const clearChat = () => {
    setMessages([]);
    toast({
      title: 'Chat Cleared',
      status: 'info',
      duration: 2000,
    });
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      p={4}
      height="600px"
      display="flex"
      flexDirection="column"
    >
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Text fontSize="xl" fontWeight="bold">
          AigentQube Assistant
        </Text>
        <IconButton
          aria-label="Clear chat"
          icon={<DeleteIcon />}
          onClick={clearChat}
          size="sm"
        />
      </Flex>
      
      <Divider mb={4} />

      {/* Messages Container */}
      <VStack
        flex="1"
        overflowY="auto"
        spacing={4}
        align="stretch"
        mb={4}
        css={{
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'gray.200',
            borderRadius: '24px',
          },
        }}
      >
        {messages.map((msg, index) => (
          <Box
            key={index}
            alignSelf={msg.role === 'user' ? 'flex-end' : 'flex-start'}
            maxW="80%"
          >
            <Box
              bg={msg.role === 'user' ? 'blue.500' : 'gray.100'}
              color={msg.role === 'user' ? 'white' : 'black'}
              p={3}
              borderRadius="lg"
            >
              <Text>{msg.content}</Text>
              <Text
                fontSize="xs"
                color={msg.role === 'user' ? 'whiteAlpha.700' : 'gray.500'}
                mt={1}
              >
                {msg.timestamp.toLocaleTimeString()}
              </Text>
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </VStack>

      {/* Input Area */}
      <Flex>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your command..."
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          mr={2}
        />
        <IconButton
          aria-label="Send message"
          icon={<ChatIcon />}
          onClick={handleSubmit}
          isLoading={isProcessing}
          colorScheme="blue"
        />
      </Flex>
    </Box>
  );
};
