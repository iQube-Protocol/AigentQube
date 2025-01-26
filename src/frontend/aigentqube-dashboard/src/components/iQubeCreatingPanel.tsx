import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { 
  registerQube,
  generateQubeAddress,
  MetaQubeDetails,
  QubeRegistrationParams 
} from '../utils/contractInteraction';
import { 
  Box, 
  Button, 
  FormControl, 
  FormLabel, 
  Input, 
  Select, 
  VStack, 
  Text,
  useToast,
  HStack,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Textarea,
  Heading
} from '@chakra-ui/react';

interface IQubeCreatingPanelProps {
  web3: Web3 | null;
  account: string;
}

interface AgentQubeDetails {
  iQubeType: string;
  encryptionLevel: string;
  domain: string;
  capabilities: string;
  specialization: string;
  apiKey: string;
  name: string;
  integrations: string;
}

const IQubeCreatingPanel: React.FC<IQubeCreatingPanelProps> = ({ 
  web3, 
  account
}) => {
  console.log('IQubeCreatingPanel Initialized with:', { web3, account });

  useEffect(() => {
    console.log('IQubeCreatingPanel Props:', { web3, account });
  }, [web3, account]);

  const toast = useToast();
  const [activeTokenType, setActiveTokenType] = useState<'DataQube' | 'ContentQube' | 'AgentQube'>('DataQube');
  
  // Comprehensive MetaQube State
  const [baseQubeDetails, setBaseQubeDetails] = useState({
    name: 'AigentZ DataQube #001',
    creator: 'AigentZ Protocol',
    description: 'Initial AigentZ Protocol DataQube for testing minting functionality',
    ownerType: 'Organization' as 'Person' | 'Organization' | 'Thing',
    ownerIdentifiability: 'Identifiable' as 'Anon' | 'Semi-Anon' | 'Identifiable' | 'Semi-Identifiable',
    sensitivityScore: 4,
    verifiabilityScore: 8,
    accuracyScore: 9,
    riskScore: 3,
    transactionDate: Date.now()
  });

  // DataQube State
  const [dataQubeDetails, setDataQubeDetails] = useState({
    iQubeType: 'DataQube',
    encryptionLevel: 'High',
    dataPoints: [
      { 
        name: 'Protocol',
        value: 'AigentZ',
        source: 'System'
      },
      {
        name: 'Capabilities',
        value: 'Agentic AI, Web3 Integration, Context Management',
        source: 'System'
      },
      {
        name: 'Network',
        value: 'Polygon Amoy Testnet',
        source: 'Blockchain'
      }
    ],
    blackQubeDetails: {
      protocolVersion: '1.0.0',
      capabilities: ['Agentic AI', 'Web3 Integration', 'Context Management'],
      deploymentNetwork: 'Polygon Amoy',
      contractAddress: process.env.REACT_APP_IQUBE_REGISTRY_ADDRESS
    }
  });

  // ContentQube State
  const [contentQubeDetails, setContentQubeDetails] = useState({
    iQubeType: 'ContentQube',
    contentType: 'text',
    usageRights: '',
    accessLevel: 'Private',
    uploadedFile: null as File | null,
    filePreview: null as string | null
  });

  // AgentQube State
  const [agentQubeDetails, setAgentQubeDetails] = useState<AgentQubeDetails>({
    iQubeType: '',
    encryptionLevel: '',
    domain: '',
    capabilities: '',
    specialization: '',
    apiKey: '',
    name: '',
    integrations: ''
  });

  // Minting Logic for Each Qube Type
  const mintQube = async () => {
    try {
      console.log('Mint Qube called with:', { web3, account });

      // Comprehensive validation
      if (!web3) {
        console.error('Web3 is not initialized');
        toast({
          title: 'Error',
          description: 'Web3 is not initialized. Please connect your wallet.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      if (!account) {
        console.error('No account connected');
        toast({
          title: 'Error',
          description: 'No wallet account connected. Please connect your wallet.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      // Debug: Log Web3 instance details with more comprehensive check
      console.log('Web3 Instance Full Details:', {
        version: web3.version,
        utils: Object.keys(web3.utils),
        eth: Object.keys(web3.eth),
        currentProvider: web3.currentProvider,
        isConnected: web3.eth.net ? await web3.eth.net.isListening() : 'Unable to check connection'
      });

      // Validate Web3 connection and network
      let networkId, chainId;
      try {
        networkId = await web3.eth.net.getId();
        chainId = await web3.eth.getChainId();
      } catch (networkError) {
        console.error('Network detection error:', networkError);
        toast({
          title: 'Network Error',
          description: 'Unable to detect network. Please check your wallet connection.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      const expectedNetworkId = 80002; // Polygon Amoy Testnet
      const expectedChainId = '0x' + expectedNetworkId.toString(16); // Hex representation

      console.log('Current Network Details:', {
        networkId,
        chainId,
        expectedNetworkId,
        expectedChainId
      });

      // Validate network
      if (BigInt(networkId) !== BigInt(expectedNetworkId) || BigInt(chainId) !== BigInt(expectedNetworkId)) {
        try {
          // Attempt to switch network
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: expectedChainId }]
          });
        } catch (switchError: any) {
          console.error('Network switch error:', switchError);
          
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: expectedChainId,
                  chainName: 'Polygon Amoy Testnet',
                  nativeCurrency: {
                    name: 'MATIC',
                    symbol: 'MATIC',
                    decimals: 18
                  },
                  rpcUrls: ['https://rpc-amoy.polygon.technology'],
                  blockExplorerUrls: ['https://www.oklink.com/amoy']
                }]
              });
            } catch (addError) {
              console.error('Failed to add network:', addError);
              toast({
                title: 'Network Error',
                description: 'Failed to add Polygon Amoy Testnet to MetaMask',
                status: 'error',
                duration: 5000,
                isClosable: true,
              });
              return;
            }
          } else {
            toast({
              title: 'Network Error',
              description: `Please switch to Polygon Amoy Testnet (Network ID: ${expectedNetworkId})`,
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
            return;
          }
        }
      }

      const timestamp = Date.now();
      const nonce = Math.floor(Math.random() * 1000000);
      
      // Validate base details
      if (!baseQubeDetails.name || baseQubeDetails.name.trim().length === 0) {
        toast({
          title: 'Validation Error',
          description: 'iQube name cannot be empty',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      const encodedParams = web3.eth.abi.encodeParameters(
        ['address', 'uint256', 'uint256'],
        [account, timestamp, nonce]
      );
      
      // Generate hash using keccak256
      const qubeHash = web3.utils.keccak256(encodedParams);
      
      if (!qubeHash) {
        throw new Error('Failed to generate Qube hash');
      }

      console.log('Hash generation details:', {
        account,
        timestamp,
        nonce,
        encodedParams,
        qubeHash
      });
      
      // Generate a deterministic address for the Qube
      const qubeAddress = await generateQubeAddress(account, qubeHash);
      console.log('Generated Qube address:', qubeAddress);
      
      const metaQubeDetails: MetaQubeDetails = {
        name: baseQubeDetails.name,
        description: baseQubeDetails.description || 'No description provided',
        creator: account,
        encryptionLevel: 'High',
        ownerType: baseQubeDetails.ownerType,
        ownerIdentifiability: baseQubeDetails.ownerIdentifiability,
        customAddress: qubeAddress,
        customHash: qubeHash,
        transactionDate: timestamp,
        sensitivityScore: baseQubeDetails.sensitivityScore || 0,
        verifiabilityScore: baseQubeDetails.verifiabilityScore || 0,
        accuracyScore: baseQubeDetails.accuracyScore || 0,
        riskScore: baseQubeDetails.riskScore || 0
      };

      console.log('Minting with details:', {
        type: activeTokenType,
        address: qubeAddress,
        hash: qubeHash,
        meta: metaQubeDetails
      });

      // Prepare additional metadata based on Qube type
      let additionalMetadata;
      switch (activeTokenType) {
        case 'DataQube':
          additionalMetadata = dataQubeDetails;
          break;
        case 'ContentQube':
          additionalMetadata = contentQubeDetails;
          break;
        case 'AgentQube':
          additionalMetadata = agentQubeDetails;
          break;
        default:
          throw new Error(`Unsupported Qube type: ${activeTokenType}`);
      }

      // Call registerQube with Web3
      const receipt = await registerQube(
        activeTokenType,
        qubeAddress,
        qubeHash,
        account,
        { ...metaQubeDetails, additionalDetails: additionalMetadata }
      );

      console.log('Minting successful:', receipt);
      toast({
        title: 'Success',
        description: `${activeTokenType} minted successfully`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Optional: Reset form or perform additional actions after successful minting
      resetFormAfterMinting();

    } catch (error: any) {
      console.error('Comprehensive Minting error:', error);
      
      // Detailed error handling
      let errorMessage = 'Failed to mint iQube';
      if (error.code === 4001) {
        errorMessage = 'Transaction was rejected by user';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction';
      } else if (error.message.includes('wrong network') || error.message.includes('Network ID')) {
        errorMessage = 'Please switch to Polygon Amoy Testnet';
      }

      // Log additional error details for debugging
      console.error('Detailed Error:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code
      });

      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Helper function to reset form after minting
  const resetFormAfterMinting = () => {
    // Reset state to initial values
    setBaseQubeDetails({
      name: 'AigentZ DataQube #' + (Math.floor(Math.random() * 1000)).toString().padStart(3, '0'),
      creator: 'AigentZ Protocol',
      description: 'Initial AigentZ Protocol DataQube for testing minting functionality',
      ownerType: 'Organization',
      ownerIdentifiability: 'Identifiable',
      sensitivityScore: 4,
      verifiabilityScore: 8,
      accuracyScore: 9,
      riskScore: 3,
      transactionDate: Date.now()
    });

    // Reset type-specific details
    setDataQubeDetails({
      iQubeType: 'DataQube',
      encryptionLevel: 'High',
      dataPoints: [
        { 
          name: 'Protocol',
          value: 'AigentZ',
          source: 'System'
        },
        {
          name: 'Capabilities',
          value: 'Agentic AI, Web3 Integration, Context Management',
          source: 'System'
        },
        {
          name: 'Network',
          value: 'Polygon Amoy Testnet',
          source: 'Blockchain'
        }
      ],
      blackQubeDetails: {
        protocolVersion: '1.0.0',
        capabilities: ['Agentic AI', 'Web3 Integration', 'Context Management'],
        deploymentNetwork: 'Polygon Amoy',
        contractAddress: process.env.REACT_APP_IQUBE_REGISTRY_ADDRESS
      }
    });

    // Reset other Qube type details similarly
  };

  // Render method for MetaQube base details
  const renderMetaQubeBaseDetails = () => (
    <VStack spacing={4} width="full">
      <FormControl isRequired>
        <FormLabel color="gray.300">iQube Name</FormLabel>
        <Input 
          placeholder="Enter iQube Name"
          value={baseQubeDetails.name}
          bg="gray.700"
          borderColor="gray.600"
          color="gray.100"
          _placeholder={{ color: 'gray.500' }}
          onChange={(e) => setBaseQubeDetails(prev => ({
            ...prev,
            name: e.target.value
          }))}
        />
      </FormControl>

      <FormControl>
        <FormLabel color="gray.300">Description</FormLabel>
        <Textarea 
          placeholder="Enter iQube Description"
          value={baseQubeDetails.description}
          bg="gray.700"
          borderColor="gray.600"
          color="gray.100"
          _placeholder={{ color: 'gray.500' }}
          onChange={(e) => setBaseQubeDetails(prev => ({
            ...prev,
            description: e.target.value
          }))}
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel color="gray.300">Owner Type</FormLabel>
        <Select
          value={baseQubeDetails.ownerType}
          bg="gray.700"
          borderColor="gray.600"
          color="gray.100"
          _placeholder={{ color: 'gray.500' }}
          onChange={(e) => setBaseQubeDetails(prev => ({
            ...prev,
            ownerType: e.target.value as 'Person' | 'Organization' | 'Thing'
          }))}
        >
          <option value="Organization">Organization</option>
          <option value="Person">Person</option>
          <option value="Thing">Thing</option>
        </Select>
      </FormControl>

      <FormControl isRequired>
        <FormLabel color="gray.300">Owner Identifiability</FormLabel>
        <Select
          value={baseQubeDetails.ownerIdentifiability}
          bg="gray.700"
          borderColor="gray.600"
          color="gray.100"
          _placeholder={{ color: 'gray.500' }}
          onChange={(e) => setBaseQubeDetails(prev => ({
            ...prev,
            ownerIdentifiability: e.target.value as 'Anon' | 'Semi-Anon' | 'Identifiable' | 'Semi-Identifiable'
          }))}
        >
          <option value="Identifiable">Identifiable</option>
          <option value="Semi-Identifiable">Semi-Identifiable</option>
          <option value="Anon">Anonymous</option>
          <option value="Semi-Anon">Semi-Anonymous</option>
        </Select>
      </FormControl>

      <HStack width="full">
        <FormControl>
          <FormLabel color="gray.300">Sensitivity Score</FormLabel>
          <Slider
            defaultValue={baseQubeDetails.sensitivityScore}
            min={0}
            max={10}
            onChange={(val) => setBaseQubeDetails(prev => ({
              ...prev,
              sensitivityScore: val
            }))}
          >
            <SliderTrack bg="gray.700">
              <SliderFilledTrack bg="teal.500" />
            </SliderTrack>
            <SliderThumb bg="teal.300" />
          </Slider>
        </FormControl>

        <FormControl>
          <FormLabel color="gray.300">Verifiability Score</FormLabel>
          <Slider
            defaultValue={baseQubeDetails.verifiabilityScore}
            min={0}
            max={10}
            onChange={(val) => setBaseQubeDetails(prev => ({
              ...prev,
              verifiabilityScore: val
            }))}
          >
            <SliderTrack bg="gray.700">
              <SliderFilledTrack bg="teal.500" />
            </SliderTrack>
            <SliderThumb bg="teal.300" />
          </Slider>
        </FormControl>
      </HStack>

      <HStack width="full">
        <FormControl>
          <FormLabel color="gray.300">Accuracy Score</FormLabel>
          <Slider
            defaultValue={baseQubeDetails.accuracyScore}
            min={0}
            max={10}
            onChange={(val) => setBaseQubeDetails(prev => ({
              ...prev,
              accuracyScore: val
            }))}
          >
            <SliderTrack bg="gray.700">
              <SliderFilledTrack bg="teal.500" />
            </SliderTrack>
            <SliderThumb bg="teal.300" />
          </Slider>
        </FormControl>

        <FormControl>
          <FormLabel color="gray.300">Risk Score</FormLabel>
          <Slider
            defaultValue={baseQubeDetails.riskScore}
            min={0}
            max={10}
            onChange={(val) => setBaseQubeDetails(prev => ({
              ...prev,
              riskScore: val
            }))}
          >
            <SliderTrack bg="gray.700">
              <SliderFilledTrack bg="teal.500" />
            </SliderTrack>
            <SliderThumb bg="teal.300" />
          </Slider>
        </FormControl>
      </HStack>
    </VStack>
  );

  // Render method for specific Qube type details
  const renderQubeTypeDetails = () => {
    switch (activeTokenType) {
      case 'DataQube':
        return (
          <VStack spacing={4} width="full">
            <FormControl>
              <FormLabel color="gray.300">Encryption Level</FormLabel>
              <Select
                value={dataQubeDetails.encryptionLevel}
                bg="gray.700"
                borderColor="gray.600"
                color="gray.100"
                _placeholder={{ color: 'gray.500' }}
                onChange={(e) => setDataQubeDetails(prev => ({
                  ...prev,
                  encryptionLevel: e.target.value
                }))}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel color="gray.300">Data Points</FormLabel>
              {dataQubeDetails.dataPoints.map((point, index) => (
                <HStack key={index} mb={2}>
                  <Input 
                    placeholder="Name"
                    value={point.name}
                    bg="gray.700"
                    borderColor="gray.600"
                    color="gray.100"
                    _placeholder={{ color: 'gray.500' }}
                    onChange={(e) => {
                      const newDataPoints = [...dataQubeDetails.dataPoints];
                      newDataPoints[index].name = e.target.value;
                      setDataQubeDetails(prev => ({ ...prev, dataPoints: newDataPoints }));
                    }}
                  />
                  <Input 
                    placeholder="Value"
                    value={point.value}
                    bg="gray.700"
                    borderColor="gray.600"
                    color="gray.100"
                    _placeholder={{ color: 'gray.500' }}
                    onChange={(e) => {
                      const newDataPoints = [...dataQubeDetails.dataPoints];
                      newDataPoints[index].value = e.target.value;
                      setDataQubeDetails(prev => ({ ...prev, dataPoints: newDataPoints }));
                    }}
                  />
                  <Select
                    value={point.source}
                    bg="gray.700"
                    borderColor="gray.600"
                    color="gray.100"
                    _placeholder={{ color: 'gray.500' }}
                    onChange={(e) => {
                      const newDataPoints = [...dataQubeDetails.dataPoints];
                      newDataPoints[index].source = e.target.value;
                      setDataQubeDetails(prev => ({ ...prev, dataPoints: newDataPoints }));
                    }}
                  >
                    <option value="System">System</option>
                    <option value="Manual">Manual</option>
                    <option value="External">External</option>
                  </Select>
                </HStack>
              ))}
              <Button 
                onClick={() => setDataQubeDetails(prev => ({
                  ...prev,
                  dataPoints: [...prev.dataPoints, { name: '', value: '', source: 'Manual' }]
                }))}
              >
                Add Data Point
              </Button>
            </FormControl>
          </VStack>
        );
      case 'ContentQube':
        return (
          <VStack spacing={4} width="full">
            <FormControl>
              <FormLabel color="gray.300">Content Type</FormLabel>
              <Select
                value={contentQubeDetails.contentType}
                bg="gray.700"
                borderColor="gray.600"
                color="gray.100"
                _placeholder={{ color: 'gray.500' }}
                onChange={(e) => setContentQubeDetails(prev => ({
                  ...prev,
                  contentType: e.target.value
                }))}
              >
                <option value="text">Text</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel color="gray.300">Usage Rights</FormLabel>
              <Input 
                placeholder="Enter usage rights"
                value={contentQubeDetails.usageRights}
                bg="gray.700"
                borderColor="gray.600"
                color="gray.100"
                _placeholder={{ color: 'gray.500' }}
                onChange={(e) => setContentQubeDetails(prev => ({
                  ...prev,
                  usageRights: e.target.value
                }))}
              />
            </FormControl>

            <FormControl>
              <FormLabel color="gray.300">Access Level</FormLabel>
              <Select
                value={contentQubeDetails.accessLevel}
                bg="gray.700"
                borderColor="gray.600"
                color="gray.100"
                _placeholder={{ color: 'gray.500' }}
                onChange={(e) => setContentQubeDetails(prev => ({
                  ...prev,
                  accessLevel: e.target.value
                }))}
              >
                <option value="Private">Private</option>
                <option value="Public">Public</option>
                <option value="Restricted">Restricted</option>
              </Select>
            </FormControl>
          </VStack>
        );
      case 'AgentQube':
        return (
          <VStack spacing={4} width="full">
            <FormControl>
              <FormLabel color="gray.300">Domain</FormLabel>
              <Input 
                placeholder="Enter domain"
                value={agentQubeDetails.domain}
                bg="gray.700"
                borderColor="gray.600"
                color="gray.100"
                _placeholder={{ color: 'gray.500' }}
                onChange={(e) => setAgentQubeDetails(prev => ({
                  ...prev,
                  domain: e.target.value
                }))}
              />
            </FormControl>

            <FormControl>
              <FormLabel color="gray.300">Capabilities</FormLabel>
              <Textarea 
                placeholder="Enter agent capabilities"
                value={agentQubeDetails.capabilities}
                bg="gray.700"
                borderColor="gray.600"
                color="gray.100"
                _placeholder={{ color: 'gray.500' }}
                onChange={(e) => setAgentQubeDetails(prev => ({
                  ...prev,
                  capabilities: e.target.value
                }))}
              />
            </FormControl>

            <FormControl>
              <FormLabel color="gray.300">Specialization</FormLabel>
              <Input 
                placeholder="Enter specialization"
                value={agentQubeDetails.specialization}
                bg="gray.700"
                borderColor="gray.600"
                color="gray.100"
                _placeholder={{ color: 'gray.500' }}
                onChange={(e) => setAgentQubeDetails(prev => ({
                  ...prev,
                  specialization: e.target.value
                }))}
              />
            </FormControl>

            <FormControl>
              <FormLabel color="gray.300">Encryption Level</FormLabel>
              <Select
                value={agentQubeDetails.encryptionLevel}
                bg="gray.700"
                borderColor="gray.600"
                color="gray.100"
                _placeholder={{ color: 'gray.500' }}
                onChange={(e) => setAgentQubeDetails(prev => ({
                  ...prev,
                  encryptionLevel: e.target.value
                }))}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </Select>
            </FormControl>
          </VStack>
        );
      default:
        return null;
    }
  };

  return (
    <Box 
      p={5} 
      width="full" 
      maxWidth="800px" 
      margin="auto" 
      bg="gray.900"  
      color="gray.100"  
      borderRadius="lg"
      boxShadow="xl"
    >
      <VStack spacing={6} width="full">
        <Heading color="gray.100">Create iQube</Heading>

        {/* Qube Type Selection */}
        <HStack width="full" justifyContent="center">
          {(['DataQube', 'ContentQube', 'AgentQube'] as const).map((type) => (
            <Button
              key={type}
              variant={activeTokenType === type ? 'solid' : 'outline'}
              colorScheme={activeTokenType === type ? 'teal' : 'gray'}
              bg={activeTokenType === type ? 'teal.600' : 'gray.700'}
              color={activeTokenType === type ? 'white' : 'gray.300'}
              _hover={{
                bg: activeTokenType === type ? 'teal.700' : 'gray.600',
                color: activeTokenType === type ? 'white' : 'gray.200'
              }}
              onClick={() => setActiveTokenType(type)}
            >
              {type}
            </Button>
          ))}
        </HStack>

        {/* Base Qube Details */}
        <Box 
          width="full" 
          bg="gray.800" 
          p={4} 
          borderRadius="md"
          borderWidth="1px"
          borderColor="gray.700"
        >
          <Text fontSize="lg" fontWeight="bold" mb={4} color="gray.200">Base iQube Details</Text>
          {renderMetaQubeBaseDetails()}
        </Box>

        {/* Specific Qube Type Details */}
        <Box 
          width="full" 
          bg="gray.800" 
          p={4} 
          borderRadius="md"
          borderWidth="1px"
          borderColor="gray.700"
        >
          <Text fontSize="lg" fontWeight="bold" mb={4} color="gray.200">{activeTokenType} Details</Text>
          {renderQubeTypeDetails()}
        </Box>

        {/* Mint Button */}
        <Button 
          colorScheme="teal" 
          size="lg" 
          width="full" 
          bg="teal.600"
          color="white"
          _hover={{
            bg: 'teal.700'
          }}
          onClick={mintQube}
          isDisabled={!web3 || !account}
        >
          Mint {activeTokenType}
        </Button>
      </VStack>
    </Box>
  );
};

export default IQubeCreatingPanel;
