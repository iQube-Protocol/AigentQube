import React, { useState, useEffect, useCallback, useRef } from 'react';
import Web3 from 'web3';
import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import DashboardLayout from './components/DashboardLayout';
import { ContextManager } from './components/ContextManager';
import ContextTransformationPanel from './components/ContextTransformationPanel';
import IQubeCreatingPanel from './components/iQubeCreatingPanel';
import { BlockchainWalletStatus } from './components/BlockchainComponents';
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

    // Initialize Specialized Domain Manager
    const domainManager = new SpecializedDomainManager();

    // Attempt to register services with API Manager
    try {
      apiManager.registerAPI(openAIIntegration);
      apiManager.registerAPI(metisIntegration);
    } catch (error) {
      console.warn('Failed to register services with API Manager:', error);
    }

    return {
      apiManager, 
      openAIIntegration, 
      metisIntegration, 
      domainManager
    };
  } catch (error) {
    console.error('Dependency Initialization Partial Failure:', error);
    // Return partial initialization to allow app to continue
    return {
      apiManager: new APIIntegrationManager(),
      openAIIntegration: null,
      metisIntegration: null,
      domainManager: null
    };
  }
};

declare global {
  interface Window {
    ethereum?: any;
  }
}

// Web3 Library Configuration
function getLibrary(provider: any): Web3Provider {
  return new Web3Provider(provider);
}

const theme = chakraExtendTheme({
  // Add any custom theme configurations here
});

// Debugging function to log all initialization steps
const initializationLogger = (step: string, details?: any) => {
  console.group('🚀 AigentQube Initialization');
  console.log(`Step: ${step}`);
  if (details) console.log('Details:', details);
  console.groupEnd();
};

const App: React.FC = () => {
  // Debug environment variables in component
  console.log('App component mounted. Environment check:', {
    OPENAI_KEY: process.env.REACT_APP_OPENAI_API_KEY?.substring(0, 10) + '...',
    NODE_ENV: process.env.NODE_ENV
  });

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
  
  // Web3 and Wallet State
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastConnectionAttemptRef = useRef<number>(0);
  const DEBOUNCE_DELAY = 1000; // 1 second debounce
  const CONNECTION_TIMEOUT = 30000; // 30 second timeout

  // Context and Agent ID State
  const [context, setContext] = useState<Record<string, any>>({});
  const [agentId, setAgentId] = useState<string>('');
  const [iQubeData, setIQubeData] = useState<IQubeData | null>(null);

  // Shared state for domain coordination
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [domainContext, setDomainContext] = useState<Record<string, any>>({});
  const [isMetisReady, setIsMetisReady] = useState<boolean>(false);

  // Switch to Amoy Network
  const switchToAmoyNetwork = async () => {
    if (!window.ethereum) {
      toast({
        title: 'MetaMask Not Found',
        description: 'Please install MetaMask to use this application',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x13882' }], // 80002 in hex
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x13882',
              chainName: 'Polygon Amoy Testnet',
              nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
              rpcUrls: ['https://rpc-amoy.polygon.technology'],
              blockExplorerUrls: ['https://www.oklink.com/amoy']
            }]
          });
        } catch (addError) {
          console.error('Error adding Amoy network:', addError);
          toast({
            title: 'Network Error',
            description: 'Failed to add Amoy network to MetaMask',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      } else {
        console.error('Error switching to Amoy network:', switchError);
        toast({
          title: 'Network Error',
          description: 'Failed to switch to Amoy network',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  // Initialize Web3 and connect wallet
  const initializeWeb3 = useCallback(async () => {
    // If already connected or connecting, or no ethereum provider, don't try again
    if (account || !window.ethereum) {
      return;
    }

    // Debounce check
    const now = Date.now();
    if (now - lastConnectionAttemptRef.current < DEBOUNCE_DELAY) {
      return;
    }
    lastConnectionAttemptRef.current = now;

    // If already connecting, show a message and return
    if (isConnecting) {
      toast({
        title: 'Connection in Progress',
        description: 'Please check MetaMask to approve the connection request',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Set connecting state and clear any existing errors
    setIsConnecting(true);
    setWalletError(null);

    let connectingToastId: string | number | undefined;

    // Clear any existing timeout
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
    }

    // Set new timeout
    connectionTimeoutRef.current = setTimeout(() => {
      if (isConnecting) {
        setIsConnecting(false);
        if (connectingToastId) {
          toast.close(connectingToastId);
        }
        toast({
          title: 'Connection Timeout',
          description: 'The connection attempt timed out. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }, CONNECTION_TIMEOUT);

    try {
      const web3Instance = new Web3(window.ethereum);
      
      // First check if we're already connected
      const accounts = await web3Instance.eth.getAccounts();
      
      if (accounts && accounts.length > 0) {
        // Already connected, just use existing connection
        setWeb3(web3Instance);
        setAccount(accounts[0]);
        setIsSignedIn(true);
        
        // Get chain ID
        const chainId = await web3Instance.eth.getChainId();
        setChainId(chainId.toString());
        
        // Check if we need to switch to Amoy network
        if (Number(chainId) !== 80002) {
          await switchToAmoyNetwork();
        }
        
        setIsConnecting(false);
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
        }
        return;
      }

      // Show connecting toast
      connectingToastId = toast({
        title: 'Connecting to MetaMask',
        description: 'Please check MetaMask to approve the connection',
        status: 'info',
        duration: null,
        isClosable: false,
      });

      try {
        // Request accounts
        const requestedAccounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts',
          params: []
        });

        if (connectingToastId) {
          toast.close(connectingToastId);
        }

        if (requestedAccounts && requestedAccounts[0]) {
          setWeb3(web3Instance);
          setAccount(requestedAccounts[0]);
          setIsSignedIn(true);

          // Get chain ID
          const chainId = await web3Instance.eth.getChainId();
          setChainId(chainId.toString());

          // Check if we need to switch to Amoy network
          if (Number(chainId) !== 80002) {
            await switchToAmoyNetwork();
          }

          toast({
            title: 'Wallet Connected',
            description: `Connected to account ${requestedAccounts[0].slice(0, 6)}...${requestedAccounts[0].slice(-4)}`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (error: any) {
        if (connectingToastId) {
          toast.close(connectingToastId);
        }

        // Handle the "already processing" error specifically
        if (error.code === -32002) {
          toast({
            title: 'Connection Request Pending',
            description: 'Please open MetaMask and approve the connection request',
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
          return;
        }

        console.error('Error connecting wallet:', error);
        setWalletError(error.message);
        toast({
          title: 'Connection Error',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      console.error('Error in web3 initialization:', error);
      setWalletError(error.message);
      toast({
        title: 'Initialization Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsConnecting(false);
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
    }
  }, [account, isConnecting, toast, switchToAmoyNetwork]);

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

  // Setup Web3 event listeners
  useEffect(() => {
    if (!window.ethereum) {
      return;
    }

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setAccount(null);
        setIsSignedIn(false);
      } else {
        setAccount(accounts[0]);
        setIsSignedIn(true);
      }
    };

    const handleChainChanged = (chainId: string) => {
      setChainId(chainId);
      window.location.reload();
    };

    const handleDisconnect = () => {
      setAccount(null);
      setIsSignedIn(false);
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);

    // Only initialize if not connected and not currently connecting
    if (!account && !isConnecting) {
      // Add a small delay to prevent rapid re-initialization
      const timer = setTimeout(() => {
        initializeWeb3();
      }, 1000);

      return () => clearTimeout(timer);
    }

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
      window.ethereum.removeListener('disconnect', handleDisconnect);
    };
  }, [account, initializeWeb3, isConnecting]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
    };
  }, []);

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
        domainManager 
      } = initializeDependencies();

      // Create Orchestration Agent with API Manager
      const agent = new OrchestrationAgent(
        apiManager,
        openAIIntegration || undefined, 
        metisIntegration || undefined, 
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
        console.log('[App] Starting OrchestrationAgent initialization');
        
        // Initialize with timeout
        const initializationTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Initialization timeout')), 30000)
        );

        await Promise.race([
          agent.initialize(),
          initializationTimeout
        ]);

        console.log('[App] OrchestrationAgent initialized successfully');
        
        setOrchestrationAgent(agent);
        
        const serviceStatus = agent.getServiceStatus();
        console.log('[App] Service Status:', serviceStatus);

        setAgentStatus({
          context: serviceStatus.context.isActive,
          service: serviceStatus.service.isActive,
          state: serviceStatus.state.isActive
        });

        const isReady = serviceStatus.context.isActive && 
                       serviceStatus.service.isActive && 
                       serviceStatus.state.isActive;
        
        console.log(`[App] Agent Readiness: ${isReady}`);
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

        // Check if error should be suppressed
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

      // Only show toast for critical errors
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

  // Add useEffect to track agent status changes
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

      // Initial check
      checkAgentStatus();

      // Optional: Set up periodic status checks
      const statusInterval = setInterval(checkAgentStatus, 30000); // Every 30 seconds

      return () => clearInterval(statusInterval);
    }
  }, [orchestrationAgent]);

  useEffect(() => {
    initializeApplication();
  }, [initializeApplication]);

  // Monitor Layer Alignment
  const checkAlignment = useCallback(async () => {
    try {
      if (orchestrationAgent) {
        // Check if validateLayerAlignment method exists and is a function
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
      // Initial check
      checkAlignment();
      
      // Periodic checks without toasts
      const interval = setInterval(checkAlignment, 60000); // Every minute
      return () => clearInterval(interval);
    }
  }, [checkAlignment, orchestrationAgent]);

  // Subscribe to Orchestration Updates
  const handleOrchestrationUpdate = useCallback((state: OrchestrationAgent) => {
    try {
      console.log('Orchestration State Updated:', state);
      
      // Only show critical errors
      if (state?.context?.error || state?.service?.error || state?.state?.error) {
        const errors = [
          state?.context?.error,
          state?.service?.error,
          state?.state?.error
        ].filter(Boolean);

        // Check if errors should be suppressed
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

        // Only show toast if errors are not suppressed
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
    // Robust check for subscribe method
    if (orchestrationAgent) {
      // Check if subscribe method exists and is a function
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

  // Render initialization error if present
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
        <Web3ReactProvider getLibrary={getLibrary}>
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
                  <Box className="wallet-status-container">
                    <BlockchainWalletStatus
                      account={account}
                      chainId={chainId}
                      isConnecting={isConnecting}
                      error={walletError}
                      onConnect={initializeWeb3}
                      onDisconnect={() => {}}
                      onSwitchNetwork={switchToAmoyNetwork}
                    />
                  </Box>

                  {isAgentReady && orchestrationAgent && (
                    <Box className="agent-evolution-container">
                      <AgentEvolutionPanel
                        context={{
                          specializedState: selectedDomain,
                          web3,
                          account,
                          isSignedIn,
                          error: agentError,
                          isMetisReady
                        }}
                        onContextChange={handleContextChange}
                        agentId={agentId}
                        orchestrationAgent={orchestrationAgent}
                      />
                    </Box>
                  )}

                  {/* Show error if agent initialization failed */}
                  {agentError && (
                    <Box p={4} bg="red.600" color="white" borderRadius="md">
                      <Text>Failed to initialize AI agent: {agentError}</Text>
                    </Box>
                  )}

                  {/* Show loading state while agent is initializing */}
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
                    web3={web3}
                    account={account}
                    onContextChange={handleContextChange}
                  />
                  <ContextTransformationPanel 
                    orchestrationAgent={isAgentReady ? orchestrationAgent : undefined}
                    context={{
                      specializedState: 'AigentQube',
                      web3,
                      account,
                      isSignedIn,
                      error: agentError,
                      iQubeData: iQubeData
                    }}
                  />
                  <IQubeCreatingPanel 
                    web3={web3}
                    account={account}
                  />
                </ChakraVStack>
              </Grid>
            </DashboardLayout>
          </div>
        </Web3ReactProvider>
      </ChakraProvider>
    </ErrorBoundary>
  );
};

export default App;
