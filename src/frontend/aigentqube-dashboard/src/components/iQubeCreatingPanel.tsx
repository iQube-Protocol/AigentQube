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
  useToast 
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
      if (!web3 || !account) {
        throw new Error('Web3 or wallet not connected');
      }

      const timestamp = Date.now().toString();
      const nonce = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      
      // Generate unique identifier for the Qube using Web3
      const encodedParams = web3.eth.abi.encodeParameters(
        ['address', 'uint256', 'string'],
        [account, timestamp, nonce]
      );
      const qubeHash = web3.utils.sha3(encodedParams) || '';
      console.log('Generated hash:', qubeHash);
      
      // Generate a deterministic address for the Qube
      const qubeAddress = await generateQubeAddress(account, qubeHash);
      console.log('Generated Qube address:', qubeAddress);
      
      const metaQubeDetails: MetaQubeDetails = {
        name: baseQubeDetails.name,
        description: baseQubeDetails.description,
        creator: account,
        encryptionLevel: 'High',
        ownerType: baseQubeDetails.ownerType,
        ownerIdentifiability: baseQubeDetails.ownerIdentifiability,
        customAddress: qubeAddress,
        customHash: qubeHash,
        transactionDate: parseInt(timestamp),
        sensitivityScore: baseQubeDetails.sensitivityScore,
        verifiabilityScore: baseQubeDetails.verifiabilityScore,
        accuracyScore: baseQubeDetails.accuracyScore,
        riskScore: baseQubeDetails.riskScore
      };

      console.log('Minting with details:', {
        type: activeTokenType,
        address: qubeAddress,
        hash: qubeHash,
        meta: metaQubeDetails
      });

      // Call registerQube with Web3
      const receipt = await registerQube(
        activeTokenType,
        qubeAddress,
        qubeHash,
        account,
        metaQubeDetails
      );

      console.log('Minting successful:', receipt);
      toast({
        title: 'Success',
        description: 'iQube minted successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

    } catch (error: any) {
      console.error('Minting error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to mint iQube',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Render method for MetaQube base details
  const renderMetaQubeBaseDetails = () => (
    <VStack spacing={4} width="full">
      <FormControl isRequired>
        <FormLabel>iQube Name</FormLabel>
        <Input 
          placeholder="Enter iQube Name"
          value={baseQubeDetails.name}
          onChange={(e) => setBaseQubeDetails(prev => ({
            ...prev,
            name: e.target.value
          }))}
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Creator</FormLabel>
        <Input 
          value={baseQubeDetails.creator}
          isReadOnly
        />
      </FormControl>

      <FormControl>
        <FormLabel>Description</FormLabel>
        <Input 
          placeholder="Enter Description"
          value={baseQubeDetails.description}
          onChange={(e) => setBaseQubeDetails(prev => ({
            ...prev,
            description: e.target.value
          }))}
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Owner Type</FormLabel>
        <Select 
          value={baseQubeDetails.ownerType}
          onChange={(e) => setBaseQubeDetails(prev => ({
            ...prev,
            ownerType: e.target.value as 'Person' | 'Organization' | 'Thing'
          }))}
        >
          <option value="Person">Person</option>
          <option value="Organization">Organization</option>
          <option value="Thing">Thing</option>
        </Select>
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Owner Identifiability</FormLabel>
        <Select 
          value={baseQubeDetails.ownerIdentifiability}
          onChange={(e) => setBaseQubeDetails(prev => ({
            ...prev,
            ownerIdentifiability: e.target.value as 'Anon' | 'Semi-Anon' | 'Identifiable' | 'Semi-Identifiable'
          }))}
        >
          <option value="Anon">Anonymous</option>
          <option value="Semi-Anon">Semi-Anonymous</option>
          <option value="Identifiable">Identifiable</option>
          <option value="Semi-Identifiable">Semi-Identifiable</option>
        </Select>
      </FormControl>

      {/* Scoring Fields */}
      <FormControl isRequired>
        <FormLabel>Sensitivity Score (1-10)</FormLabel>
        <Select 
          value={baseQubeDetails.sensitivityScore}
          onChange={(e) => setBaseQubeDetails(prev => ({
            ...prev,
            sensitivityScore: parseInt(e.target.value)
          }))}
        >
          {[...Array(10)].map((_, i) => (
            <option key={i+1} value={i+1}>{i+1}</option>
          ))}
        </Select>
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Verifiability Score (1-10)</FormLabel>
        <Select 
          value={baseQubeDetails.verifiabilityScore}
          onChange={(e) => setBaseQubeDetails(prev => ({
            ...prev,
            verifiabilityScore: parseInt(e.target.value)
          }))}
        >
          {[...Array(10)].map((_, i) => (
            <option key={i+1} value={i+1}>{i+1}</option>
          ))}
        </Select>
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Accuracy Score (1-10)</FormLabel>
        <Select 
          value={baseQubeDetails.accuracyScore}
          onChange={(e) => setBaseQubeDetails(prev => ({
            ...prev,
            accuracyScore: parseInt(e.target.value)
          }))}
        >
          {[...Array(10)].map((_, i) => (
            <option key={i+1} value={i+1}>{i+1}</option>
          ))}
        </Select>
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Risk Score (1-10)</FormLabel>
        <Select 
          value={baseQubeDetails.riskScore}
          onChange={(e) => setBaseQubeDetails(prev => ({
            ...prev,
            riskScore: parseInt(e.target.value)
          }))}
        >
          {[...Array(10)].map((_, i) => (
            <option key={i+1} value={i+1}>{i+1}</option>
          ))}
        </Select>
      </FormControl>
    </VStack>
  );

  // Existing render methods for specific Qube types...
  // (renderDataQubeForm, renderContentQubeForm, renderAgentQubeForm)
  // would be updated similarly to include more comprehensive details

  const renderTokenTypeSelector = () => (
    <div className="grid grid-cols-3 gap-2 mb-4">
      {['DataQube', 'ContentQube', 'AgentQube'].map(type => (
        <button
          key={type}
          onClick={() => setActiveTokenType(type as any)}
          className={`
            py-2 rounded transition-all duration-300 ease-in-out
            ${activeTokenType === type 
              ? 'bg-[#047857] text-white' 
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}
          `}
        >
          {type}
        </button>
      ))}
    </div>
  );

  const renderDataQubeForm = () => (
    <div className="space-y-4">
      {/* First Row: iQube Type and Encryption Level */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-700 p-2 rounded">
          <span className="text-gray-400 block text-xs">iQube Type</span>
          <select 
            value={dataQubeDetails.iQubeType}
            onChange={(e) => setDataQubeDetails(prev => ({ ...prev, iQubeType: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded"
          >
            <option value="DataQube">DataQube</option>
          </select>
        </div>
        <div className="bg-gray-700 p-2 rounded">
          <span className="text-gray-400 block text-xs">Encryption Level</span>
          <select 
            value={dataQubeDetails.encryptionLevel}
            onChange={(e) => setDataQubeDetails(prev => ({ ...prev, encryptionLevel: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded"
          >
            <option value="Standard">Standard</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>

      {/* Data Points with Add Button */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="text-white">Data Points</h4>
          <button 
            onClick={() => setDataQubeDetails(prev => ({
              ...prev,
              dataPoints: [...prev.dataPoints, { name: '', value: '', source: '' }]
            }))}
            className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700"
          >
            +
          </button>
        </div>
        {dataQubeDetails.dataPoints.map((point, index) => (
          <div key={index} className="grid grid-cols-3 gap-2">
            <input 
              placeholder="Data Point Name"
              className="bg-gray-800 text-white p-2 rounded"
            />
            <input 
              placeholder="Data Point Value"
              className="bg-gray-800 text-white p-2 rounded"
            />
            <input 
              placeholder="Source"
              className="bg-gray-800 text-white p-2 rounded"
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderContentQubeForm = () => (
    <div className="space-y-4">
      {/* First Row: Content Type and Usage Rights */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-700 p-2 rounded">
          <span className="text-gray-400 block text-xs">Content Type</span>
          <select 
            value={contentQubeDetails.contentType}
            onChange={(e) => setContentQubeDetails(prev => ({ ...prev, contentType: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded"
          >
            <option>Document</option>
            <option>Image</option>
            <option>Video</option>
          </select>
        </div>
        <div className="bg-gray-700 p-2 rounded">
          <span className="text-gray-400 block text-xs">Usage Rights</span>
          <select 
            value={contentQubeDetails.usageRights}
            onChange={(e) => setContentQubeDetails(prev => ({ ...prev, usageRights: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded"
          >
            <option>Private</option>
            <option>Shared</option>
            <option>Public</option>
          </select>
        </div>
      </div>

      {/* Second Row: Browse/Upload and Access Level */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-700 p-2 rounded">
          <span className="text-gray-400 block text-xs">Upload Content</span>
          <input 
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setContentQubeDetails(prev => ({
                  ...prev,
                  uploadedFile: file,
                  filePreview: URL.createObjectURL(file)
                }));
              }
            }}
            className="w-full bg-gray-800 text-white rounded"
          />
        </div>
        <div className="bg-gray-700 p-2 rounded">
          <span className="text-gray-400 block text-xs">Access Level</span>
          <select 
            value={contentQubeDetails.accessLevel}
            onChange={(e) => setContentQubeDetails(prev => ({ ...prev, accessLevel: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded"
          >
            <option>Read</option>
            <option>Write</option>
            <option>Execute</option>
          </select>
        </div>
      </div>

      {/* File Preview */}
      {contentQubeDetails.filePreview && (
        <div className="mt-4 bg-gray-700 p-2 rounded">
          <span className="text-gray-400 block text-xs mb-2">File Preview</span>
          <img 
            src={contentQubeDetails.filePreview} 
            alt="Uploaded Content" 
            className="max-w-full h-auto rounded"
          />
        </div>
      )}
    </div>
  );

  const renderAgentQubeForm = () => (
    <div className="space-y-4">
      {/* First Row: iQube Type and Encryption Level */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-700 p-2 rounded">
          <span className="text-gray-400 block text-xs">iQube Type</span>
          <select 
            value={agentQubeDetails.iQubeType}
            onChange={(e) => setAgentQubeDetails(prev => ({ ...prev, iQubeType: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded"
          >
            <option>AgentQube</option>
          </select>
        </div>
        <div className="bg-gray-700 p-2 rounded">
          <span className="text-gray-400 block text-xs">Encryption Level</span>
          <select 
            value={agentQubeDetails.encryptionLevel}
            onChange={(e) => setAgentQubeDetails(prev => ({ ...prev, encryptionLevel: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded"
          >
            <option>High</option>
            <option>Standard</option>
          </select>
        </div>
      </div>

      {/* API Key Row */}
      <div className="bg-gray-700 p-2 rounded">
        <span className="text-gray-400 block text-xs">API Key</span>
        <input 
          type="text"
          value={agentQubeDetails.apiKey}
          onChange={(e) => setAgentQubeDetails(prev => ({ ...prev, apiKey: e.target.value }))}
          placeholder="Generate or Enter API Key"
          className="w-full bg-gray-800 text-white p-2 rounded"
        />
      </div>

      {/* Remaining Rows */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-700 p-2 rounded">
          <span className="text-gray-400 block text-xs">Name</span>
          <input 
            type="text"
            value={agentQubeDetails.name}
            onChange={(e) => setAgentQubeDetails(prev => ({ ...prev, name: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded p-2"
          />
        </div>
        <div className="bg-gray-700 p-2 rounded">
          <span className="text-gray-400 block text-xs">Domain</span>
          <input 
            type="text"
            value={agentQubeDetails.domain}
            onChange={(e) => setAgentQubeDetails(prev => ({ ...prev, domain: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded p-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-700 p-2 rounded">
          <span className="text-gray-400 block text-xs">Capabilities</span>
          <input 
            type="text"
            value={agentQubeDetails.capabilities}
            onChange={(e) => setAgentQubeDetails(prev => ({ ...prev, capabilities: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded p-2"
          />
        </div>
        <div className="bg-gray-700 p-2 rounded">
          <span className="text-gray-400 block text-xs">Specialization</span>
          <input 
            type="text"
            value={agentQubeDetails.specialization}
            onChange={(e) => setAgentQubeDetails(prev => ({ ...prev, specialization: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded p-2"
          />
        </div>
      </div>

      <div className="bg-gray-700 p-2 rounded">
        <span className="text-gray-400 block text-xs">Integrations</span>
        <input 
          type="text"
          value={agentQubeDetails.integrations}
          onChange={(e) => setAgentQubeDetails(prev => ({ ...prev, integrations: e.target.value }))}
          className="w-full bg-gray-800 text-white rounded p-2"
        />
      </div>
    </div>
  );

  const renderActiveTokenForm = () => {
    switch(activeTokenType) {
      case 'DataQube': return renderDataQubeForm();
      case 'ContentQube': return renderContentQubeForm();
      case 'AgentQube': return renderAgentQubeForm();
      default: return null;
    }
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg">
      <VStack spacing={4} align="stretch">
        <Button
          colorScheme="blue"
          onClick={mintQube}
          isDisabled={!web3 || !account}
        >
          Mint Test DataQube
        </Button>
        
        {/* Display current DataQube details */}
        <Box p={4} bg="gray.50" borderRadius="md">
          <Text fontWeight="bold">Current DataQube Details:</Text>
          <Text>Name: {baseQubeDetails.name}</Text>
          <Text>Creator: {baseQubeDetails.creator}</Text>
          <Text>Type: {dataQubeDetails.iQubeType}</Text>
          <Text>Encryption: {dataQubeDetails.encryptionLevel}</Text>
        </Box>
        
        {/* Connection Status */}
        <Box p={4} bg={web3 && account ? "green.50" : "red.50"} borderRadius="md">
          <Text>Wallet Status: {web3 && account ? 'Connected' : 'Not Connected'}</Text>
          <Text>Network: Polygon Amoy Testnet</Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default IQubeCreatingPanel;
