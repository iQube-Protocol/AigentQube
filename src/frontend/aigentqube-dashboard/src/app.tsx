import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from './components/DashboardLayout';
import { ContextManager } from './components/ContextManager';
import ContextTransformationPanel from './components/ContextTransformationPanel';
import IQubeCreatingPanel from './components/iQubeCreatingPanel';
import { OrchestrationAgent } from './services/OrchestrationAgent';
import { 
  ChakraProvider, 
  Box, 
  VStack as ChakraVStack, 
  Grid, 
  Text,
  extendTheme as chakraExtendTheme,
  useToast
} from '@chakra-ui/react';
import AgentEvolutionPanel from './components/AgentEvolutionPanel';
import { IQubeOperationsPanel } from './components/IQubeOperationsPanel';
import { IQubeData } from './types/context';
import { ErrorBoundary } from './components/ErrorBoundary';
import { APIIntegrationManager } from './services/api/APIIntegrationManager';
import { OpenAIIntegration } from './services/api/OpenAIIntegration';
import { MetisIntegration } from './services/api/MetisIntegration';
import { SpecializedDomainManager } from './services/SpecializedDomainManager';
import { NebulaIntegration } from './services/api/NebulaIntegration';

// Dependency Initialization
const initializeDependencies = () => {
  try {
    // Initialize API Integration Manager
    const apiManager = new APIIntegrationManager();

    // Initialize OpenAI Integration
    const openAIIntegration = new OpenAIIntegration({
      apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
      model: 'gpt-4',
      maxTokens: 2048
    });

    // Initialize Metis Integration with fallback
    const metisIntegration = new MetisIntegration({
      apiKey: process.env.REACT_APP_METIS_API_KEY || ''
    });

    const nebulaIntegration = new NebulaIntegration({
      apiKey: process.env.REACT_APP_NEBULA_SECRET_KEY || ''
    })

    // Initialize Specialized Domain Manager
    const domainManager = new SpecializedDomainManager();

    return {
      apiManager, 
      openAIIntegration, 
      metisIntegration,
      nebulaIntegration, 
      domainManager
    };
  } catch (error) {
    console.error('Dependency Initialization Partial Failure:', error);
    // Return partial initialization to allow app to continue
    return {
      apiManager: new APIIntegrationManager(),
      openAIIntegration: null,
      metisIntegration: null,
      nebulaIntegration: null,
      domainManager: null
    };
  }
};

const theme = chakraExtendTheme({
  // Add any custom theme configurations here
});

// Debugging function to log all initialization steps
const initializationLogger = (step: string, details?: any) => {
  // console.group('🚀 Aigent Z Initialization');
  // console.log(`Step: ${step}`);
  // if (details) console.log('Details:', details);
  // console.groupEnd();
};

const App: React.FC = () => {
  const toast = useToast();
  
  // Initialize Orchestration Agent
  const [orchestrationAgent, setOrchestrationAgent] = useState<OrchestrationAgent | null>(null);
  const [isAgentReady, setIsAgentReady] = useState(false);
  const [agentStatus, setAgentStatus] = useState<{
    context: boolean;
    service: boolean;
    state: boolean;
  }>({
    context: false,
    service: false,
    state: false
  });
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [agentError, setAgentError] = useState<string | null>(null);

  // Context and Agent ID State
  const [context, setContext] = useState<Record<string, any>>({});
  const [agentId, setAgentId] = useState<string>('');
  const [iQubeData, setIQubeData] = useState<IQubeData | null>(null);

  // Shared state for domain coordination
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [domainContext, setDomainContext] = useState<Record<string, any>>({});
  const [isMetisReady, setIsMetisReady] = useState<boolean>(false);

  // Handle Context Updates with domain coordination
  const handleContextChange = useCallback((newContext: Record<string, any>) => {
    setContext(newContext);
    
    // Update domain context if it's a domain-related change
    if (newContext.specializedState) {
      setSelectedDomain(newContext.specializedState);
      setDomainContext((prevContext: Record<string, any>) => ({
        ...prevContext,
        domain: newContext.specializedState,
        metadata: newContext
      }));
    }
  }, []);

  const handleIQubeDataUpdate = (data: IQubeData | null) => {
    setIQubeData(data);
  };

  const initializeApplication = useCallback(async () => {
    try {
      initializationLogger('Starting Application Initialization');

      // Validate critical environment variables
      const requiredEnvVars = [
        'REACT_APP_OPENAI_API_KEY',
        'REACT_APP_METIS_API_KEY',
      ];

      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
      if (missingVars.length > 0) {
        console.warn(`Missing environment variables: ${missingVars.join(', ')}`);
      }

      initializationLogger('Environment Variables Validated');

      // Initialize dependencies with fallback
      const { 
        apiManager, 
        openAIIntegration, 
        metisIntegration,
        nebulaIntegration, 
        domainManager 
      } = initializeDependencies();

      // Create Orchestration Agent with API Manager
      const agent = new OrchestrationAgent(
        apiManager,
        openAIIntegration || undefined, 
        metisIntegration || undefined, 
        nebulaIntegration || undefined, 
        domainManager || undefined
      );

      // Set initialization state
      setIsAgentReady(false);
      setAgentStatus({
        context: false,
        service: false,
        state: false
      });

      try {
        const initializationTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Initialization timeout')), 30000)
        );

        await Promise.race([
          agent.initialize(),
          initializationTimeout
        ]);

        setOrchestrationAgent(agent);
        
        const serviceStatus = agent.getServiceStatus();

        setAgentStatus({
          context: serviceStatus.context.isActive,
          service: serviceStatus.service.isActive,
          state: serviceStatus.state.isActive
        });

        const isReady = serviceStatus.context.isActive && 
                       serviceStatus.service.isActive && 
                       serviceStatus.state.isActive;

        setIsAgentReady(isReady);

        // Only show warning if services are completely unavailable
        if (!serviceStatus.context.isActive && !serviceStatus.service.isActive) {
          toast({
            title: 'Service Unavailable',
            description: 'AI services are currently unavailable',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      } catch (initError) {
        console.error('[App] OrchestrationAgent Initialization Error:', initError);
        
        setOrchestrationAgent(agent);
        setIsAgentReady(false);
        setAgentStatus({
          context: false,
          service: false,
          state: false
        });

        const errorMessage = initError instanceof Error ? initError.message : String(initError);
        const shouldSuppress = /layer.*validation|initialization.*failed|configuration.*issue/i.test(errorMessage);

        if (!shouldSuppress) {
          toast({
            title: 'Service Error',
            description: 'Unable to initialize AI services',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      }

      initializationLogger('Application Initialization Complete');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('🔥 Initialization Encountered Issues:', errorMessage);
      setInitializationError(errorMessage);

      if (!/layer.*validation|initialization.*failed|configuration.*issue/i.test(errorMessage)) {
        toast({
          title: 'Critical Error',
          description: 'Unable to start application services',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top'
        });
      }
    }
  }, [toast]);

  useEffect(() => {
    initializeApplication();
  }, [initializeApplication]);

  useEffect(() => {
    if (orchestrationAgent) {
      const checkAgentStatus = () => {
        const serviceStatus = orchestrationAgent.getServiceStatus();
        setAgentStatus({
          context: serviceStatus.context.isActive,
          service: serviceStatus.service.isActive,
          state: serviceStatus.state.isActive
        });
      };

      checkAgentStatus();

      const statusInterval = setInterval(checkAgentStatus, 30000);

      return () => clearInterval(statusInterval);
    }
  }, [orchestrationAgent]);

  const checkAlignment = useCallback(async () => {
    try {
      if (orchestrationAgent) {
        if (typeof orchestrationAgent.validateLayerAlignment === 'function') {
          const isAligned = await orchestrationAgent.validateLayerAlignment();
          if (!isAligned) {
            console.warn('Layer misalignment detected');
          }
        } else {
          console.warn('OrchestrationAgent does not have a validateLayerAlignment method');
        }
      }
    } catch (error) {
      console.error('Alignment check failed:', error);
    }
  }, [orchestrationAgent]);

  useEffect(() => {
    if (orchestrationAgent) {
      checkAlignment();
      
      const interval = setInterval(checkAlignment, 60000);
      return () => clearInterval(interval);
    }
  }, [checkAlignment, orchestrationAgent]);

  const handleOrchestrationUpdate = useCallback((state: OrchestrationAgent) => {
    try {
      if (state?.context?.error || state?.service?.error || state?.state?.error) {
        const errors = [
          state?.context?.error,
          state?.service?.error,
          state?.state?.error
        ].filter(Boolean);

        const shouldSuppressError = (error: string): boolean => {
          const suppressPatterns = [
            /Layer alignment validation/i,
            /Agent Configuration/i,
            /Critical services not fully initialized/i,
            /initialization failed/i,
            /Initialization failed/i,
            /Layer validation/i,
            /alignment validation/i
          ];
          return suppressPatterns.some(pattern => pattern.test(error));
        };

        if (errors.some(error => error && !shouldSuppressError(error))) {
          toast({
            title: 'Service Error',
            description: 'sA critical service error has occurred',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      }
    } catch (error) {
      console.error('Orchestration update error:', error);
    }
  }, [toast]);

  useEffect(() => {
    if (orchestrationAgent) {
      if (typeof orchestrationAgent.subscribe === 'function') {
        try {
          const unsubscribe = orchestrationAgent.subscribe(handleOrchestrationUpdate);
          return () => {
            if (typeof unsubscribe === 'function') {
              unsubscribe();
            }
          };
        } catch (subscribeError) {
          console.error('Failed to subscribe to OrchestrationAgent:', subscribeError);
          toast({
            title: 'Subscription Error',
            description: 'Could not subscribe to agent updates',
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
        }
      } else {
        console.warn('OrchestrationAgent does not have a subscribe method');
        toast({
          title: 'Agent Configuration Issue',
          description: 'OrchestrationAgent lacks subscription capabilities',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  }, [orchestrationAgent, handleOrchestrationUpdate, toast]);

  if (initializationError) {
    return (
      <Box 
        height="100vh" 
        display="flex" 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center" 
        bg="red.50" 
        p={8}
      >
        <Text fontSize="2xl" color="red.600" mb={4}>
          Application Initialization Failed
        </Text>
        <Text color="red.500" textAlign="center">
          {initializationError}
        </Text>
        <Box mt={4}>
          <Text fontSize="sm" color="gray.500">
            Please check your configuration and try again.
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <ErrorBoundary 
      fallback={
        <Box 
          height="100vh" 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          bg="red.50"
        >
          <Text color="red.600">
            An unexpected error occurred. Please refresh the page.
          </Text>
        </Box>
      }
    >
      <ChakraProvider theme={theme}>
          <div className="App min-h-screen bg-gray-900 text-white">
            <DashboardLayout
              context={context}
              onContextChange={handleContextChange}
              agentId={agentId}
              orchestrationAgent={orchestrationAgent}
              isAgentReady={isAgentReady}
            >
              <Grid
                templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
                gap={6}
                p={4}
              >
                {/* Left Column */}
                <ChakraVStack spacing={6} align="stretch">
                  {isAgentReady && orchestrationAgent && (
                    <Box className="agent-evolution-container">
                      <AgentEvolutionPanel
                        context={{
                          specializedState: selectedDomain,
                          isSignedIn: true,
                          error: agentError,
                          isMetisReady
                        }}
                        onContextChange={handleContextChange}
                        agentId={agentId}
                        orchestrationAgent={orchestrationAgent}
                      />
                    </Box>
                  )}

                  {agentError && (
                    <Box p={4} bg="red.600" color="white" borderRadius="md">
                      <Text>Failed to initialize AI agent: {agentError}</Text>
                    </Box>
                  )}

                  {!isAgentReady && !agentError && (
                    <Box p={4} bg="gray.700" borderRadius="md">
                      <Text>Initializing AI agent...</Text>
                    </Box>
                  )}
                  <IQubeOperationsPanel
                    onIQubeDataUpdate={handleIQubeDataUpdate}
                    orchestrationAgent={orchestrationAgent}
                    onContextUpdate={setContext}
                  />
                </ChakraVStack>

                {/* Right Column */}
                <ChakraVStack spacing={6} align="stretch">
                  <ContextManager 
                    onContextChange={handleContextChange}
                  />
                  <ContextTransformationPanel 
                    orchestrationAgent={isAgentReady ? orchestrationAgent : undefined}
                    context={{
                      specializedState: 'Aigent Z',
                      isSignedIn: true,
                      error: agentError,
                      iQubeData: iQubeData
                    }}
                  />
                  <IQubeCreatingPanel />
                </ChakraVStack>
              </Grid>
            </DashboardLayout>
          </div>
      </ChakraProvider>
    </ErrorBoundary>
  );
};

export default App;
