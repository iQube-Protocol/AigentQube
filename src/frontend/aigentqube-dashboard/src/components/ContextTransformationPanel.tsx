import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Text, 
  VStack, 
  HStack, 
  Button, 
  useToast,
  Input,
  Stat, 
  StatLabel, 
  StatNumber, 
  StatHelpText, 
  StatArrow,
  Grid, 
  GridItem 
} from '@chakra-ui/react';
import { OrchestrationAgent } from '../services/OrchestrationAgent';
import { iQubeService } from '../services/iQubeService';
import { blockchainService } from '../services/BlockchainService';
import { 
  IQubeTemplate, 
  MetaQube, 
  DataQube, 
  IQubeType 
} from '../types/iQube';
import { SpecializedDomain } from '../types/domains';

interface ContextTransformationPanelProps {
  context?: {
    specializedState?: SpecializedDomain;
    iQubeData?: MetaQube;
  };
  onPromptInsert?: (prompt: string) => void;
  orchestrationAgent?: OrchestrationAgent;
}

interface ContextInsight {
  label: string;
  value: string | number;
  category: string;
  trend?: 'increase' | 'decrease';
  trendPercentage?: number;
}

const ContextTransformationPanel: React.FC<ContextTransformationPanelProps> = ({ 
  context,
  onPromptInsert,
  orchestrationAgent
}) => {
  console.log('ContextTransformationPanel - Rendering');
  console.log('Props received:', { context, onPromptInsert, orchestrationAgent });

  const [iQubeTemplate, setIQubeTemplate] = useState<IQubeTemplate | null>(null);
  const [populatedIQube, setPopulatedIQube] = useState<MetaQube | null>(null);
  const [recommendedActions, setRecommendedActions] = useState<any[]>([]);
  const [contextInsights, setContextInsights] = useState<ContextInsight[]>([]);
  const [selectedTokenId, setSelectedTokenId] = useState<string>('');
  const toast = useToast();

  const safeSetState = <T,>(setter: React.Dispatch<React.SetStateAction<T>>) => 
    (value: T) => {
      try {
        setter(value);
      } catch (error) {
        console.error('Error setting state:', error);
        toast({
          title: 'State Update Error',
          description: error instanceof Error ? error.message : 'Unknown error',
          status: 'error',
          duration: 3000,
          isClosable: true
        });
      }
    };

  const createDomainIQubeTemplate = async (type: IQubeType = 'DataQube') => {
    console.log('Attempting to create iQube Template:', type);
    
    try {
      const template = await iQubeService.createIQubeTemplate(type);
      console.log('iQube Template created:', template);
      
      safeSetState(setIQubeTemplate)(template);

      toast({
        title: `${type} iQube Template Created`,
        description: "Ready to populate with context-specific data",
        status: "success",
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error('Template Creation Error:', error);
      toast({
        title: "Template Creation Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        status: "error",
        duration: 5000,
        isClosable: true
      });
    }
  };

  const populateIQubeWithContext = async () => {
    console.log('Attempting to populate iQube with context');
    
    if (!iQubeTemplate || !context?.specializedState) {
      console.error('Insufficient data to populate iQube');
      return;
    }

    const domainContextMap = {
      [SpecializedDomain.CRYPTO_ANALYST]: {
        personalFinance: {
          cryptoInvestments: ['Bitcoin', 'Ethereum', 'Solana'],
          riskTolerance: 7
        },
        professionalBackground: {
          domain: 'Blockchain Analysis',
          expertise: 'Cryptocurrency Market Research'
        }
      },
      [SpecializedDomain.AI_COACH]: {
        aiModelTraining: {
          modelTypes: ['Transformer', 'GAN', 'Reinforcement Learning'],
          trainingDatasets: ['ImageNet', 'BERT Corpus']
        },
        professionalBackground: {
          domain: 'AI Strategy Consulting',
          expertise: 'Machine Learning Model Development'
        }
      }
    };

    const contextData = domainContextMap[context.specializedState] || {};

    try {
      const populated = await iQubeService.populateIQubeTemplate(
        iQubeTemplate, 
        contextData
      );
      console.log('iQube populated:', populated);
      
      safeSetState(setPopulatedIQube)(populated);

      // Process iQube context in OrchestrationAgent
      if (orchestrationAgent) {
        await orchestrationAgent.processIQubeContext({
          type: populated.iQubeType,
          description: `${context.specializedState} Context iQube`,
          performanceMetrics: {
            complexityHandling: 8,
            accuracyRate: 0.9,
            responseTime: 2500
          }
        });

        // Get context-aware recommendations
        const recommendations = orchestrationAgent.getIQubeContextAwarePrompts({
          type: populated.iQubeType,
          description: `${context.specializedState} Context iQube`
        });

        safeSetState(setRecommendedActions)(recommendations);
      }

      toast({
        title: "iQube Populated Successfully",
        description: "Context-specific iQube created and processed",
        status: "success",
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error('iQube Population Error:', error);
      toast({
        title: "iQube Population Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        status: "error",
        duration: 5000,
        isClosable: true
      });
    }
  };

  const encryptIQube = async () => {
    console.log('Attempting to encrypt iQube');
    
    if (!populatedIQube) {
      console.error('No iQube to encrypt');
      return;
    }

    try {
      const encryptedBlakQube = await iQubeService.encryptBlakQube(
        (populatedIQube as DataQube).blakQube
      );
      console.log('iQube encrypted:', encryptedBlakQube);

      toast({
        title: "iQube Encrypted",
        description: "BlakQube payload successfully encrypted",
        status: "success",
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error('Encryption Error:', error);
      toast({
        title: "Encryption Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        status: "error",
        duration: 5000,
        isClosable: true
      });
    }
  };

  const generateContextInsights = (iQube: MetaQube): ContextInsight[] => {
    console.log('Generating context insights for iQube:', iQube);
    
    // Mock insights generation based on iQube type and metadata
    const baseInsights: ContextInsight[] = [
      {
        label: 'Sensitivity Score',
        value: iQube.sensitivity.value,
        category: 'Risk Assessment',
        trend: iQube.sensitivity.value > 5 ? 'increase' : 'decrease',
        trendPercentage: Math.abs(iQube.sensitivity.value - 5) * 10
      },
      {
        label: 'Verifiability',
        value: iQube.verifiability.value,
        category: 'Data Quality',
        trend: iQube.verifiability.value > 7 ? 'increase' : 'decrease',
        trendPercentage: Math.abs(iQube.verifiability.value - 7) * 10
      },
      {
        label: 'Accuracy',
        value: iQube.accuracy.value,
        category: 'Performance Metric',
        trend: iQube.accuracy.value > 6 ? 'increase' : 'decrease',
        trendPercentage: Math.abs(iQube.accuracy.value - 6) * 10
      }
    ];

    // Additional insights based on iQube type
    const typeSpecificInsights: Record<IQubeType, ContextInsight[]> = {
      'DataQube': [
        {
          label: 'Data Complexity',
          value: 'Medium',
          category: 'Structural Analysis',
          trend: 'increase'
        }
      ],
      'ContentQube': [
        {
          label: 'Content Type',
          value: 'Mixed Media',
          category: 'Content Composition',
          trend: 'increase'
        }
      ],
      'AgentQube': [
        {
          label: 'Agent Capability',
          value: 'Advanced',
          category: 'Performance Potential',
          trend: 'increase'
        }
      ]
    };

    return [
      ...baseInsights,
      ...(typeSpecificInsights[iQube.iQubeType] || [])
    ];
  };

  const handleTokenIdSelection = async () => {
    console.log('Attempting to select Token ID:', selectedTokenId);
    
    try {
      // Mock iQube retrieval - replace with actual blockchain service call
      const mockIQubes: Record<string, MetaQube> = {
        'IQUBE-A1B2C3': {
          iQubeIdentifier: 'IQUBE-A1B2C3',
          iQubeCreator: '0x742d35Cc6634C0532...',
          ownerType: 'Person',
          ownerIdentifiability: 'Identifiable',
          iQubeType: 'DataQube',
          transactionDate: new Date(),
          sensitivity: { value: 4, source: 'Initial Assessment' },
          verifiability: { value: 7, source: 'Data Source Validation' },
          accuracy: { value: 6, source: 'Initial Data Quality Check' },
          risk: { value: 3, source: 'Preliminary Risk Analysis' }
        },
        'IQUBE-D4E5F6': {
          iQubeIdentifier: 'IQUBE-D4E5F6',
          iQubeCreator: '0x123456789...',
          ownerType: 'Organization',
          ownerIdentifiability: 'Semi-Identifiable',
          iQubeType: 'AgentQube',
          transactionDate: new Date(),
          sensitivity: { value: 6, source: 'Comprehensive Risk Assessment' },
          verifiability: { value: 8, source: 'Multi-Source Validation' },
          accuracy: { value: 7, source: 'Advanced Performance Metrics' },
          risk: { value: 4, source: 'Detailed Risk Analysis' }
        }
      };

      console.log('Available mock iQubes:', Object.keys(mockIQubes));

      const selectedIQube = mockIQubes[selectedTokenId];
      
      if (!selectedIQube) {
        console.error(`No iQube found for Token ID: ${selectedTokenId}`);
        toast({
          title: "Invalid Token ID",
          description: "No iQube found for the given Token ID",
          status: "error",
          duration: 3000,
          isClosable: true
        });
        return;
      }

      console.log('Selected iQube:', selectedIQube);

      // Generate context insights
      const insights = generateContextInsights(selectedIQube);
      console.log('Generated Insights:', insights);
      
      safeSetState(setContextInsights)(insights);

      // Process iQube context in OrchestrationAgent
      if (orchestrationAgent) {
        await orchestrationAgent.processIQubeContext({
          type: selectedIQube.iQubeType,
          description: `iQube ${selectedTokenId} Context`,
          performanceMetrics: {
            complexityHandling: selectedIQube.sensitivity.value,
            accuracyRate: selectedIQube.accuracy.value / 10,
            responseTime: 3000
          }
        });
      }

      toast({
        title: "iQube Context Loaded",
        description: `Insights generated for iQube ${selectedTokenId}`,
        status: "success",
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error('Token ID Selection Error:', error);
      toast({
        title: "Context Loading Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        status: "error",
        duration: 5000,
        isClosable: true
      });
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      {/* Token ID Input and Selection */}
      <Box p={4} borderWidth="1px" borderRadius="lg">
        <HStack>
          <Input 
            placeholder="Enter iQube Token ID" 
            value={selectedTokenId}
            onChange={(e) => safeSetState(setSelectedTokenId)(e.target.value)}
          />
          <Button 
            onClick={handleTokenIdSelection} 
            colorScheme="blue"
          >
            Load iQube Context
          </Button>
        </HStack>
      </Box>

      {/* Context Insights Rendering */}
      {contextInsights.length > 0 && (
        <Box p={4} borderWidth="1px" borderRadius="lg">
          <Text fontSize="xl" mb={4}>Current Context Insights</Text>
          <Grid templateColumns="repeat(3, 1fr)" gap={4}>
            {contextInsights.map((insight, index) => (
              <GridItem key={index}>
                <Stat 
                  bg="gray.100" 
                  p={4} 
                  borderRadius="lg"
                >
                  <StatLabel>{insight.label}</StatLabel>
                  <StatNumber>{insight.value}</StatNumber>
                  <StatHelpText>
                    {insight.trend && (
                      <StatArrow 
                        type={insight.trend === 'increase' ? 'increase' : 'decrease'}
                      />
                    )}
                    {insight.trend && `${insight.trendPercentage}%`} {insight.category}
                  </StatHelpText>
                </Stat>
              </GridItem>
            ))}
          </Grid>
        </Box>
      )}

      <Box p={4} borderWidth="1px" borderRadius="lg">
        <Text fontSize="xl" mb={4}>
          Context Transformation: {context?.specializedState || 'General'}
        </Text>

        <HStack spacing={3}>
          <Button 
            onClick={() => createDomainIQubeTemplate(
              context?.specializedState === SpecializedDomain.CRYPTO_ANALYST 
                ? 'DataQube' 
                : 'AgentQube'
            )}
            colorScheme="blue"
          >
            Create iQube Template
          </Button>

          {iQubeTemplate && (
            <Button 
              onClick={populateIQubeWithContext} 
              colorScheme="green"
            >
              Populate iQube
            </Button>
          )}

          {populatedIQube && (
            <Button 
              onClick={encryptIQube} 
              colorScheme="purple"
            >
              Encrypt iQube
            </Button>
          )}
        </HStack>
      </Box>

      {recommendedActions.length > 0 && (
        <Box p={4} borderWidth="1px" borderRadius="lg">
          <Text fontSize="lg" mb={3}>Recommended Actions</Text>
          {recommendedActions.map((action, index) => (
            <Button 
              key={index} 
              variant="outline" 
              mb={2} 
              width="full"
              onClick={() => onPromptInsert?.(action.prompt)}
            >
              {action.action}
            </Button>
          ))}
        </Box>
      )}
    </VStack>
  );
};

export default ContextTransformationPanel;
