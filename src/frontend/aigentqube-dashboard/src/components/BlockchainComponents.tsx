import React, { useState, useEffect } from 'react';
import { blockchainService } from '../services/BlockchainService';
import { 
  Box, 
  Button, 
  Text, 
  VStack, 
  Input, 
  HStack,
  Select,
  useToast
} from '@chakra-ui/react';

interface BlockchainWalletStatusProps {
  isConnected: boolean;
  account: string;
}

export const BlockchainWalletStatus: React.FC<BlockchainWalletStatusProps> = ({
  isConnected,
  account
}) => {
  const toast = useToast();

  const connectWallet = async () => {
    try {
      const connectedAccount = await blockchainService.connectWallet();
      
      if (connectedAccount) {
        toast({
          title: "Wallet Connected",
          description: `Connected with address: ${connectedAccount}`,
          status: "success",
          duration: 3000,
          isClosable: true
        });
      } else {
        throw new Error('Wallet connection failed');
      }
    } catch (error) {
      console.error('Wallet connection failed', error);
      toast({
        title: "Wallet Connection Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        status: "error",
        duration: 5000,
        isClosable: true
      });
    }
  };

  return (
    <Box 
      p={4} 
      borderWidth={1} 
      borderRadius="lg"
    >
      {isConnected ? (
        <VStack>
          <Text>Connected Wallet:</Text>
          <Text fontWeight="bold">{account}</Text>
        </VStack>
      ) : (
        <Button onClick={connectWallet} colorScheme="blue">
          Connect Wallet
        </Button>
      )}
    </Box>
  );
}

export function QubeBlockchainRegistration() {
  const [name, setName] = useState('');
  const [qubeType, setQubeType] = useState<'MetaQube' | 'BlakQube' | 'TokenQube'>('MetaQube');
  const [metadata, setMetadata] = useState('');
  const [account, setAccount] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    const checkWalletConnection = async () => {
      const connectedAccount = await blockchainService.connectWallet();
      if (connectedAccount) {
        setAccount(connectedAccount);
      }
    };
    checkWalletConnection();
  }, []);

  const handleRegisterQube = async () => {
    if (!account) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        status: "warning",
        duration: 3000,
        isClosable: true
      });
      return;
    }

    try {
      // Parse metadata as JSON
      const parsedMetadata = metadata ? JSON.parse(metadata) : {};

      const txHash = await blockchainService.registerQube(
        name, 
        qubeType, 
        parsedMetadata
      );

      if (txHash) {
        toast({
          title: "Qube Registered",
          description: `Qube registered successfully. Transaction Hash: ${txHash}`,
          status: "success",
          duration: 5000,
          isClosable: true
        });
        
        // Reset form
        setName('');
        setMetadata('');
      } else {
        throw new Error('Qube registration failed');
      }
    } catch (error) {
      console.error('Qube registration error', error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        status: "error",
        duration: 5000,
        isClosable: true
      });
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <Text fontSize="xl" fontWeight="bold">Register New Qube</Text>
      
      <Input 
        placeholder="Qube Name" 
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      
      <Select 
        value={qubeType}
        onChange={(e) => setQubeType(e.target.value as 'MetaQube' | 'BlakQube' | 'TokenQube')}
      >
        <option value="MetaQube">MetaQube</option>
        <option value="BlakQube">BlakQube</option>
        <option value="TokenQube">TokenQube</option>
      </Select>
      
      <Input 
        placeholder="Metadata (JSON)" 
        value={metadata}
        onChange={(e) => setMetadata(e.target.value)}
      />
      
      <Button 
        onClick={handleRegisterQube} 
        colorScheme="green"
        isDisabled={!account || !name}
      >
        Register Qube
      </Button>
    </VStack>
  );
}
