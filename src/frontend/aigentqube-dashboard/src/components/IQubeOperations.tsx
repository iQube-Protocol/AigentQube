import React, { useState, useCallback } from 'react';
import axios from 'axios';

// Local icon replacements
const Icons = {
  Layers: (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
      {...props}
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 01-4.176-4.611L9.91 6.614a2 2 0 00-1.879-1.594H5.027C3.362 5.02 2.072 6.363 2.181 8.018l.27 4.019a2 2 0 001.524 1.821l2.351.587a6 6 0 014.559 4.971l.21 1.287a2 2 0 001.969 1.688h2.909a2 2 0 001.969-1.688l.21-1.287a6 6 0 014.559-4.971l2.351-.587a2 2 0 001.524-1.821l.27-4.019c.11-1.655-1.18-2.998-2.845-2.998h-2.004a2 2 0 00-1.879 1.594l-.555 3.168a6 6 0 01-4.176 4.611l-2.387.477a2 2 0 00-1.022.547"
      />
    </svg>
  ),
  CircleUser: (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
      {...props}
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  FileLock: (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
      {...props}
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M12 10v4m0 4h.01M8 4h8a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2zm0 0V4a2 2 0 012-2h4a2 2 0 012 2v0"
      />
    </svg>
  ),
  Send: (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
      {...props}
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
      />
    </svg>
  )
};

interface IQubeOperationsProps {
  onViewMetaQube?: (iQubeId: string) => void;
  onDecryptBlakQube?: (iQubeId: string) => void;
  onShareiQube?: (iQubeId: string) => void;
  onMintiQube?: (iQubeId: string) => void;
}

const IQubeOperations: React.FC<IQubeOperationsProps> = ({
  onViewMetaQube,
  onDecryptBlakQube,
  onShareiQube,
  onMintiQube
}) => {
  const [iQubeId, setIQubeId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [iQubeDetails, setIQubeDetails] = useState<any>(null);
  const [metaQubeData, setMetaQubeData] = useState<any>(null);
  const [blakQubeDecrypted, setBlakQubeDecrypted] = useState<any>(null);

  // Function to set error with auto-clear
  const showError = useCallback((message: string) => {
    setError(message);
    
    // Set a timeout to clear the error after 3 seconds
    const timerId = setTimeout(() => {
      setError(null);
    }, 3000);

    // Return the timer ID in case we want to clear it manually
    return timerId;
  }, []);

  const fetchIQubeDetails = useCallback(async () => {
    if (!iQubeId) {
      showError('Please enter a valid iQube Token ID');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`http://localhost:8000/iqube/${iQubeId}`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      const details = {
        tokenId: response.data.tokenId || iQubeId,
        name: response.data.name || 'Unnamed iQube'
      };
      
      setIQubeDetails(details);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching iQube details:', err);
      showError('Failed to fetch iQube details');
      setIsLoading(false);
    }
  }, [iQubeId, showError]);

  const viewMetaQube = useCallback(async () => {
    if (!iQubeId) {
      showError('Please enter a valid iQube Token ID first');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:8000/metaqube/${iQubeId}`);
      setMetaQubeData(response.data);
    } catch (err) {
      showError('Failed to retrieve MetaQube data');
      console.error(err);
    }
  }, [iQubeId, showError]);

  const decryptBlakQube = useCallback(async () => {
    if (!iQubeId) {
      showError('Please enter a valid iQube Token ID first');
      return;
    }

    try {
      const response = await axios.post(`http://localhost:8000/blakqube/decrypt`, {
        token_id: iQubeId
      });
      setBlakQubeDecrypted(response.data);
    } catch (err) {
      showError('Failed to decrypt BlakQube');
      console.error(err);
    }
  }, [iQubeId, showError]);

  const handleActionClick = (action: 'view' | 'decrypt' | 'share' | 'mint') => {
    switch (action) {
      case 'view':
        viewMetaQube();
        break;
      case 'decrypt':
        decryptBlakQube();
        break;
      case 'share':
        fetchIQubeDetails();
        break;
      case 'mint':
        onMintiQube?.(iQubeId);
        break;
    }
  };

  return (
    <div className="iqube-operations bg-gray-800 rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-semibold mb-4">iQube Operations</h2>
      
      {/* iQube ID Input */}
      <div className="iqube-id-input">
        <div className="flex space-x-2">
          <input 
            type="text" 
            value={iQubeId}
            onChange={(e) => setIQubeId(e.target.value)}
            placeholder="Enter iQube ID or iQube Identifier"
            className="flex-grow bg-gray-700 text-white p-2 rounded"
          />
          <button 
            onClick={fetchIQubeDetails}
            disabled={!iQubeId}
            className={`
              px-4 py-2 rounded transition-all duration-300 ease-in-out
              ${iQubeId 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
            `}
          >
            {isLoading ? 'Using...' : 'Use iQube'}
          </button>
        </div>

        {error && (
          <div className="text-red-500 mt-2">
            {error}
          </div>
        )}
        {iQubeDetails && (
          <div className="mt-2 bg-green-900 p-2 rounded">
            <p>iQube: {iQubeDetails.name}</p>
            <p>Token ID: {iQubeDetails.tokenId}</p>
          </div>
        )}
      </div>

      {/* iQube Operations Grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* Mint iQube */}
        <button 
          onClick={() => handleActionClick('mint')}
          className="bg-gray-700 hover:bg-blue-600 text-gray-400 hover:text-white transition-all duration-300 ease-in-out rounded-lg p-3 flex flex-col items-center justify-center space-y-2"
        >
          <Icons.Layers className="w-6 h-6" />
          <span className="text-xs font-medium">Mint iQube</span>
        </button>

        {/* View MetaQube */}
        <button 
          onClick={() => handleActionClick('view')}
          disabled={!iQubeId}
          className={`
            ${iQubeId 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
            transition-all duration-300 ease-in-out rounded-lg p-3 flex flex-col items-center justify-center space-y-2
          `}
        >
          <Icons.CircleUser className="w-6 h-6" />
          <span className="text-xs font-medium">View MetaQube</span>
        </button>

        {/* Decrypt BlakQube */}
        <button 
          onClick={() => handleActionClick('decrypt')}
          disabled={!iQubeId}
          className={`
            ${iQubeId 
              ? 'bg-purple-600 hover:bg-purple-700 text-white' 
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
            transition-all duration-300 ease-in-out rounded-lg p-3 flex flex-col items-center justify-center space-y-2
          `}
        >
          <Icons.FileLock className="w-6 h-6" />
          <span className="text-xs font-medium">Decrypt BlakQube</span>
        </button>

        {/* Share iQube */}
        <button 
          onClick={() => handleActionClick('share')}
          disabled={!iQubeId}
          className={`
            ${iQubeId 
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
            transition-all duration-300 ease-in-out rounded-lg p-3 flex flex-col items-center justify-center space-y-2
          `}
        >
          <Icons.Send className="w-6 h-6" />
          <span className="text-xs font-medium">Share iQube</span>
        </button>
      </div>

      {/* MetaQube Data Display */}
      {metaQubeData && (
        <div className="metaqube-data mt-4 bg-blue-900 p-3 rounded">
          <h3 className="font-bold mb-2">MetaQube Data</h3>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(metaQubeData, null, 2)}
          </pre>
        </div>
      )}

      {/* BlakQube Decrypted Data Display */}
      {blakQubeDecrypted && (
        <div className="blakqube-data mt-4 bg-purple-900 p-3 rounded">
          <h3 className="font-bold mb-2">BlakQube Decrypted</h3>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(blakQubeDecrypted, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default IQubeOperations;
