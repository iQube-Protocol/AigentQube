import React, { useState, useCallback } from 'react';
import axios from 'axios';

interface AgentEvolutionPanelProps {
  context: any;
  onContextChange: (context: any) => void;
  agentId?: string;
}

interface IQubeDetails {
  tokenId: string;
  name: string;
  domain: string;
}

const AgentEvolutionPanel: React.FC<AgentEvolutionPanelProps> = ({ 
  context, 
  onContextChange, 
  agentId 
}) => {
  const [baseState, setBaseState] = useState('Generic AI');
  const [specializedState, setSpecializedState] = useState('');
  const [iQubeTokenId, setIQubeTokenId] = useState('');
  const [iQubeDetails, setIQubeDetails] = useState<IQubeDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metaQubeData, setMetaQubeData] = useState<any>(null);
  const [blakQubeDecrypted, setBlakQubeDecrypted] = useState<any>(null);

  const agentDomains = [
    { name: 'Financial Advisor', icon: '💰' },
    { name: 'Tech Consultant', icon: '💻' },
    { name: 'Crypto Analyst', icon: '₿' },
    { name: 'Agentic AI Advisor', icon: '🤖' }
  ];

  const handleDomainSelection = (domain: string) => {
    setSpecializedState(domain);
    onContextChange({
      baseState,
      specializedState: domain,
      iQubeDetails
    });
  };

  const fetchIQubeDetails = useCallback(async () => {
    if (!iQubeTokenId) {
      setError('Please enter a valid iQube Token ID');
      return;
    }

    setIsLoading(true);
    setError(null);

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
    } finally {
      setIsLoading(false);
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

      {/* MetaQube and BlakQube Data Display */}
      {metaQubeData && (
        <div className="metaqube-data mt-4 bg-blue-900 p-3 rounded">
          <h3 className="font-bold mb-2">MetaQube Data</h3>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(metaQubeData, null, 2)}
          </pre>
        </div>
      )}

      {blakQubeDecrypted && (
        <div className="blakqube-data mt-4 bg-purple-900 p-3 rounded">
          <h3 className="font-bold mb-2">BlakQube Decrypted</h3>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(blakQubeDecrypted, null, 2)}
          </pre>
        </div>
      )}

      {/* Domain Specialization */}
      <div className="payload-addition">
        <h3 className="font-medium mb-2">Specialize Agent Domain</h3>
        <div className="grid grid-cols-2 gap-2">
          {agentDomains.map((domain) => (
            <button
              key={domain.name}
              onClick={() => handleDomainSelection(domain.name)}
              className={`
                flex items-center justify-center space-x-2 
                p-3 rounded transition duration-300
                ${specializedState === domain.name 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
              `}
            >
              <span>{domain.icon}</span>
              <span>{domain.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Specialized State */}
      {specializedState && (
        <div className="specialized-state mt-4">
          <h3 className="font-medium mb-2">Current Specialization</h3>
          <div className="bg-green-800 rounded p-3 flex items-center space-x-2">
            <span>🧠</span>
            <span>
              {specializedState} 
              {iQubeDetails ? ` (iQube: ${iQubeDetails.name})` : ''} Mode Activated
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentEvolutionPanel;
