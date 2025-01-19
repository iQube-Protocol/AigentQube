import React, { useState, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  Text,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Textarea,
  Checkbox
} from '@chakra-ui/react';
import { ethers } from 'ethers';
import { registerQube } from '../utils/contractInteraction';

// Types of Qubes
type QubeType = 'DataQube' | 'ContentQube' | 'AgentQube';

// Comprehensive Qube Registration Interface
interface QubeRegistrationProps {
  signer: ethers.Signer;
  onRegistrationComplete?: (qubeDetails: any) => void;
}

const QubeRegistrationPanel: React.FC<QubeRegistrationProps> = ({ 
  signer, 
  onRegistrationComplete 
}) => {
  const toast = useToast();
  const [activeQubeType, setActiveQubeType] = useState<QubeType>('DataQube');
  
  // Shared Qube Registration State
  const [baseQubeDetails, setBaseQubeDetails] = useState({
    name: '',
    description: '',
    encryptionLevel: 'Standard',
    customAddress: '',
    customHash: ''
  });

  // Type-Specific Details
  const [dataQubeDetails, setDataQubeDetails] = useState({
    dataPoints: [{ name: '', value: '', source: '' }],
    dataCategories: [] as string[]
  });

  const [contentQubeDetails, setContentQubeDetails] = useState({
    contentType: '',
    usageRights: '',
    fileHash: '',
    accessLevel: 'Private'
  });

  const [agentQubeDetails, setAgentQubeDetails] = useState({
    domain: '',
    capabilities: '',
    apiIntegrations: [] as string[],
    specialization: ''
  });

  // Dynamic Data Point Management
  const addDataPoint = () => {
    setDataQubeDetails(prev => ({
      ...prev,
      dataPoints: [...prev.dataPoints, { name: '', value: '', source: '' }]
    }));
  };

  // Comprehensive Validation
  const validateRegistration = () => {
    const { name, description, encryptionLevel } = baseQubeDetails;
    
    if (!name || !description) {
      toast({
        title: "Validation Error",
        description: "Name and Description are required",
        status: "error"
      });
      return false;
    }

    // Add more specific validations based on Qube type
    switch (activeQubeType) {
      case 'DataQube':
        if (dataQubeDetails.dataPoints.length === 0) {
          toast({
            title: "Validation Error",
            description: "At least one data point is required",
            status: "error"
          });
          return false;
        }
        break;
      case 'ContentQube':
        if (!contentQubeDetails.contentType) {
          toast({
            title: "Validation Error",
            description: "Content Type is required",
            status: "error"
          });
          return false;
        }
        break;
      case 'AgentQube':
        if (!agentQubeDetails.domain) {
          toast({
            title: "Validation Error",
            description: "Agent Domain is required",
            status: "error"
          });
          return false;
        }
        break;
    }

    return true;
  };

  // Registration Handler
  const handleQubeRegistration = async () => {
    if (!validateRegistration()) return;

    try {
      // Prepare comprehensive Qube details
      const qubeDetails = {
        type: activeQubeType,
        baseDetails: baseQubeDetails,
        typeSpecificDetails: 
          activeQubeType === 'DataQube' ? dataQubeDetails :
          activeQubeType === 'ContentQube' ? contentQubeDetails :
          agentQubeDetails
      };

      // Generate address/hash if not provided
      const qubeAddress = baseQubeDetails.customAddress || 
        ethers.Wallet.createRandom().address;
      
      const qubeHash = baseQubeDetails.customHash || 
        ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(qubeDetails)));

      // Blockchain Registration
      const receipt = await registerQube(
        activeQubeType, 
        qubeAddress, 
        qubeHash, 
        signer
      );

      // Success Handling
      toast({
        title: "Qube Registered Successfully",
        description: `${activeQubeType} registered at ${qubeAddress}`,
        status: "success"
      });

      // Optional callback for parent component
      onRegistrationComplete?.(qubeDetails);

    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error"
      });
    }
  };

  // Render Qube Type Specific Form
  const renderQubeTypeForm = () => {
    switch (activeQubeType) {
      case 'DataQube':
        return (
          <VStack spacing={4}>
            {dataQubeDetails.dataPoints.map((point, index) => (
              <HStack key={index} width="full">
                <Input 
                  placeholder="Data Point Name"
                  value={point.name}
                  onChange={(e) => {
                    const newPoints = [...dataQubeDetails.dataPoints];
                    newPoints[index].name = e.target.value;
                    setDataQubeDetails(prev => ({ ...prev, dataPoints: newPoints }));
                  }}
                />
                <Input 
                  placeholder="Data Point Value"
                  value={point.value}
                  onChange={(e) => {
                    const newPoints = [...dataQubeDetails.dataPoints];
                    newPoints[index].value = e.target.value;
                    setDataQubeDetails(prev => ({ ...prev, dataPoints: newPoints }));
                  }}
                />
              </HStack>
            ))}
            <Button onClick={addDataPoint} variant="outline">
              Add Data Point
            </Button>
          </VStack>
        );
      case 'ContentQube':
        return (
          <VStack spacing={4}>
            <Select 
              placeholder="Select Content Type"
              value={contentQubeDetails.contentType}
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
            <Textarea 
              placeholder="Usage Rights"
              value={contentQubeDetails.usageRights}
              onChange={(e) => setContentQubeDetails(prev => ({ 
                ...prev, 
                usageRights: e.target.value 
              }))}
            />
          </VStack>
        );
      case 'AgentQube':
        return (
          <VStack spacing={4}>
            <Input 
              placeholder="Agent Domain"
              value={agentQubeDetails.domain}
              onChange={(e) => setAgentQubeDetails(prev => ({ 
                ...prev, 
                domain: e.target.value 
              }))}
            />
            <Textarea 
              placeholder="Agent Capabilities"
              value={agentQubeDetails.capabilities}
              onChange={(e) => setAgentQubeDetails(prev => ({ 
                ...prev, 
                capabilities: e.target.value 
              }))}
            />
          </VStack>
        );
    }
  };

  return (
    <Box width="full" maxWidth="600px" margin="auto">
      <VStack spacing={6}>
        <Tabs 
          variant="soft-rounded" 
          colorScheme="green" 
          width="full"
          onChange={(index) => setActiveQubeType(['DataQube', 'ContentQube', 'AgentQube'][index] as QubeType)}
        >
          <TabList>
            <Tab>DataQube</Tab>
            <Tab>ContentQube</Tab>
            <Tab>AgentQube</Tab>
          </TabList>
        </Tabs>

        <VStack spacing={4} width="full">
          <FormControl>
            <FormLabel>Qube Name</FormLabel>
            <Input 
              placeholder="Enter Qube Name"
              value={baseQubeDetails.name}
              onChange={(e) => setBaseQubeDetails(prev => ({ 
                ...prev, 
                name: e.target.value 
              }))}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Description</FormLabel>
            <Textarea 
              placeholder="Describe your Qube"
              value={baseQubeDetails.description}
              onChange={(e) => setBaseQubeDetails(prev => ({ 
                ...prev, 
                description: e.target.value 
              }))}
            />
          </FormControl>

          {renderQubeTypeForm()}

          <Button 
            colorScheme="green" 
            width="full" 
            onClick={handleQubeRegistration}
          >
            Register {activeQubeType}
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
};

export default QubeRegistrationPanel;
