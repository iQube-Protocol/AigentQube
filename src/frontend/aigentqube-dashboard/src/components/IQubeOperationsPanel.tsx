import React, { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  Text,
  useToast,
  Input,
  HStack,
  Badge
} from '@chakra-ui/react';
import { OrchestrationAgent } from '../services/OrchestrationAgent';

interface IQubeOperationsPanelProps {
  orchestrationAgent: OrchestrationAgent | null;
  onContextUpdate?: (context: any) => void;
}

export const IQubeOperationsPanel: React.FC<IQubeOperationsPanelProps> = ({
  orchestrationAgent,
  onContextUpdate
}) => {
  const [tokenId, setTokenId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleUseIQube = async () => {
    if (!tokenId) {
      toast({
        title: 'Input Required',
        description: 'Please enter an iQube Token ID',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      if (!orchestrationAgent) {
        throw new Error('Orchestration agent not initialized');
      }

      const success = await orchestrationAgent.useIQube(tokenId);
      if (success) {
        toast({
          title: 'Success',
          description: 'iQube connected successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        // Update context if callback provided
        if (onContextUpdate) {
          onContextUpdate({
            iQubeData: orchestrationAgent.getIQubeData(),
            specializedState: orchestrationAgent.getCurrentDomain()
          });
        }
      } else {
        throw new Error('Failed to connect iQube');
      }
    } catch (error: any) {
      console.error('Error using iQube:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to connect iQube',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box 
      className="iqube-operations-panel"
      bg="gray.800"
      p={6}
      rounded="lg"
      border="1px"
      borderColor="gray.700"
    >
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="xl" fontWeight="bold">iQube Operations</Text>
          <Badge 
            colorScheme={isLoading ? 'gray' : 'green'}
            variant="subtle"
            fontSize="sm"
          >
            {isLoading ? 'Connecting...' : 'Ready'}
          </Badge>
        </HStack>

        <HStack>
          <Input
            type="text"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            placeholder="Enter iQube Token ID"
            bg="gray.700"
            _placeholder={{ color: 'gray.500' }}
          />
          <Button
            onClick={handleUseIQube}
            disabled={isLoading}
            colorScheme={isLoading ? 'gray' : 'blue'}
          >
            {isLoading ? 'Connecting...' : 'Use iQube'}
          </Button>
        </HStack>
        <Text fontSize="sm" color="gray.500">
          Example Token IDs: iqube-high-001, iqube-opt-001, iqube-sec-001
        </Text>
      </VStack>
    </Box>
  );
};
