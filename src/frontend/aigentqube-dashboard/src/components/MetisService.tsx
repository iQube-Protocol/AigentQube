import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  Input,
  Button,
  Text,
  useToast,
  Spinner
} from '@chakra-ui/react';
import { SpecializedDomain } from '../types/domains';
import { OrchestrationAgent } from '../services/OrchestrationAgent';

interface MetisServiceProps {
  domain: SpecializedDomain;
  orchestrationAgent: OrchestrationAgent;
  isInitialized: boolean;
}

export const MetisService: React.FC<MetisServiceProps> = ({
  domain,
  orchestrationAgent,
  isInitialized
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string>('');
  const toast = useToast();

  const handleSubmit = async () => {
    if (!input.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter your query',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await orchestrationAgent.querySpecializedDomain(domain, input);
      if (result.success && result.data) {
        setResponse(result.data);
      } else {
        throw new Error(result.error || 'Failed to get response');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to process query',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInitialized) {
    return (
      <Box p={4} textAlign="center">
        <Spinner />
        <Text mt={2}>Initializing {domain} service...</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch" p={4}>
      <Input
        placeholder="Enter your query..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isLoading}
      />
      <Button
        colorScheme="blue"
        onClick={handleSubmit}
        isLoading={isLoading}
        loadingText="Processing..."
      >
        Submit Query
      </Button>
      {response && (
        <Box
          p={4}
          borderWidth={1}
          borderRadius="md"
          bg="gray.50"
          whiteSpace="pre-wrap"
        >
          <Text>{response}</Text>
        </Box>
      )}
    </VStack>
  );
};
