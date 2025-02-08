import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { SpecializedDomain, DOMAIN_METADATA } from '../types/domains';
import { OrchestrationAgentInterface } from '../types/orchestration';
import { Box } from '@chakra-ui/react';

interface AgentEvolutionPanelProps {
  context: any;
  onContextChange: (context: any) => void;
  agentId?: string;
  orchestrationAgent: OrchestrationAgentInterface | null;
  children?: React.ReactNode;
}

interface IQubeDetails {
  tokenId: string;
  name: string;
  domain: string;
}

const AgentEvolutionPanel: React.FC<AgentEvolutionPanelProps> = ({ 
  context, 
  onContextChange, 
  agentId,
  orchestrationAgent,
  children
}) => {
  const [baseState, setBaseState] = useState('Generic AI');
  const [specializedState, setSpecializedState] = useState<string | null>(null);
  const [iQubeTokenId, setIQubeTokenId] = useState<string>('');
  const [iQubeDetails, setIQubeDetails] = useState<IQubeDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [metaQubeData, setMetaQubeData] = useState<any>(null);
  const [blakQubeDecrypted, setBlakQubeDecrypted] = useState<any>(null);
  
  // Verify orchestrationAgent is ready
  useEffect(() => {
    if (orchestrationAgent && !orchestrationAgent.isInitialized()) {
      console.error('Agent Not Ready: The orchestration agent is not fully initialized');
    }
  }, [orchestrationAgent]);

  const agentDomains = [
    { name: SpecializedDomain.BLOCKCHAIN_ADVISOR, icon: '💰' },
    { name: SpecializedDomain.CRYPTO_ANALYST, icon: '₿' },
    { name: SpecializedDomain.GUARDIAN_AIGENT, icon: '🛡️' },
    { name: SpecializedDomain.AI_COACH, icon: '🧠' }
  ];

  const handleDomainChange = async (domain: SpecializedDomain) => {
    if (!orchestrationAgent) {
      console.error('Orchestration agent not available');
      return;
    }

    try {
      // Update the specialized state immediately
      setSpecializedState(domain);
      
      // Update context
      if (onContextChange) {
        onContextChange({
          ...context,
          specializedState: domain
        });
      }

      console.log(`Domain selection updated: ${domain}`);
    } catch (error: any) {
      console.error('Failed to update domain selection:', error);
      setError(`Failed to select ${domain}: ${error.message}`);
    }
  };

  const handleDomainSelection = useCallback(async (domain: string) => {
    if (!orchestrationAgent) {
      console.error('Orchestration agent not available');
      return;
    }

    try {
      await handleDomainChange(domain as SpecializedDomain);
    } catch (error: any) {
      console.error('Error in domain selection:', error);
      setError(`Failed to select domain: ${error.message}`);
    }
  }, [orchestrationAgent, handleDomainChange]);

  const fetchIQubeDetails = useCallback(async () => {
    if (!iQubeTokenId) {
      setError('Please enter a valid iQube Token ID');
      return;
    }

    try {
      console.log(`Fetching iQube details for Token ID: ${iQubeTokenId}`);
      
      const response = await axios.get(`http://localhost:8000/iqube/${iQubeTokenId}`, {
        // Add timeout and error handling
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log('iQube Details Response:', response.data);

      // Validate response
      if (!response.data) {
        throw new Error('No data received from server');
      }

      const details: IQubeDetails = {
        tokenId: response.data.tokenId || iQubeTokenId,
        name: response.data.name || 'Unnamed iQube',
        domain: response.data.domain || ''
      };
      
      setIQubeDetails(details);
      
      // Automatically suggest domain based on iQube
      const suggestedDomain = details.domain || '';
      if (suggestedDomain && agentDomains.some(d => d.name === suggestedDomain)) {
        setSpecializedState(suggestedDomain);
      }

      // Share iQube with agent
      if (agentId) {
        try {
          await axios.post('http://localhost:8000/agent/share-iqube', {
            agent_id: agentId,
            iqube_token_id: iQubeTokenId
          });
        } catch (shareErr) {
          console.error('Failed to share iQube:', shareErr);
          // Non-critical error, so we'll continue
        }
      }

      onContextChange({
        baseState: 'Personalized AI',
        specializedState: suggestedDomain,
        iQubeDetails: details
      });
    } catch (err) {
      // More detailed error logging
      console.error('Full error details:', err);
      
      // Check if it's an axios error with response
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error response data:', err.response.data);
          console.error('Error response status:', err.response.status);
          console.error('Error response headers:', err.response.headers);
          
          setError(`Server Error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`);
        } else if (err.request) {
          // The request was made but no response was received
          console.error('No response received:', err.request);
          setError('No response from server. Please check your network connection.');
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error setting up request:', err.message);
          setError(`Request setup error: ${err.message}`);
        }
      } else {
        // Handle non-axios errors
        console.error('Unexpected error:', err);
        setError('Failed to fetch iQube details. An unexpected error occurred.');
      }
    }
  }, [iQubeTokenId, agentId, onContextChange, agentDomains]);

  const viewMetaQube = useCallback(async () => {
    if (!iQubeTokenId) {
      setError('Please enter a valid iQube Token ID first');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:8000/metaqube/${iQubeTokenId}`);
      setMetaQubeData(response.data);
    } catch (err) {
      setError('Failed to retrieve MetaQube data');
      console.error(err);
    }
  }, [iQubeTokenId]);

  const decryptBlakQube = useCallback(async () => {
    if (!iQubeTokenId) {
      setError('Please enter a valid iQube Token ID first');
      return;
    }

    try {
      const response = await axios.post(`http://localhost:8000/blakqube/decrypt`, {
        token_id: iQubeTokenId
      });
      setBlakQubeDecrypted(response.data);
    } catch (err) {
      setError('Failed to decrypt BlakQube');
      console.error(err);
    }
  }, [iQubeTokenId]);

  const handleResetBaseState = () => {
    setSpecializedState('');
    setBaseState('Generic AI');
    onContextChange({
      baseState: 'Generic AI',
      specializedState: '',
      iQubeDetails: null
    });
  };

  return (
    <Box width="full">
      <div className="agent-evolution-panel bg-gray-800 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold mb-4">Agent Evolution</h2>
        
        {/* Base State Section */}
        <div className="base-state-section mt-4 p-3 bg-gray-800 rounded">
          <h3 className="text-lg font-semibold mb-2">Base State</h3>
          <button 
            onClick={handleResetBaseState}
            className={`
              w-full py-2 rounded transition-all duration-300 ease-in-out
              ${!specializedState 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}
            `}
            disabled={!specializedState}
          >
            Generic AI
          </button>
        </div>

        {/* Specialized Domains Section */}
        <div className="specialized-domains-section mt-4">
          <h3 className="text-lg font-semibold mb-2">Specialized Domains</h3>
          <div className="grid grid-cols-2 gap-2">
            {agentDomains.map((domain) => (
              <button
                key={domain.name}
                onClick={() => handleDomainChange(domain.name as SpecializedDomain)}
                className={`
                  p-3 rounded flex items-center justify-center space-x-2 transition-all duration-300 ease-in-out
                  ${specializedState === domain.name
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-700 hover:bg-gray-600'}
                `}
              >
                <span>{domain.icon}</span>
                <span>{domain.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Status Display */}
        {specializedState && (
          <div className="status-display mt-4">
            <div className="bg-green-800 rounded p-3">
              <div className="flex items-center space-x-2">
                <span>🧠</span>
                <span>
                  {specializedState} 
                  {iQubeDetails ? ` (iQube: ${iQubeDetails.name})` : ''} Active
                </span>
              </div>
              <div className="text-sm text-gray-300 mt-2">
                Use chat interface to engage specialist agents.
              </div>
            </div>
          </div>
        )}

        {/* Debug Info (Optional) */}
        {process.env.NODE_ENV === 'development' && (
          <>
            {metaQubeData && (
              <div className="debug-data mt-4 bg-blue-900 p-3 rounded">
                <h3 className="font-bold mb-2">MetaQube Data</h3>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(metaQubeData, null, 2)}
                </pre>
              </div>
            )}

            {blakQubeDecrypted && (
              <div className="debug-data mt-4 bg-purple-900 p-3 rounded">
                <h3 className="font-bold mb-2">BlakQube Data</h3>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(blakQubeDecrypted, null, 2)}
                </pre>
              </div>
            )}
          </>
        )}
      </div>

      {children && (
        <Box width="full" mt={4}>
          {children}
        </Box>
      )}
    </Box>
  );
};

export default AgentEvolutionPanel;
