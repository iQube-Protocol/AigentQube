import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
  Text,
  useToast,
  VStack
} from '@chakra-ui/react';
import { ethers } from 'ethers';
import { registerQube } from '../utils/contractInteraction';

// Types of Qubes
type QubeType = 'DataQube' | 'ContentQube' | 'AgentQube';

interface QubeDetails {
  name: string;
  description: string;
  qubeType: QubeType;
  metaQube: {
    name: string;
    description: string;
    image?: string;
    attributes?: Array<{ trait_type: string; value: string }>;
  };
}

interface QubeRegistrationPanelProps {
  signer: ethers.Signer | null;
  onQubeRegistered?: (tokenId: string) => void;
}

export function QubeRegistrationPanel({ signer, onQubeRegistered }: QubeRegistrationPanelProps) {
  const [qubeDetails, setQubeDetails] = useState<QubeDetails>({
    name: '',
    description: '',
    qubeType: 'DataQube',
    metaQube: {
      name: '',
      description: '',
    },
  });

  const [isRegistering, setIsRegistering] = useState(false);
  const toast = useToast();

  const handleInputChange = (field: keyof QubeDetails, value: string) => {
    setQubeDetails(prev => ({
      ...prev,
      [field]: value,
      metaQube: {
        ...prev.metaQube,
        [field]: value,
      },
    }));
  };

  const handleRegister = async () => {
    if (!signer) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsRegistering(true);

      // Generate a random address and hash for testing
      const qubeAddress = ethers.Wallet.createRandom().address;
      const qubeHash = ethers.utils.id(Date.now().toString());

      // Register the Qube
      const receipt = await registerQube(
        qubeDetails.qubeType,
        qubeAddress, 
        qubeHash, 
        signer,
        qubeDetails.metaQube
      );

      if (receipt && receipt.events?.[0]?.args?.tokenId) {
        const tokenId = receipt.events[0].args.tokenId.toString();
        onQubeRegistered?.(tokenId);

        toast({
          title: 'Success',
          description: `Qube registered with token ID: ${tokenId}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      console.error('Error registering Qube:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to register Qube',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <Box p={4} borderWidth={1} borderRadius="lg">
      <VStack spacing={4} align="stretch">
        <Text fontSize="xl" fontWeight="bold">Register New Qube</Text>
        
        <FormControl>
          <FormLabel>Qube Type</FormLabel>
          <Select
            value={qubeDetails.qubeType}
            onChange={(e) => handleInputChange('qubeType', e.target.value as QubeType)}
          >
            <option value="DataQube">Data Qube</option>
            <option value="ContentQube">Content Qube</option>
            <option value="AgentQube">Agent Qube</option>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Name</FormLabel>
          <Input
            value={qubeDetails.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter Qube name"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Description</FormLabel>
          <Input
            value={qubeDetails.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter Qube description"
          />
        </FormControl>

        <Button
          colorScheme="blue"
          onClick={handleRegister}
          isLoading={isRegistering}
          loadingText="Registering..."
          isDisabled={!signer || !qubeDetails.name || !qubeDetails.description}
        >
          Register Qube
        </Button>
      </VStack>
    </Box>
  );
}
