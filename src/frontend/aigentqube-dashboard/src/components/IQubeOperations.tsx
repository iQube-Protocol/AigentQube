import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalCloseButton, 
  ModalBody, 
  Button,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import QubeViewer from './QubeViewer';
import { registerQube } from '../utils/contractInteraction';

interface IQubeOperationsProps {
  context?: any;
  onContextChange?: (context: any) => void;
  agentId?: string;
  onViewMetaQube?: (iQubeId: string) => void;
  onDecryptBlakQube?: (iQubeId: string) => void;
  onShareiQube?: (iQubeId: string) => void;
  onMintiQube?: (iQubeId: string) => void;
  signer?: ethers.Signer;
}

interface IQubeDetails {
  tokenId: string;
  name: string;
  domain: string;
}

const IQubeOperations: React.FC<IQubeOperationsProps> = ({ 
  context, 
  onContextChange, 
  agentId,
  onViewMetaQube,
  onDecryptBlakQube,
  onShareiQube,
  onMintiQube,
  signer
}) => {
  const [iQubeTokenId, setIQubeTokenId] = useState('');
  const [iQubeDetails, setIQubeDetails] = useState<IQubeDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metaQubeData, setMetaQubeData] = useState<any>(null);
  const [blakQubeDecrypted, setBlakQubeDecrypted] = useState<any>(null);
  const [iQubeActivated, setIQubeActivated] = useState<{
    tokenId: string;
    name: string;
    userProfile?: string;
  } | null>(null);

  // Modal for Qube Registry
  const { isOpen: isRegistryOpen, onOpen: onOpenRegistry, onClose: onCloseRegistry } = useDisclosure();

  // Expanded mock data for MetaQube visualization
  const [mockMetaQubeData, setMockMetaQubeData] = useState({
    id: 'IQ-001',
    name: 'Mock iQube',
    creator: 'Aigent Z',
    type: 'Data',
    ownerType: 'Enterprise',
    scores: {
      sensitivity: 0.7,
      verifiability: 0.8,
      accuracy: 0.6,
      risk: 0.4
    },
    metadata: {
      domain: 'User Interaction',
      createdAt: '2025-01-10',
      lastUpdated: '2025-01-10'
    }
  });

  // Mock BlackQube data
  const [mockBlakQubeData, setMockBlakQubeData] = useState({
    public_keys: ["bc1p4hm2mdgfhag5742q37xuh28cnecccuckwrpjuw6fy0ssuz0lmmzsnv7u9h"],
    user_profile: {
      Name: "Alex Rivera",
      Number: "+1 (555) 123-4567",
      Email: "alex.rivera@example.com",
      Profession: "Software Engineer",
      Organization: "Tech Innovations Inc.",
      City: "San Francisco",
      Interests: ["Blockchain", "AI", "Sustainable Tech"]
    },
    Holdings: [
      {"currency": "BTC", "holding": 0.0008},
      {"currency": "ETH", "holding": 0.02},
      {"currency": "QSWAP", "holding": 8}
    ],
    transaction_history: [
      {
        transaction_id: "TX001",
        senders: ["bc1p4hm2mdgfhag5742q37xuh28cnecccuckwrpjuw6fy0ssuz0lmmzsnv7u9h"],
        recievers: ["bc1p9x0j7zs5nt5hn4zy7vv7qjx8lzw"],
        amt: 0.005,
        fee: 0.0001,
        block_id: 789012,
        time: 1704931200
      }
    ]
  });

  // Mock encrypted BlakQube data
  const [mockEncryptedBlakQubeData, setMockEncryptedBlakQubeData] = useState({
    public_keys: ["bc1p4hm2mdgfhag5742q37xuh28cnecccuckwrpjuw6fy0ssuz0lmmzsnv7u9h"],
    user_profile: {
      Name: "ENCRYPTED",
      Number: "ENCRYPTED",
      Email: "ENCRYPTED",
      Profession: "ENCRYPTED",
      Organization: "ENCRYPTED",
      City: "ENCRYPTED",
      Interests: ["ENCRYPTED"]
    },
    Holdings: [
      {"currency": "BTC", "holding": "ENCRYPTED"},
      {"currency": "ETH", "holding": "ENCRYPTED"},
      {"currency": "QSWAP", "holding": "ENCRYPTED"}
    ],
    transaction_history: [
      {
        transaction_id: "ENCRYPTED",
        senders: ["ENCRYPTED"],
        recievers: ["ENCRYPTED"],
        amt: "ENCRYPTED",
        fee: "ENCRYPTED",
        block_id: "ENCRYPTED",
        time: "ENCRYPTED"
      }
    ]
  });

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
    if (!iQubeTokenId) {
      showError('Please enter a valid iQube Token ID');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Attempt to fetch from server
      const response = await axios.get(`http://localhost:8000/iqube/${iQubeTokenId}`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      const details: IQubeDetails = {
        tokenId: response.data.tokenId || iQubeTokenId,
        name: response.data.name || 'Unnamed iQube',
        domain: response.data.domain || ''
      };
      
      setIQubeDetails(details);
    } catch (err) {
      console.error('Error fetching iQube details:', err);
      
      // Use mock data when server is not responding
      const mockDetails: IQubeDetails = {
        tokenId: mockMetaQubeData.id,
        name: 'Mock iQube',
        domain: mockMetaQubeData.metadata.domain
      };
      setIQubeDetails(mockDetails);
    }

    // Activate the iQube with mock data
    setIQubeActivated({
      tokenId: mockMetaQubeData.id,
      name: 'Mock iQube',
      userProfile: 'User Profile'
    });

    // Set decrypted BlakQube data
    setBlakQubeDecrypted(mockBlakQubeData);

    // Update context if onContextChange is provided
    onContextChange?.({
      iQubeDetails: {
        tokenId: mockMetaQubeData.id,
        name: 'Mock iQube',
        domain: mockMetaQubeData.metadata.domain
      },
      iQubeActivated: {
        tokenId: mockMetaQubeData.id,
        name: 'Mock iQube',
        userProfile: 'User Profile'
      },
      blakQubeDecrypted: {
        encrypted: mockEncryptedBlakQubeData,
        decrypted: mockBlakQubeData
      }
    });

    setIsLoading(false);
  }, [iQubeTokenId, onContextChange, showError, mockMetaQubeData, mockBlakQubeData, mockEncryptedBlakQubeData]);

  // Reset iQube activation when token ID changes
  useEffect(() => {
    if (!iQubeTokenId) {
      setIQubeActivated(null);
      setIQubeDetails(null);
      setMetaQubeData(null);
      setBlakQubeDecrypted(null);
    }
  }, [iQubeTokenId]);

  const viewMetaQube = useCallback(async () => {
    if (!iQubeTokenId) {
      showError('Please enter a valid iQube Token ID first');
      return;
    }

    try {
      // Attempt to fetch from server
      const response = await axios.get(`http://localhost:8000/metaqube/${iQubeTokenId}`);
      setMetaQubeData(response.data);
    } catch (err) {
      // Use mock data when server is not responding
      console.warn('Using mock MetaQube data due to server connection issue');
      
      // Set the mock data
      setMetaQubeData(mockMetaQubeData);
      
      // Activate the iQube with mock data
      setIQubeActivated({
        tokenId: mockMetaQubeData.id,
        name: 'Mock iQube',
        userProfile: 'User Profile'
      });

      // Update context if onContextChange is provided
      onContextChange?.({
        iQubeDetails: {
          tokenId: mockMetaQubeData.id,
          name: 'Mock iQube',
          domain: mockMetaQubeData.metadata.domain
        },
        iQubeActivated: {
          tokenId: mockMetaQubeData.id,
          name: 'Mock iQube',
          userProfile: 'User Profile'
        }
      });
    }
  }, [iQubeTokenId, showError, mockMetaQubeData, onContextChange]);

  const decryptBlakQube = useCallback(async () => {
    if (!iQubeTokenId) {
      showError('Please enter a valid iQube Token ID first');
      return;
    }

    try {
      const response = await axios.post(`http://localhost:8000/blakqube/decrypt`, {
        token_id: iQubeTokenId
      });
      
      // Set decrypted BlakQube data
      setBlakQubeDecrypted(mockBlakQubeData);
    } catch (err) {
      // Use mock data when server is not responding
      console.warn('Using mock BlakQube data due to server connection issue');
      
      // Set decrypted BlakQube data
      setBlakQubeDecrypted(mockBlakQubeData);
      
      // Update context if onContextChange is provided
      onContextChange?.({
        blakQubeDecrypted: mockBlakQubeData
      });
    }
  }, [iQubeTokenId, showError, mockBlakQubeData, onContextChange]);

  const handleMintToken = useCallback(async () => {
    if (!signer) {
      showError('Please connect your wallet first');
      return;
    }

    try {
      // Create sample data for minting
      const qubeType = "DataQube";  // or other types like "AgentQube"
      const qubeAddress = await signer.getAddress();
      const qubeHash = ethers.utils.id(Date.now().toString()); // Generate a unique hash

      // Register the Qube using the smart contract
      const receipt = await registerQube(
        qubeType,
        qubeAddress,
        qubeHash,
        signer,
        {
          name: 'Sample iQube',
          description: 'A test iQube',
          creator: qubeAddress,
          encryptionLevel: 'High',
          ownerType: 'Person',
          ownerIdentifiability: 'Semi-Anon',
          customAddress: '',
          customHash: '',
          transactionDate: Date.now()
        }
      );

      if (receipt) {
        const newTokenId = receipt.events?.[0]?.args?.tokenId?.toString() || '';
        setIQubeTokenId(newTokenId);
        
        // Update UI with the new token details
        setIQubeDetails({
          tokenId: newTokenId,
          name: 'Sample iQube',
          domain: 'Test Domain'
        });

        // Update context
        onContextChange?.({
          iQubeDetails: {
            tokenId: newTokenId,
            name: 'Sample iQube',
            domain: 'Test Domain'
          }
        });
      }
    } catch (err: any) {
      showError(err.message || 'Failed to mint iQube token');
      console.error('Minting error:', err);
    }
  }, [signer, showError, onContextChange]);

  const mintIQube = async (
    qubeAddress: string,
    qubeHash: string,
    signer: ethers.providers.JsonRpcSigner,
    metadata: {
      name: string;
      description: string;
      image?: string;
      attributes?: Array<{ trait_type: string; value: string }>;
    }
  ) => {
    // Register the Qube using the smart contract
    const receipt = await registerQube(
      "DataQube",
      qubeAddress,
      qubeHash,
      signer,
      metadata
    );

    if (receipt) {
      const newTokenId = receipt.events?.[0]?.args?.tokenId?.toString() || '';
      setIQubeTokenId(newTokenId);
      
      // Update UI with the new token details
      setIQubeDetails({
        tokenId: newTokenId,
        name: metadata.name,
        domain: 'Test Domain'
      });

      // Update context
      onContextChange?.({
        iQubeDetails: {
          tokenId: newTokenId,
          name: metadata.name,
          domain: 'Test Domain'
        }
      });
    }
  };

  const renderBlakQubeData = () => {
    // Flatten the BlackQube data into key-value pairs for grid display
    const dataToRender = [
      // Public Keys
      { label: "Public Key", value: mockBlakQubeData.public_keys[0] },
      
      // User Profile
      { label: "Name", value: mockBlakQubeData.user_profile.Name },
      { label: "Profession", value: mockBlakQubeData.user_profile.Profession },
      
      { label: "Email", value: mockBlakQubeData.user_profile.Email },
      { label: "Organization", value: mockBlakQubeData.user_profile.Organization },
      { label: "City", value: mockBlakQubeData.user_profile.City },
      
      // Interests
      { label: "Interests", value: mockBlakQubeData.user_profile.Interests.join(", ") },
      
      // Holdings
      ...mockBlakQubeData.Holdings.map(holding => ({
        label: `${holding.currency} Holdings`, 
        value: holding.holding.toString()
      })),
      
      // Transaction History (if available)
      ...(mockBlakQubeData.transaction_history.length > 0 
        ? mockBlakQubeData.transaction_history.map((tx, index) => [
          { label: `Tx ID (${index + 1})`, value: tx.transaction_id },
          { label: "Amount", value: `${tx.amt} ${tx.fee ? `(Fee: ${tx.fee})` : ''}` },
          { label: "Block", value: tx.block_id.toString() }
        ]).flat()
        : []
      )
    ];

    return (
      <div className="grid grid-cols-3 gap-2 text-white">
        {dataToRender.map((item, index) => (
          <div key={index} className="bg-gray-700 p-2 rounded">
            <span className="text-gray-400 block text-xs">{item.label}</span>
            <div className="truncate">{item.value}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderEncryptedBlakQubeData = () => {
    // Flatten the encrypted BlackQube data into key-value pairs for grid display
    const dataToRender = [
      // Public Keys
      { label: "Public Key", value: mockEncryptedBlakQubeData.public_keys[0], editable: false },
      
      // User Profile
      { label: "Name", value: mockEncryptedBlakQubeData.user_profile.Name, editable: true },
      { label: "Profession", value: mockEncryptedBlakQubeData.user_profile.Profession, editable: true },
      
      { label: "Email", value: mockEncryptedBlakQubeData.user_profile.Email, editable: true },
      { label: "Organization", value: mockEncryptedBlakQubeData.user_profile.Organization, editable: true },
      { label: "City", value: mockEncryptedBlakQubeData.user_profile.City, editable: true },
      
      // Interests
      { label: "Interests", value: mockEncryptedBlakQubeData.user_profile.Interests.join(", "), editable: true },
      
      // Holdings
      ...mockEncryptedBlakQubeData.Holdings.map(holding => ({
        label: `${holding.currency} Holdings`, 
        value: holding.holding,
        editable: true
      })),
      
      // Transaction History (if available)
      ...(mockEncryptedBlakQubeData.transaction_history.length > 0 
        ? mockEncryptedBlakQubeData.transaction_history.map((tx, index) => [
          { label: `Tx ID (${index + 1})`, value: tx.transaction_id, editable: false },
          { label: "Amount", value: tx.amt, editable: false },
          { label: "Block", value: tx.block_id, editable: false }
        ]).flat()
        : []
      )
    ];

    return (
      <div className="grid grid-cols-3 gap-2 text-white">
        {dataToRender.map((item, index) => (
          <div key={index} className="bg-gray-700 p-2 rounded relative">
            <span className="text-gray-400 block text-xs">{item.label}</span>
            <div className="truncate">
              {item.value}
            </div>
            {item.editable && (
              <button 
                className="absolute top-1 right-1 text-xs bg-blue-600 text-white rounded px-1 hover:bg-blue-700"
                onClick={() => {/* TODO: Implement edit functionality */}}
              >
                Edit
              </button>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render score bar with color gradient
  const ScoreBar = ({ score }: { score: number }) => {
    // Determine color based on score
    const getColor = (value: number) => {
      if (value < 0.3) return 'bg-red-600';
      if (value < 0.6) return 'bg-yellow-600';
      // Use the darker green from Agent Evolution panel
      return 'bg-[#047857]';
    };

    return (
      <div className="flex items-center space-x-2">
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div 
            className={`${getColor(score)} h-2.5 rounded-full`} 
            style={{ width: `${score * 100}%` }}
          ></div>
        </div>
        <span className="text-sm text-gray-400">{(score * 100).toFixed(0)}%</span>
      </div>
    );
  };

  return (
    <>
      <div className="iqube-operations bg-gray-800 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold mb-4">iQube Operations</h2>
        
        {/* Use iQube Button */}
        <button 
          onClick={fetchIQubeDetails}
          disabled={!iQubeTokenId || isLoading}
          className={`
            w-full py-2 rounded transition-all duration-300 ease-in-out
            ${iQubeTokenId && !isLoading
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
          `}
        >
          {isLoading ? 'Using iQube...' : 'Use iQube'}
        </button>

        {/* iQube Details Grid */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {/* iQube ID Input */}
          <input 
            type="text" 
            value={iQubeTokenId}
            onChange={(e) => setIQubeTokenId(e.target.value)}
            placeholder="Enter iQube Token ID"
            className="w-full py-2 px-3 bg-gray-700 text-white rounded transition-all duration-300 ease-in-out hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* View iQube Button */}
          <button 
            onClick={viewMetaQube}
            disabled={!iQubeTokenId}
            className={`
              w-full py-2 rounded transition-all duration-300 ease-in-out
              ${iQubeTokenId
                ? 'bg-gray-700 text-white hover:bg-blue-600' 
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
            `}
          >
            View iQube
          </button>

          {/* Decrypt iQube Button */}
          <button 
            onClick={decryptBlakQube}
            disabled={!iQubeTokenId}
            className={`
              w-full py-2 rounded transition-all duration-300 ease-in-out
              ${iQubeTokenId
                ? 'bg-gray-700 text-white hover:bg-green-600' 
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
            `}
          >
            Decrypt iQube
          </button>

          {/* Mint (Encrypt) Button */}
          <button 
            onClick={handleMintToken}
            disabled={!iQubeTokenId}
            className={`
              w-full py-2 rounded transition-all duration-300 ease-in-out
              ${iQubeTokenId
                ? 'bg-gray-700 text-white hover:bg-purple-600' 
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
            `}
          >
            Mint (Encrypt)
          </button>
        </div>

        {/* Activated iQube Bar */}
        {iQubeActivated && (
          <div className="bg-[#047857] text-white p-2 rounded mt-2 text-center">
            #{iQubeActivated.tokenId} [{iQubeActivated.name}] User Profile Activated
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="text-red-500 mt-2 bg-red-900 p-2 rounded">
            {error}
          </div>
        )}

        {/* MetaQube Visualization */}
        {iQubeActivated && (
          <div className="mt-4 bg-gray-700 rounded p-4 space-y-2">
            {/* First Row: iQube ID, Creator, Type, Owner Type */}
            <div className="grid grid-cols-4 gap-2 text-white">
              <div>
                <span className="text-gray-400 block text-xs">iQube ID</span>
                {mockMetaQubeData.id}
              </div>
              <div>
                <span className="text-gray-400 block text-xs">Creator</span>
                {mockMetaQubeData.creator}
              </div>
              <div>
                <span className="text-gray-400 block text-xs">iQube Type</span>
                {mockMetaQubeData.type}
              </div>
              <div>
                <span className="text-gray-400 block text-xs">Owner Type</span>
                {mockMetaQubeData.ownerType}
              </div>
            </div>

            {/* Second Row: iQube Scores */}
            <div className="grid grid-cols-4 gap-2 text-white">
              <div>
                <span className="text-gray-400 block text-xs">Sensitivity</span>
                <ScoreBar score={mockMetaQubeData.scores.sensitivity} />
              </div>
              <div>
                <span className="text-gray-400 block text-xs">Verifiability</span>
                <ScoreBar score={mockMetaQubeData.scores.verifiability} />
              </div>
              <div>
                <span className="text-gray-400 block text-xs">Accuracy</span>
                <ScoreBar score={mockMetaQubeData.scores.accuracy} />
              </div>
              <div>
                <span className="text-gray-400 block text-xs">Risk</span>
                <ScoreBar score={mockMetaQubeData.scores.risk} />
              </div>
            </div>
          </div>
        )}

        {/* BlackQube Encrypted Data Display (Mint iQube or View iQube) */}
        {blakQubeDecrypted && mockEncryptedBlakQubeData === blakQubeDecrypted && (
          <div className="mt-4 bg-gray-700 rounded p-4 space-y-2">
            <h3 className="text-white text-lg mb-2">Encrypted Payload</h3>
            {renderEncryptedBlakQubeData()}
          </div>
        )}

        {/* BlackQube Decrypted Data Display (Decrypt iQube) */}
        {blakQubeDecrypted && mockBlakQubeData === blakQubeDecrypted && (
          <div className="mt-4 bg-gray-700 rounded p-4 space-y-2">
            <h3 className="text-white text-lg mb-2">Decrypted Payload</h3>
            {renderBlakQubeData()}
          </div>
        )}

        {/* Optional: Hint about decryption */}
        {blakQubeDecrypted && mockEncryptedBlakQubeData === blakQubeDecrypted && (
          <div className="mt-2 bg-gray-600 rounded p-2 text-center text-white text-sm">
            Click "Decrypt iQube" to view full payload details
          </div>
        )}
      </div>

      {/* Add View Registry Button */}
      <Button 
        onClick={onOpenRegistry} 
        variant="outline" 
        colorScheme="blue" 
        size="sm"
        className="mt-4"
      >
        View Registry
      </Button>

      {/* Qube Registry Modal */}
      <Modal isOpen={isRegistryOpen} onClose={onCloseRegistry} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>iQube Registry</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <QubeViewer address={''} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default IQubeOperations;
