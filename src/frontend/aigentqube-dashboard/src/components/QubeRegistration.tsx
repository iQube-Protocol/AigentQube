import React, { useState } from 'react';
import Web3 from 'web3';
import { 
  Box, 
  Button, 
  FormControl, 
  FormLabel, 
  Input, 
  Select, 
  VStack, 
  useToast,
  Text 
} from '@chakra-ui/react';
import { registerQube, storeBlackQubeData, generateQubeAddress } from '../utils/contractInteraction';

interface QubeRegistrationProps {
  account: string | null;
}

const QubeRegistration: React.FC<QubeRegistrationProps> = ({ account }) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleMintSampleQube = async () => {
    if (!account) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      // Initialize Web3 for hash generation
      const web3 = new Web3();
      
      // Create a unique identifier for this Qube
      const timestamp = Date.now().toString();
      const nonce = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      
      // Generate a bytes32 hash
      const encodedParams = web3.eth.abi.encodeParameters(
        ['address', 'uint256', 'string'],
        [account, timestamp, nonce]
      );
      const qubeHash = web3.utils.keccak256(encodedParams);
      console.log('Generated hash:', qubeHash);
      
      // Generate a deterministic address for the Qube
      const qubeAddress = await generateQubeAddress(account, qubeHash);
      console.log('Generated Qube address:', qubeAddress);
      
      const metaQubeDetails = {
        name: `DataQube #${nonce}`,
        description: 'First DataQube NFT',
        creator: account,
        encryptionLevel: 'Standard',
        ownerType: 'Person',
        ownerIdentifiability: 'Semi-Anon',
        customAddress: qubeAddress,
        customHash: qubeHash,
        transactionDate: parseInt(timestamp),
        sensitivityScore: 3,
        verifiabilityScore: 6,
        accuracyScore: 7,
        riskScore: 2
      };

      console.log('Minting with details:', {
        type: 'DataQube',
        address: qubeAddress,
        hash: qubeHash,
        meta: metaQubeDetails
      });

      // Register the Qube
      const receipt = await registerQube(
        'DataQube',
        qubeAddress,
        qubeHash,
        account,
        metaQubeDetails
      );

      console.log('Minting receipt:', receipt);

      // Store BlackQube data
      await storeBlackQubeData(qubeHash, {
        dataPoints: [
          { name: 'Profession', value: 'Tech Consultant', source: 'Manual Entry' },
          { name: 'City', value: 'New York', source: 'Manual Entry' },
          { name: 'Web3 Interests', value: 'Learning', source: 'Manual Entry' },
          { name: 'Wallet Address', value: account, source: 'MetaMask' }
        ]
      });

      toast({
        title: "Success!",
        description: `DataQube minted successfully! Transaction hash: ${receipt.transactionHash}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

    } catch (error: any) {
      console.error('Minting error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to mint DataQube",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      {!account ? (
        <Text color="red.500">Please connect your wallet to mint QubeNFTs</Text>
      ) : (
        <Button
          colorScheme="blue"
          onClick={handleMintSampleQube}
          isLoading={isLoading}
          loadingText="Minting..."
        >
          Mint Sample DataQube
        </Button>
      )}
    </VStack>
  );
};

export default QubeRegistration;
