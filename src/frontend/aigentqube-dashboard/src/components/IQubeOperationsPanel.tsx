import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { 
  Box, 
  Button, 
  VStack, 
  Text, 
  useToast, 
  Input, 
  HStack, 
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter
} from '@chakra-ui/react';
import { OrchestrationAgent } from '../utils/OrchestrationAgent';
import PolygonNFTInterface from '../utilities/MetaContract';

// Helper function to format display values
const formatDisplayValue = (value: any, isBlakQube: boolean = false): string => {
  if (value === null || value === undefined) return 'N/A';
  
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  
  return value.toString();
};

interface IQubeOperationsPanelProps {
  orchestrationAgent: OrchestrationAgent | null;
  nftInterface?: PolygonNFTInterface;
  onContextUpdate?: (context: any) => void;
}

export const IQubeOperationsPanel: React.FC<IQubeOperationsPanelProps> = ({
  orchestrationAgent,
  nftInterface,
  onContextUpdate
}) => {
  const [tokenId, setTokenId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [metaQubeData, setMetaQubeData] = useState<Record<string, string>>({});
  const [blakQubeData, setBlakQubeData] = useState<Record<string, string>>({});
  const [decryptionError, setDecryptionError] = useState<string | null>(null);
  const [isMetadataModalOpen, setIsMetadataModalOpen] = useState(false);
  const toast = useToast();

  // Metadata Extraction Function
  const extractAndFormatMetadata = useCallback(async (metadata: any) => {
    try {
      // Extract MetaQube and BlakQube data from attributes
      const metaQubeAttrs = metadata.attributes?.find((attr: any) => attr.trait_type === 'metaQube')?.value || {};
      const blakQubeAttrs = metadata.attributes?.find((attr: any) => attr.trait_type === 'blakQube')?.value || {};
      
      // Remove blakQube-related fields
      const {
        blakQubeKey,
        blakQubeLocation,
        blakQubeIdentifier,
        ...cleanMetaQubeData
      } = metaQubeAttrs;

      // Format MetaQube values
      const formattedMetaQubeData = Object.entries(cleanMetaQubeData).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: formatDisplayValue(value, false)
        }),
        {}
      );

      // Format BlakQube values
      const formattedBlakQubeData = Object.entries(blakQubeAttrs).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: formatDisplayValue(value, true)
        }),
        {}
      );

      return {
        metaQubeData: formattedMetaQubeData,
        blakQubeData: formattedBlakQubeData
      };
    } catch (error) {
      console.error('Metadata extraction error:', error);
      throw error;
    }
  }, []);

  // Decryption Error Handler
  const handleDecryptionError = useCallback((error: any) => {
    let userMessage = 'An unexpected error occurred during decryption';

    if (error.code === 4001 || error.message?.includes('user rejected')) {
      userMessage = 'Decryption was rejected. You can try again when ready.';
    } else if (error.message?.includes('network')) {
      userMessage = 'Network error. Please check your connection.';
    } else if (error.message?.includes('permission')) {
      userMessage = 'You do not have permission to decrypt this iQube.';
    }

    setDecryptionError(userMessage);
    toast({
      title: 'Decryption Error',
      description: userMessage,
      status: 'error',
      duration: 5000,
      isClosable: true
    });
  }, [toast]);

  // Main iQube Use Function
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
    setDecryptionError(null);
    try {
      if (!orchestrationAgent) {
        throw new Error('Orchestration agent not initialized');
      }

      // Retrieve iQube Metadata
      const metadata = await orchestrationAgent.retrieveIQubeMetadata(tokenId);
      
      // Extract and format metadata
      const { metaQubeData, blakQubeData } = await extractAndFormatMetadata(metadata);
      
      // Attempt to decrypt BlakQube if needed
      let decryptedBlakQubeData = {};
      try {
        decryptedBlakQubeData = await orchestrationAgent.decryptBlakQube(tokenId);
      } catch (decryptError) {
        handleDecryptionError(decryptError);
      }

      // Set extracted and decrypted data
      setMetaQubeData(metaQubeData);
      setBlakQubeData({
        ...blakQubeData,
        ...decryptedBlakQubeData
      });

      // Open metadata modal
      setIsMetadataModalOpen(true);

      // Use iQube
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
            iQubeData: metadata,
            metaQubeData,
            blakQubeData,
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

      {/* Metadata Modal */}
      <Modal 
        isOpen={isMetadataModalOpen} 
        onClose={() => setIsMetadataModalOpen(false)}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent bg="gray.800">
          <ModalHeader>iQube Metadata</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {decryptionError && (
              <Text color="red.500" mb={4}>
                {decryptionError}
              </Text>
            )}
            <VStack align="stretch" spacing={3}>
              <Text fontWeight="bold">MetaQube Data:</Text>
              {Object.entries(metaQubeData).map(([key, value]) => (
                <HStack key={key} justify="space-between">
                  <Text>{key}:</Text>
                  <Text>{value}</Text>
                </HStack>
              ))}
              
              <Text fontWeight="bold" mt={4}>BlakQube Data:</Text>
              {Object.entries(blakQubeData).map(([key, value]) => (
                <HStack key={key} justify="space-between">
                  <Text>{key}:</Text>
                  <Text>{value}</Text>
                </HStack>
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button 
              colorScheme="blue" 
              mr={3} 
              onClick={() => setIsMetadataModalOpen(false)}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
