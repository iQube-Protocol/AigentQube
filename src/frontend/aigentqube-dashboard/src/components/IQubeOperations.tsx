import React, { useState } from 'react';
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Button, 
  Input, 
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter
} from '@chakra-ui/react';
import { OrchestrationAgentInterface } from '../types/orchestration';
import PolygonNFTInterface from '../../utilities/MetaContract';
import axios from 'axios';

interface IQubeOperationsProps {
  orchestrationAgent: OrchestrationAgentInterface | null;
  nftInterface?: PolygonNFTInterface | null;
  onViewMetaQube?: (iQubeId: string) => void;
  onDecryptBlakQube?: (iQubeId: string) => void;
  onShareiQube?: (iQubeId: string) => void;
  onMintiQube?: (iQubeId: string) => void;
}

const IQubeOperations: React.FC<IQubeOperationsProps> = ({
  orchestrationAgent,
  nftInterface = null,
  onViewMetaQube,
  onDecryptBlakQube,
  onShareiQube,
  onMintiQube
}) => {
  const [tokenId, setTokenId] = useState<string>('');
  const [metadata, setMetadata] = useState<any>(null);
  const [decryptedData, setDecryptedData] = useState<any>(null);
  const [isMetadataModalOpen, setIsMetadataModalOpen] = useState(false);
  const [isDecryptedDataModalOpen, setIsDecryptedDataModalOpen] = useState(false);
  const toast = useToast();

  const handleRetrieveMetadata = async () => {
    if (!nftInterface && !orchestrationAgent) {
      toast({
        title: 'Error',
        description: 'No interface available to retrieve metadata',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      let metadataResult;
      
      if (nftInterface) {
        // Prefer nftInterface if available
        const metadataURI = await nftInterface.getBlakQube(tokenId);
        const metadataResponse = await fetch(
          metadataURI.replace(
            'ipfs://',
            `${import.meta.env.VITE_GATEWAY_URL}/ipfs/`,
          ),
        );

        if (!metadataResponse.ok) {
          throw new Error(`Failed to fetch metadata: ${metadataResponse.statusText}`);
        }

        metadataResult = await metadataResponse.json();
      } else if (orchestrationAgent) {
        // Fallback to orchestrationAgent
        metadataResult = await orchestrationAgent.retrieveIQubeMetadata(tokenId);
      }

      // Process metadata
      const processedMetadata = {
        metaQube: {},
        blakQube: {}
      };

      if (metadataResult.attributes) {
        metadataResult.attributes.forEach((attr: any) => {
          if (attr.trait_type === 'metaQube') {
            processedMetadata.metaQube = JSON.parse(attr.value);
          }
          if (attr.trait_type === 'blakQube') {
            processedMetadata.blakQube = JSON.parse(attr.value);
          }
        });
      }

      // Add additional metadata details
      processedMetadata.metaQube.iQubeIdentifier = tokenId;
      processedMetadata.metaQube.transactionDate = new Date().toISOString();

      setMetadata(processedMetadata);
      setIsMetadataModalOpen(true);
      
      onViewMetaQube?.(tokenId);
    } catch (error: any) {
      toast({
        title: 'Metadata Retrieval Failed',
        description: error.message || 'Unknown error',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Metadata retrieval error:', error);
    }
  };

  const handleDecryptBlakQube = async () => {
    if (!orchestrationAgent || !tokenId) {
      toast({
        title: 'Error',
        description: 'Please connect wallet and enter a valid Token ID',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const decryptedResult = await orchestrationAgent.decryptBlakQube(tokenId);
      setDecryptedData(decryptedResult);
      setIsDecryptedDataModalOpen(true);
      
      onDecryptBlakQube?.(tokenId);
    } catch (error) {
      toast({
        title: 'Decryption Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleShareiQube = () => {
    onShareiQube?.(tokenId);
    toast({
      title: 'Share iQube',
      description: 'Share functionality coming soon',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleMintiQube = () => {
    onMintiQube?.(tokenId);
    toast({
      title: 'Mint iQube',
      description: 'Minting functionality coming soon',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box 
      bg="gray.800" 
      p={4} 
      borderRadius="md" 
      boxShadow="md"
      color="white"
    >
      <VStack spacing={4} align="stretch">
        <Text fontSize="xl" fontWeight="bold" mb={2}>
          iQube Operations
        </Text>
        
        <Input 
          placeholder="Enter iQube Token ID" 
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
          bg="gray.700"
          color="white"
          _placeholder={{ color: 'gray.500' }}
        />
        
        <HStack spacing={2}>
          <Button 
            onClick={handleRetrieveMetadata} 
            colorScheme="blue" 
            variant="solid" 
            flex={1}
            isDisabled={!nftInterface && !orchestrationAgent}
          >
            View Metadata
          </Button>
          
          <Button 
            onClick={handleDecryptBlakQube} 
            colorScheme="green" 
            variant="solid" 
            flex={1}
            isDisabled={!orchestrationAgent || !orchestrationAgent.isInitialized()}
          >
            Decrypt BlakQube
          </Button>
        </HStack>
        
        <HStack spacing={2}>
          <Button 
            onClick={handleShareiQube} 
            colorScheme="purple" 
            variant="solid" 
            flex={1}
            isDisabled={!orchestrationAgent || !orchestrationAgent.isInitialized()}
          >
            Share iQube
          </Button>
          
          <Button 
            onClick={handleMintiQube} 
            colorScheme="orange" 
            variant="solid" 
            flex={1}
            isDisabled={!orchestrationAgent || !orchestrationAgent.isInitialized()}
          >
            Mint iQube
          </Button>
        </HStack>
      </VStack>

      {/* Metadata Modal */}
      <Modal 
        isOpen={isMetadataModalOpen} 
        onClose={() => setIsMetadataModalOpen(false)}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent bg="gray.800" color="white">
          <ModalHeader>iQube Metadata for Token {tokenId}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {metadata ? (
              <VStack align="stretch" spacing={4}>
                <Text fontWeight="bold" fontSize="lg">MetaQube Details</Text>
                {Object.entries(metadata.metaQube || {}).map(([key, value]) => (
                  <HStack key={key} justifyContent="space-between" 
                    bg="gray.700" 
                    p={2} 
                    borderRadius="md"
                  >
                    <Text fontWeight="semibold" textTransform="capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </Text>
                    <Text>{value !== null && value !== undefined ? String(value) : 'N/A'}</Text>
                  </HStack>
                ))}

                <Text fontWeight="bold" fontSize="lg" mt={4}>BlakQube Details</Text>
                {Object.entries(metadata.blakQube || {}).map(([key, value]) => (
                  <HStack key={key} justifyContent="space-between" 
                    bg="gray.700" 
                    p={2} 
                    borderRadius="md"
                  >
                    <Text fontWeight="semibold" textTransform="capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </Text>
                    <Text>
                      {Array.isArray(value) 
                        ? value.join(', ') 
                        : (value !== null && value !== undefined 
                          ? String(value) 
                          : 'N/A')}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            ) : (
              <Text>No metadata available</Text>
            )}
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

      {/* Decrypted Data Modal */}
      <Modal 
        isOpen={isDecryptedDataModalOpen} 
        onClose={() => setIsDecryptedDataModalOpen(false)}
      >
        <ModalOverlay />
        <ModalContent bg="gray.800" color="white">
          <ModalHeader>Decrypted BlakQube Data</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {decryptedData ? (
              <VStack align="stretch" spacing={2}>
                {Object.entries(decryptedData).map(([key, value]) => (
                  <Box 
                    key={key} 
                    bg="gray.700" 
                    p={2} 
                    borderRadius="md"
                  >
                    <Text fontWeight="bold">{key}:</Text>
                    <Text>{String(value)}</Text>
                  </Box>
                ))}
              </VStack>
            ) : (
              <Text>No decrypted data available</Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button 
              colorScheme="green" 
              onClick={() => setIsDecryptedDataModalOpen(false)}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default IQubeOperations;
