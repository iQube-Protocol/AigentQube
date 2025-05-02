import React, { useState, useCallback, useEffect, useMemo } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { ABI } from '../utils/ABI'
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
import PolygonNFTInterface from '../utils/MetaContract'
import { OrchestrationAgent } from '../services/OrchestrationAgent';
import NFTMinter from '../iQube/NFTMinter';
import { pinata } from '../utils/pinata-config'


const CONTRACT_ADDRESS = '0x632E1d32e34F0A690635BBcbec0D066daa448ede'

interface DecryptedInformation {
  [key: string]: string | number | string[]
}

interface IQubeOperationsProps {
  context?: any;
  onContextChange?: (context: any) => void;
  agentId?: string;
  onViewMetaQube?: (iQubeId: string) => void;
  onDecryptBlakQube?: (iQubeId: string) => void;
  onShareiQube?: (iQubeId: string) => void;
  onMintiQube?: (iQubeId: string) => void;
  orchestrationAgent: OrchestrationAgent;
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
  orchestrationAgent,
  signer
}) => {
  const [showData, setShowData] = useState<boolean>(false);
  const [iQubeTokenId, setIQubeTokenId] = useState<string>('');
  const [iQubeDetails, setIQubeDetails] = useState<IQubeDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blakQubeDecrypted, setBlakQubeDecrypted] = useState<any>(null);
  const [iQubeActivated, setIQubeActivated] = useState<{
    tokenId: string;
    name: string;
    userProfile?: string;
  } | null>(null);

  const [iQubes, setIQubes] = useState([]);
  const [metaQubeData, setMetaQubeData] = useState<any>(null)
  const [blakQubeData, setBlakQubeData] = useState<any>({
    profession: '',
    web3Interests: '',
    localCity: '',
    publicEmail: 'info@.com',
    evmPublicKey: '',
    bitcoinPublicKey: '',
    tokensOfInterest: [],
    chainIDs: [],
    walletsOfInterest: [],
  });
  const [metadata, setMetadata] = useState<string>('')
  const [decryptedLink, setDecryptedLink] = useState<string>('')
  const [nftInterface, setNftInterface] = useState<PolygonNFTInterface | null>(
    null,
  )
  const [encryptedBlakQubeData, setEncryptedBlakQubeData] = useState<any>(null)
  const [account, setAccount] = useState<string>('')
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [showFormMint, setShowFormMint] = useState(false);

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
  
  const [tokenId, setTokenId] = useState<string>('')
  

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

  const handleBlakQubeChange = (key: string, value: string) => {
    setBlakQubeData((prev: any) => {
      if (prev[key] === value) return prev; // Prevents unnecessary updates
      return { ...prev, [key]: value };
    });
  };

  const formatDisplayValue = (value: any, isBlakQube: boolean = false): string => {
    // Helper to detect encrypted content
    const looksEncrypted = (val: any): boolean => {
      if (typeof val !== 'string') return false;
      return val.length > 50 && /^[A-Za-z0-9+/=]{50,}$/.test(val);
    };

    // For BlakQube data, handle differently
    if (isBlakQube) {
      if (typeof value === 'string') {
        // Always truncate long strings, whether encrypted or decrypted
        return value.length > 40 ? `${value.substring(0, 40)}...` : value;
      }
      if (Array.isArray(value)) {
        return value.join(', ');
      }
    }

    // Handle different value types
    if (value === null || value === undefined) {
      return '-';
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
      // Check if it's an encryption object
      if (value.iv || value.cipher || value.ciphertext || value.tag) {
        const ciphertext = value.ciphertext || value.cipher || '';
        return ciphertext.length > 40 ? `${ciphertext.substring(0, 40)}...` : ciphertext;
      }
      // For other objects, show type
      return '{Object}';
    }
    
    if (typeof value === 'string') {
      // Always truncate long strings
      return value.length > 40 ? `${value.substring(0, 40)}...` : value;
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) return '[]';
      return value.join(', ');
    }

    return String(value);
  }

  const fetchIQubeDetails = useCallback(async () => {
    if (!iQubeTokenId) {
      showError('Please enter a valid iQube Token ID');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Attempt to fetch iQube from server
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

    // console.log()
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
      setIsDecrypted(true);
      setShowFormMint(false);
    }}, [iQubeTokenId]
  )

  useEffect(() => {
    if (!iQubeTokenId) {
      setIQubeActivated(null);
      setIQubeDetails(null);
      setMetaQubeData(null);
      setBlakQubeDecrypted(null);
    }
    const initNFTInterface = async () => {
      try {
        if (typeof window.ethereum === 'undefined') {
          throw new Error('MetaMask is not installed or not detected')
        }

        const _interface = new PolygonNFTInterface(CONTRACT_ADDRESS, ABI)
        
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' })
        } catch (requestError) {
          throw new Error('Failed to request MetaMask accounts: ' + requestError)
        }

        const accounts = await _interface.connectToMetaMask()
        
        if (!accounts || accounts.length === 0) {
          throw new Error('No MetaMask accounts found')
        }

        setNftInterface(_interface)
        setAccount(accounts[0])
        // console.log('NFT Interface initialized successfully')
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error initializing NFT interface'
        setError(errorMessage)
        console.error('Detailed Initialization Error:', error)
      }
    }

    initNFTInterface()

  }, []);

  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file !== null){
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  const handleViewQube = useCallback(async () => {
    if (iQubeTokenId !== null)
    {  
      if (iQubeTokenId.localeCompare("data", undefined, { sensitivity: "base" }) === 0){
        setBlakQubeData({
          profession: '',
          web3Interests: '',
          localCity: '',
          publicEmail: '',
          evmPublicKey: '',
          bitcoinPublicKey: '',
          tokensOfInterest: [],
          chainIDs: [],
          walletsOfInterest: []
        })
        setShowFormMint(true);
        setIsDecrypted(false);
        setIQubeActivated(null);
      }else if (iQubeTokenId.localeCompare("agent", undefined, { sensitivity: "base" }) === 0){
        setBlakQubeData({
          baseUrl: '',
          apiKey: '',
          agentWalletAddress: ''
        })
        setShowFormMint(true);
        setIsDecrypted(false);
        setIQubeActivated(null);
      }else if (iQubeTokenId.localeCompare("content", undefined, { sensitivity: "base" }) === 0){
        setBlakQubeData({
          encryptedFileHash: ""
        })
        setShowFormMint(true);
        setIsDecrypted(false);
        setIQubeActivated(null);
      }else{
        setShowFormMint(false);
        viewMetaQube();
      }
    }
  } ,[iQubeTokenId, onContextChange]);

  const FormMint = () => {
    if (iQubeTokenId.localeCompare("data", undefined, { sensitivity: "base" }) === 0){
    return(
      <div className="mt-4 bg-gray-700 rounded p-4 space-y-2">
        {/* First Row: iQube ID, Creator, Type, Owner Type */}
        <div className="grid grid-cols-4 gap-2 text-white">
          <div>
            <span className="text-gray-400 block text-xs">iQube ID</span>
            {"DataQube"}
          </div>
          <div>
            <span className="text-gray-400 block text-xs">Creator</span>
            {"Aigent Z"}
          </div>
          <div>
            <span className="text-gray-400 block text-xs">iQube Type</span>
            {"DataQube"}
          </div>
          <div>
            <span className="text-gray-400 block text-xs">Owner Type</span>
            {"Individual"}
          </div>
        </div>

        {/* Second Row: iQube Scores */}
        <div className="grid grid-cols-4 gap-2 text-white">
          <div>
            <span className="text-gray-400 block text-xs">Sensitivity</span>
            <ScoreBar score={0.4} inv={true} />
          </div>
          <div>
            <span className="text-gray-400 block text-xs">Verifiability</span>
            <ScoreBar score={0.5} inv={false} />
          </div>
          <div>
            <span className="text-gray-400 block text-xs">Accuracy</span>
            <ScoreBar score={0.5} inv={false}/>
          </div>
          <div>
            <span className="text-gray-400 block text-xs">Risk</span>
            <ScoreBar score={0.4} inv={true} />
          </div>
        </div>
        <div className="mt-2 bg-gray-700 rounded space-y-2">
            <h3 className="text-white text-lg mb-2 whitespace-nowrap">BlackQube Data</h3>
              <div className="grid gap-2">
                {Object.entries(blakQubeData).map(([key, value]) => (
                  <div key={key} className="w-full  block">
                    <label className="text-gray-400 text-sm font-medium">{key}</label>
                    <input
                      type="text"
                      defaultValue ={Array.isArray(value) ? (value as string[]).join(', ') : (value as string)}
                      onBlur={(e) => handleBlakQubeChange(key, e.target.value)}
                      //placeholder="Enter text..."
                      className="w-[95%] border rounded p-2 bg-[#F18585]/50  text-white"
                    />
                  </div>
                ))}
              </div>
          </div>
      </div>  
    );}
    else if (iQubeTokenId.localeCompare("agent", undefined, { sensitivity: "base" }) === 0){
      return(
        <div className="mt-4 bg-gray-700 rounded p-4 space-y-2">
          {/* First Row: iQube ID, Creator, Type, Owner Type */}
          <div className="grid grid-cols-4 gap-2 text-white">
            <div>
              <span className="text-gray-400 block text-xs">iQube ID</span>
              {"AgentQube"}
            </div>
            <div>
              <span className="text-gray-400 block text-xs">Creator</span>
              {"Aigent Z"}
            </div>
            <div>
              <span className="text-gray-400 block text-xs">iQube Type</span>
              {"AgentQube"}
            </div>
            <div>
              <span className="text-gray-400 block text-xs">Owner Type</span>
              {"Individual"}
            </div>
          </div>
  
          {/* Second Row: iQube Scores */}
          <div className="grid grid-cols-4 gap-2 text-white">
            <div>
              <span className="text-gray-400 block text-xs">Sensitivity</span>
              <ScoreBar score={0.4} inv={true} />
            </div>
            <div>
              <span className="text-gray-400 block text-xs">Verifiability</span>
              <ScoreBar score={0.5} inv={false} />
            </div>
            <div>
              <span className="text-gray-400 block text-xs">Accuracy</span>
              <ScoreBar score={0.5} inv={false}/>
            </div>
            <div>
              <span className="text-gray-400 block text-xs">Risk</span>
              <ScoreBar score={0.4} inv={true} />
            </div>
          </div>
          <div className="mt-2 bg-gray-700 rounded space-y-2">
              <h3 className="text-white text-lg mb-2 whitespace-nowrap">BlackQube Data</h3>
                <div className="grid gap-2">
                  {Object.entries(blakQubeData).map(([key, value]) => (
                    <div key={key} className="w-full  block">
                      <label className="text-gray-400 text-sm font-medium">{key}</label>
                      <input
                        type="text"
                        defaultValue ={Array.isArray(value) ? (value as string[]).join(', ') : (value as string)}
                        onBlur={(e) => handleBlakQubeChange(key, e.target.value)}
                        //placeholder="Enter text..."
                        className="w-[95%] border rounded p-2 bg-[#F18585]/50  text-white"
                      />
                    </div>
                  ))}
                </div>
            </div>
        </div>  
      );
    }
    else if (iQubeTokenId.localeCompare("content", undefined, { sensitivity: "base" }) === 0){
      return(
        <div className="mt-4 bg-gray-700 rounded p-4 space-y-2">
          {/* First Row: iQube ID, Creator, Type, Owner Type */}
          <div className="grid grid-cols-4 gap-2 text-white">
            <div>
              <span className="text-gray-400 block text-xs">iQube ID</span>
              {"ContentQube"}
            </div>
            <div>
              <span className="text-gray-400 block text-xs">Creator</span>
              {"Aigent Z"}
            </div>
            <div>
              <span className="text-gray-400 block text-xs">iQube Type</span>
              {"ContentQube"}
            </div>
            <div>
              <span className="text-gray-400 block text-xs">Owner Type</span>
              {"Individual"}
            </div>
          </div>
  
          {/* Second Row: iQube Scores */}
          <div className="grid grid-cols-4 gap-2 text-white">
            <div>
              <span className="text-gray-400 block text-xs">Sensitivity</span>
              <ScoreBar score={0.4} inv={true} />
            </div>
            <div>
              <span className="text-gray-400 block text-xs">Verifiability</span>
              <ScoreBar score={0.5} inv={false} />
            </div>
            <div>
              <span className="text-gray-400 block text-xs">Accuracy</span>
              <ScoreBar score={0.5} inv={false}/>
            </div>
            <div>
              <span className="text-gray-400 block text-xs">Risk</span>
              <ScoreBar score={0.4} inv={true} />
            </div>
          </div>
          <div className="mt-2 bg-gray-700 rounded space-y-2">
              <h3 className="text-white text-lg mb-2 whitespace-nowrap">BlackQube Data</h3>
                {/* <div className="grid gap-2">
                  <div className="w-full  block"> */}
                    <label className="text-gray-400 text-sm font-medium" htmlFor='fileUpload'>File Upload</label>
                    
                    <input
                      type="file"
                      id='fileUpload'
                      title = {`${selectedFile ? selectedFile.name : "" }`}
                      onChange={handleFile}
                      // className="mt-1 block w-full bg-red-50 rounded-lg"
                      className="w-[95%] border rounded p-2 bg-[#F18585]/50  text-white"
                    />
                  {/* </div> */}
                {/* </div> */}
                {filePreview && (
                  <div className="mt-2">
                    <img 
                      src={filePreview} 
                      alt="File Preview" 
                      className="max-h-96 w-full object-contain "
                    />
                  </div>
                )}
            </div>
        </div>  
      );
    }
    
  };
  const viewMetaQube =  useCallback(async () => {
    // console.log('retrieving meta data')
    setDecryptedLink('')
    setMetadata('')
    setMetaQubeData(null)
    setIsDecrypted(false);
    // setBlakQubeData(null)

    if (!iQubeTokenId || !nftInterface) {
      setError('Missing token ID or NFT interface')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const metadataURI = await nftInterface.getBlakQube(iQubeTokenId)
      let fullPath = metadataURI.replace(
        'ipfs://',
        `${process.env.REACT_APP_GATEWAY_URL}/ipfs/`,
      )
      // console.log('Fetching metadata from:', fullPath)
      
      // Fetch and parse metadata
      const response = await fetch(fullPath)
      const data = await response.json()


      // Extract MetaQube and BlakQube data from attributes
      const metaQubeAttrs = data.attributes.find((attr: any) => attr.trait_type === 'metaQube')?.value || {}
      const blakQubeAttrs = data.attributes.find((attr: any) => attr.trait_type === 'blakQube')?.value || {}

      // console.log("Black Qube data", blakQubeAttrs)
      
      const {
        blakQubeKey,
        blakQubeLocation,
        blakQubeIdentifier,
        ...cleanMetaQubeData
      } = metaQubeAttrs

      // Format MetaQube values
      const formattedMetaQubeData = Object.entries(cleanMetaQubeData).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: formatDisplayValue(value, false)
        }),
        {}
      )

      // Format BlakQube values
      const formattedBlakQubeData = Object.entries(blakQubeAttrs).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: formatDisplayValue(value, true)
        }),
        {}
      )

      setMetaQubeData(formattedMetaQubeData)
      setEncryptedBlakQubeData(formattedBlakQubeData)// Store encrypted data separately
      // setBlakQubeData(null) // Clear any previous decrypted data
      //setIsDecrypted(true);
      setMetadata(fullPath)

      // console.log(formattedMetaQubeData)
      // console.log(formattedBlakQubeData)

      // console.log(encryptedBlakQubeData)

      // console.log(iQubeTokenId)
      // console.log(formattedMetaQubeData['iQubeCreator'])
    
      // Activate the iQube with data
      setIQubeActivated({
        tokenId: iQubeTokenId,
        name: formattedMetaQubeData['iQubeCreator'],
        userProfile: 'User Profile'
      });
      setShowData(true);
      // console.log(iQubeTokenId)

      // Update context if onContextChange is provided
      onContextChange?.({
        iQubeDetails: {
          tokenId: iQubeTokenId,
          name: formattedMetaQubeData?.['iQubeCreator'] || '',  // Safe access with fallback
          domain: 'User Profile'
        },
        iQubeActivated: {
          tokenId: iQubeTokenId,
          name: formattedMetaQubeData?.['iQubeCreator'] || '',  // Safe access with fallback
          userProfile: 'User Profile'
        },
        
      });

   


    } catch (err) {
      console.error('Error retrieving metadata:', error)
      setError('Failed to retrieve metadata. Please check console for details.')

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
    }finally {
      setIsLoading(false)
    }

  }, [iQubeTokenId, showError, mockMetaQubeData, onContextChange]);

  const handleMemberDataDecryption = async () => {
    setIsLoading(true)
    setError('')
    try {
      if (!nftInterface || !account) {
        throw new Error('NFT interface not initialized or wallet not connected')
      }

      // Get the metadata URI using getBlakQube
      const metadataURI = await nftInterface.getBlakQube(iQubeTokenId)
      // console.log('Fetching metadata from:', metadataURI)

      const metadataResponse = await fetch(
        metadataURI.replace(
          'ipfs://',
          `${process.env.REACT_APP_GATEWAY_URL}/ipfs/`,
        ),
      )

      if (!metadataResponse.ok) {
        throw new Error(`Failed to fetch metadata: ${metadataResponse.statusText}`)
      }

      const metadata = await metadataResponse.json()
      // console.log('Metadata retrieved:', metadata)

      const metaQubeAttrs = metadata.attributes.find((attr: any) => attr.trait_type === 'metaQube')?.value || {}
      const {
        blakQubeKey,
        blakQubeLocation,
        blakQubeIdentifier,
        ...cleanMetaQubeData
      } = metaQubeAttrs

      // Format MetaQube values
      const formattedMetaQubeData = Object.entries(cleanMetaQubeData).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: formatDisplayValue(value, false)
        }),
        {}
      )

      setMetaQubeData(formattedMetaQubeData)
      // console.log(formattedMetaQubeData)


      // Activate the iQube with data
      setIQubeActivated({
        tokenId: iQubeTokenId,
        name: formattedMetaQubeData['iQubeCreator'],
        userProfile: 'User Profile'
      });

      // console.log(iQubeTokenId)

      // Update context if onContextChange is provided
      onContextChange?.({
        iQubeDetails: {
          tokenId: iQubeTokenId,
          name: formattedMetaQubeData?.['iQubeCreator'] || '',  // Safe access with fallback
          domain: 'User Profile'
        },
        iQubeActivated: {
          tokenId: iQubeTokenId,
          name: formattedMetaQubeData?.['iQubeCreator'] || '',  // Safe access with fallback
          userProfile: 'User Profile'
        }
      });

      // setBlakQubeData(null) // Clear any previous decrypted data


      // Find the blakQube attribute
      const blakQubeAttribute = metadata.attributes?.find(
        (attr: any) => attr.trait_type === 'blakQube'
      )

      if (!blakQubeAttribute) {
        throw new Error('No blakQube data found in metadata')
      }

      try {
        // console.log('Attempting to decrypt with tokenId:', iQubeTokenId)
        // console.log('BlakQube value:', blakQubeAttribute.value)
        
        // Get the encryption key first
        let encryptionKey
        try {
          encryptionKey = await nftInterface.getEncryptionKey(iQubeTokenId)
        } catch (keyError: any) {
          // Check specifically for Web3 JSON-RPC error
          if (keyError.message?.includes('Internal JSON-RPC error')) {
            throw new Error('You cannot decrypt this blakQube as you do not own its token')
          }
          throw keyError
        }

        // console.log('Encryption key retrieved:', encryptionKey)

        if (!encryptionKey) {
          throw new Error('Failed to retrieve encryption key')
        }

        // Make the decryption request to the server
        const response = await axios.post(
          `${process.env.REACT_APP_SERVER_URL}/decrypt-member-data`,
          {
            key: encryptionKey,
            encryptedData: blakQubeAttribute.value,
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )

        // console.log('Server response:', response.data)

        if (response.data && response.data.decryptedData) {
          // console.log('Decryption successful:', response.data.decryptedData)
          let blakQubeAttrs = response.data.decryptedData

          if(formattedMetaQubeData.iQubeContentType !== "Data" && formattedMetaQubeData.iQubeContentType !== "Agent"){
            const fullUrl = `${process.env.REACT_APP_GATEWAY_URL}/ipfs/${
              //decrypted.response
              response.data.decryptedData.encryptedFileHash
            }`
            blakQubeAttrs={
              'decryptedContentQubeLink': fullUrl
            }
          }
        
          // Update the state with the decrypted data
          setBlakQubeData(blakQubeAttrs)
        
          // Log the updated state data (this will be null during the initial render and then show the data after update)
          // console.log("Updated blackqube data", blakQubeAttrs)
        
          // For checking the state after it has been updated
          // console.log("variable data", blakQubeAttrs)  // Note: This is the immediate value, `blakQubeData` will be updated later
          setIsDecrypted(true);
          setShowData(true);
        
        } else {
          throw new Error('Server response missing decrypted data')
        }
      } catch (decryptError: any) {
          setIsDecrypted(false);
          console.error('Full decryption error:', decryptError)
        // If it's our custom error message, throw it as is
        if (decryptError.message?.includes('You cannot decrypt this blakQube')) {  
          throw decryptError
        }
        // For other errors, throw the original error
        throw decryptError
      }
    } catch (error: any) {
      console.error('Decryption error:', error)
      setError(error.message || 'Failed to decrypt data')
    } finally {
      setIsLoading(false)
    }
  }

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

  const getEncryptionData = async (uri: string) => {
    try {
      let http = await axios.post(
        'https://iqubes-server.onrender.com/get-encryption-key',
        {
          uri,
        },
      )
      return http?.data
    } catch (error) {
      console.error(error)
    }
  }

  const validatePinataJWT = (token: string) => {
    // console.log('[JWT Validation] Starting validation');
    
    if (!token) {
        console.error('[JWT Validation] Token is empty or undefined');
        throw new Error('Pinata JWT token is missing');
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
        console.error('[JWT Validation] Invalid token format', {
            tokenLength: parts.length,
            tokenParts: parts
        });
        throw new Error('Invalid JWT token: Incorrect number of segments');
    }

    try {
        // Attempt to decode the payload
        const payload = JSON.parse(atob(parts[1]));
        // console.log('[JWT Validation] Payload decoded successfully', {
        //     exp: payload.exp,
        //     iat: payload.iat
        // });
    } catch (error) {
        console.error('[JWT Validation] Payload decoding failed', error);
        throw new Error('Invalid JWT token: Cannot decode payload');
    }

    // console.log('[JWT Validation] Token is valid');
    return true;
  };

  const handleMemberProfileMint = async () => {
    // console.log("RUNNING : handleMemberProfileMint")

    setIsLoading(true)
    setError('')

    try {

      const pinataJWT = process.env.REACT_APP_PINATA_JWT;
      validatePinataJWT(pinataJWT || '');

      let _memberProfile = {
        metaQube:{ 
          iQubeIdentifier: 'DataQube',
          iQubeCreator: 'Aigent Z',
          ownerType: 'Individual',
          iQubeContentType: 'Data',
          ownerIdentifiability: 'Identifiable',
          transactionDate: new Date().toISOString(),
          sensitivityScore: 4,
          verifiabilityScore: 5,
          accuracyScore: 5,
          riskScore: 4,
          blakQubeKey: ''
        },
        blakQube:{}
      };

      blakQubeData['tokensOfInterest'] = blakQubeData['tokensOfInterest'].split(",").map((token: string) => token.trim())
      blakQubeData.chainIDs = blakQubeData.chainIDs.split(",").map((token: string) => token.trim())
      blakQubeData.walletsOfInterest = blakQubeData.walletsOfInterest.split(",").map((token: string) => token.trim())
      _memberProfile.blakQube = blakQubeData;
      // console.log(_memberProfile.blakQube)
      let _blakQube = _memberProfile.blakQube;
      
      let { data } = await axios.post(
        `https://iqubes-server.onrender.com/encrypt-member-qube`,
        _blakQube,
      )

      // console.log(data)

      if (data.success) {
        const { encryptedBlakQube: blakQube, key } = data?.encryptedData
        _memberProfile.metaQube.blakQubeKey = key
        const updatedMetaData = {
          metaQube: _memberProfile.metaQube,
          blakQube,
        }

        const metadata = JSON.stringify({
          name: `iQube NFT #${Date.now()}`,
          description: 'An encrypted iQube NFT',
          image: '',
          attributes: [
            ...Object.entries(updatedMetaData).map(([key, value]) => ({
              trait_type: key,
              value: value,
            })),
          ],
        })

        // Upload JSON to IPFS
        const metadataUpload = await pinata.upload.json(JSON.parse(metadata))
        // console.log(metadataUpload.IpfsHash)
        // console.log(key)
        // console.log(account)

        // mint the member data qube
        const receipt = await nftInterface?.mintQube(
          `ipfs://${metadataUpload.IpfsHash}`,
          key,
        )

        const newTokenId = await nftInterface?.getTokenIdFromReceipt(receipt)
        if (newTokenId) {
          setTokenId(newTokenId)
          setIQubeTokenId(newTokenId)
          // console.log('NFT minted successfully with token ID:', newTokenId)
        } else {
          console.log("NFT minted successfully, but couldn't retrieve token ID")
        }
      }

      return
    } catch (error) {
      console.error('Error minting member profile NFT:', error)
      setError(
        'Failed to mint member profile NFT. Please check console for details.',
      )
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleAgentProfileMint = async () => {
      setIsLoading(true)
      setError('')
  
      try {
        if (!nftInterface) {
          throw new Error('NFT interface not initialized')
        }
  
        // Validate JWT before using it
        const pinataJWT = process.env.REACT_APP_PINATA_JWT;
        validatePinataJWT(pinataJWT || '');
  
        // encrypt blakQube information
        let _agentProfile = {
          metaQube:{ 
            iQubeIdentifier: 'AgentQube',
            iQubeCreator: 'Aigent Z',
            ownerType: 'Individual',
            iQubeContentType: 'Agent',
            ownerIdentifiability: 'Identifiable',
            transactionDate: new Date().toISOString(),
            sensitivityScore: 4,
            verifiabilityScore: 5,
            accuracyScore: 5,
            riskScore: 4,
            blakQubeKey: ''
          },
          blakQube:{}
        };
        _agentProfile.blakQube = blakQubeData;
  
        // console.log('Encrypting agent data:', blakQubeData)
  
        let { data } = await axios.post(
          `https://iqubes-server.onrender.com/encrypt-member-qube`,
          blakQubeData,
        )
  
        // console.log("Encrypted data: ",data)
  
        if (data.success) {
          const { encryptedBlakQube: blakQube, key } = data?.encryptedData
          _agentProfile.metaQube.blakQubeKey = key
          const updatedMetaData = {
            metaQube: _agentProfile.metaQube,
            blakQube,
          }
  
          const metadata = JSON.stringify({
            name: `iQube NFT #${Date.now()}`,
            description: 'An encrypted iQube NFT',
            image: '',
            attributes: [
              ...Object.entries(updatedMetaData).map(([key, value]) => ({
                trait_type: key,
                value: value,
              })),
            ],
          })
  
          // Upload JSON to IPFS
          const metadataUpload = await pinata.upload.json(JSON.parse(metadata))
          // console.log(metadataUpload.IpfsHash)
          // console.log(key)
          // console.log(account)
  
          // mint the member data qube
          const receipt = await nftInterface?.mintQube(
            `ipfs://${metadataUpload.IpfsHash}`,
            key,
          )
  
          const newTokenId = await nftInterface?.getTokenIdFromReceipt(receipt)
          if (newTokenId) {
            setTokenId(newTokenId)
            setIQubeTokenId(newTokenId)
            console.log('NFT minted successfully with token ID:', newTokenId)
          } else {
            console.log("NFT minted successfully, but couldn't retrieve token ID")
          }
        }
        return 
      } catch (error: any) {
        console.error('Error minting AgentQube NFT:', error)
        setError(error.response?.data?.message || error.message || 'Failed to mint AgentQube NFT')
      } finally {
        setIsLoading(false)
      }
    }

    const handleContentProfileMint = async () => {
      setIsLoading(true)
      setError('')
  
      try {
        if (!nftInterface) {
          throw new Error('NFT interface not initialized')
        }
  
        // Validate JWT before using it
        const pinataJWT = process.env.REACT_APP_PINATA_JWT;
        validatePinataJWT(pinataJWT || '');
  
        // encrypt blakQube information
        // let _contentProfile = { ...contentProfile }
        //let _blakQube = _contentProfile.blakQube
        //console.log('Encrypting Content data:', _blakQube)
  
        // Upload file to IPFS
        const fileUpload = await pinata.upload.file(selectedFile);
  
        const encrypted = await getEncryptionData(fileUpload.IpfsHash)
  
        const { data } = await axios.post(
          'https://iqubes-server.onrender.com/encrypt-member-qube',
          {
            // blobFile: null,
            // blobPreview: null,
            encryptedFileHash: fileUpload.IpfsHash,
            //encryptedFileKey: encrypted.key
          }
        )
  
        console.log("This is the returned data", data)
  
        if (!data.success) {throw new Error('Failed to encrypt BlakQube data')}
        if (data.success) {
          const { encryptedBlakQube: blakQube, key } = data?.encryptedData
          // _contentProfile.metaQube.blakQubeKey = key
          const updatedMetaData = {
            metaQube: { 
              iQubeIdentifier: 'ContentQube',
              iQubeCreator: 'Aigent Z',
              ownerType: 'Individual',
              iQubeContentType: selectedFile.type.substring(selectedFile.type.indexOf('/') + 1),
              ownerIdentifiability: 'Identifiable',
              transactionDate: new Date().toISOString(),
              sensitivityScore: 4,
              verifiabilityScore: 5,
              accuracyScore: 5,
              riskScore: 4,
              blakQubeKey: ''
            },
            blakQube: blakQube
          }
  
          const metadata = JSON.stringify({
            name: "ContentQube",
            image: encrypted.data,
            attributes: [
              ...Object.entries(updatedMetaData).map(([key, value]) => ({
                trait_type: key,
                value: value,
              })),
            ],
          })
  
          // Upload JSON to IPFS
          const metadataUpload = await pinata.upload.json(JSON.parse(metadata))
          console.log(metadataUpload.IpfsHash)
          console.log(key)
          console.log(account)
  
          // mint the member data qube
          const receipt = await nftInterface?.mintQube(
            `ipfs://${metadataUpload.IpfsHash}`,
            key,
          )
  
          const newTokenId = await nftInterface?.getTokenIdFromReceipt(receipt)
          if (newTokenId) {
            setTokenId(newTokenId)
            setIQubeTokenId(newTokenId)
            console.log('NFT minted successfully with token ID:', newTokenId)
          } else {
            console.log("NFT minted successfully, but couldn't retrieve token ID")
          }
        }
        return 
      } catch (error: any) {
        console.error('Error minting AgentQube NFT:', error)
        setError(error.response?.data?.message || error.message || 'Failed to mint AgentQube NFT')
      } finally {
        setIsLoading(false)
      }
    }

  const handleMint = async() => {
    if (iQubeTokenId.localeCompare("data", undefined, { sensitivity: "base" }) === 0){
      handleMemberProfileMint();
    }
    else if (iQubeTokenId.localeCompare("agent", undefined, { sensitivity: "base" }) === 0){
      handleAgentProfileMint();
    }
    else if (iQubeTokenId.localeCompare("content", undefined, { sensitivity: "base" }) === 0){
      handleContentProfileMint();
      // console.log('content')
      // let type = selectedFile.type
      // console.log(type.substring(type.indexOf('/') + 1))
    }
  }

    const handleError = (error: any) => {
      if (error.code === 4001 || error.message?.includes('user rejected')) {
        return 'Transaction was rejected in MetaMask. You can try again when ready.'
      } else if (error.message?.includes('network')) {
        return 'Please ensure you are connected to the Polygon Amoy testnet in MetaMask.'
      } else if (error.message?.includes('insufficient funds')) {
        return 'Insufficient funds in your wallet for gas fees. Please add funds and try again.'
      } else if (error.message?.includes('nonce')) {
        return 'Transaction nonce error. Please refresh the page and try again.'
      } else if (error.message?.includes('gas')) {
        return 'Gas estimation failed. The transaction might fail or network might be congested.'
      } else {
        return `Operation failed: ${error.message || 'Unknown error occurred'}. Please try again.`
      }
    }

  function goToMintDashboard () : void {
    window.location.href = window.location.href + "minter";
  }

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

  useEffect(() => {
    if (blakQubeData !== null) {
      // renderBlakQubeData(); // Call render function after data has been updated
    } else if (encryptedBlakQubeData !== null) {
      //renderEncryptedBlakQubeData(); // Render encrypted data if blakQubeData is null
    } else {
      // Optionally, handle the case where both are null
      console.log("No data available");
    }
  }, [blakQubeData, encryptedBlakQubeData]); 

  const renderBlakQubeData = () => {
    if (!blakQubeData) return null;

    const dataToRender = Object.entries(blakQubeData).map(([key, value]) => ({
      label: key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase()), // Format camelCase to readable text
      value: value,
      editable: false
    }));

    // console.log("Data to render:" , blakQubeData)

    if(blakQubeData.decryptedContentQubeLink){
      // console.log("here's smth");
      return(
        <div className="grid gap-2 text-white">
          <div key={blakQubeData.decryptedContentQubeLink} className="bg-gray-700 p-2 rounded truncate w-full">
            <span className="text-gray-400 text-xs">Decyrypted contentQube Link</span>
            <a
              href={blakQubeData.decryptedContentQubeLink}
              target="_blank" 
              rel="noopener noreferrer"
              className="truncate w-full block text-blue-400 hover:underline"
            >
              {blakQubeData.decryptedContentQubeLink}
            </a>
          </div>
        </div>
      );
    }
    return (
      <div className="grid gap-2 text-white">
        {dataToRender.map((item, index) => (
          <div key={index} className="bg-gray-700 p-2 rounded truncate w-full">
            <span className="text-gray-400 text-xs">{item.label}</span>
            <div className="truncate w-full">{item.value}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderEncryptedBlakQubeData = () => {
    if (!encryptedBlakQubeData) return null;

    const dataToRender = Object.entries(encryptedBlakQubeData).map(([key, value]) => ({
      label: key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase()), // Format camelCase to readable text
      value: value,
      editable: false
    }));

    return (
      <div className="grid gap-2 text-white">
        {dataToRender.map((item, index) => (
          <div key={index} className="bg-gray-700 p-2 rounded truncate w-full">
            <span className="text-gray-400 text-xs">{item.label}</span>
            <div className="truncate w-full">{item.value}</div>
          </div>
        ))}
      </div>
    );
  };

  // Render score bar with color gradient
  const ScoreBar = ({ score, inv }: { score: number, inv: boolean }) => {
    // Determine color based on score
    const getColor = (value: number, inv: boolean) => {
      if (inv){
        if (value > 0.5) return 'bg-yellow-600';
        if (value > 0.8) return 'bg-red-600';
      }
      else{
        if (value < 0.3) return 'bg-red-600';
        if (value < 0.5) return 'bg-yellow-600';}
      // Use the darker green from Agent Evolution panel
      return 'bg-[#047857]';
    };

    return (
      <div className="flex items-center space-x-2">
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div 
            className={`${getColor(score, inv)} h-2.5 rounded-full`} 
            style={{ width: `${score * 100}%` }}
          ></div>
        </div>
        <span className="text-sm text-gray-400">{(score * 100).toFixed(0)}%</span>
      </div>
    );
  };

  const activateiQube = async () => {
    setIsLoading(true)
    setError('')
    setShowFormMint(false)
    try {
      if (!nftInterface || !account) {
        throw new Error('NFT interface not initialized or wallet not connected')
      }
      if (!orchestrationAgent) {
        console.warn('No OrchestrationAgent provided');
        setError('OrchestrationAgent not initialized');
        return;
      }
      // console.log("Current domain", orchestrationAgent.getCurrentDomain());


      // Get the metadata URI using getBlakQube
      const metadataURI = await nftInterface.getBlakQube(iQubeTokenId)
      // console.log('Fetching metadata from:', metadataURI)

      const metadataResponse = await fetch(
        metadataURI.replace(
          'ipfs://',
          `${process.env.REACT_APP_GATEWAY_URL}/ipfs/`,
        ),
      )

      if (!metadataResponse.ok) {
        throw new Error(`Failed to fetch metadata: ${metadataResponse.statusText}`)
      }

      const metadata = await metadataResponse.json()
      // console.log('Metadata retrieved:', metadata)

      const metaQubeAttrs = metadata.attributes.find((attr: any) => attr.trait_type === 'metaQube')?.value || {}
      const {
        blakQubeKey,
        blakQubeLocation,
        blakQubeIdentifier,
        ...cleanMetaQubeData
      } = metaQubeAttrs

      // Format MetaQube values
      const formattedMetaQubeData = Object.entries(cleanMetaQubeData).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: formatDisplayValue(value, false)
        }),
        {}
      )

      setMetaQubeData(formattedMetaQubeData)
      // setBlakQubeData(null) // Clear any previous decrypted data

      // console.log(formattedMetaQubeData)


      // Activate the iQube with data
      setIQubeActivated({
        tokenId: iQubeTokenId,
        name: formattedMetaQubeData['iQubeCreator'],
        userProfile: 'User Profile'
      });

      // console.log(iQubeTokenId)

      // Update context if onContextChange is provided
      onContextChange?.({
        iQubeDetails: {
          tokenId: iQubeTokenId,
          name: formattedMetaQubeData?.['iQubeCreator'] || '',  // Safe access with fallback
          domain: 'User Profile'
        },
        iQubeActivated: {
          tokenId: iQubeTokenId,
          name: formattedMetaQubeData?.['iQubeCreator'] || '',  // Safe access with fallback
          userProfile: 'User Profile'
        }
      });

      // Find the blakQube attribute
      const blakQubeAttribute = metadata.attributes?.find(
        (attr: any) => attr.trait_type === 'blakQube'
      )

      if (!blakQubeAttribute) {
        throw new Error('No blakQube data found in metadata')
      }

      try {
        // console.log('Attempting to decrypt with tokenId:', iQubeTokenId)
        // console.log('BlakQube value:', blakQubeAttribute.value)
        
        // Get the encryption key first
        let encryptionKey
        try {
          encryptionKey = await nftInterface.getEncryptionKey(iQubeTokenId)
        } catch (keyError: any) {
          // Check specifically for Web3 JSON-RPC error
          if (keyError.message?.includes('Internal JSON-RPC error')) {
            renderEncryptedBlakQubeData()
            throw new Error('You do not own this iQube.')
          }
          throw keyError
        }

        // console.log('Encryption key retrieved:', encryptionKey)

        if (!encryptionKey) {
          throw new Error('Failed to retrieve encryption key')
        }

        // Make the decryption request to the server
        const response = await axios.post(
          `${process.env.REACT_APP_SERVER_URL}/decrypt-member-data`,
          {
            key: encryptionKey,
            encryptedData: blakQubeAttribute.value,
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )

        // console.log('Server response:', response.data)

        if (response.data && response.data.decryptedData) {
          // console.log('Decryption successful:', response.data.decryptedData)
          const blakQubeAttrs = response.data.decryptedData
          setBlakQubeData(blakQubeAttrs)
          setIsDecrypted(true);

          // console.log('Checking OrchestrationAgent initialization status');
          const isInitialized = orchestrationAgent.isInitialized();
          // console.log('OrchestrationAgent initialization status:', isInitialized);

          const iQube = {
            ...formattedMetaQubeData,
            ...blakQubeAttrs
          };

          //HERE IS WHERE THE LOGIC FOR AGENT QUBE WILL GO
          

          orchestrationAgent.addIQube(iQubeTokenId, iQube)
          // console.log("from agent:", orchestrationAgent.getIQubeById(iQubeTokenId))

          // If not initialized, attempt to initialize
          if (!isInitialized) {
            // console.log('Attempting to initialize OrchestrationAgent');
            try {
              await orchestrationAgent.initialize();
              // console.log('OrchestrationAgent initialized successfully');
            } catch (initError) {
              console.error('Failed to initialize OrchestrationAgent:', initError);
              const errorMessage = `Initialization failed: ${initError instanceof Error ? initError.message : 'Unknown error'}`;
              throw new Error(errorMessage);
            }
          }
        } else {
          throw new Error('Server response missing decrypted data')
        }
      } catch (decryptError: any) {
        console.error('Full decryption error:', decryptError)
        // If it's our custom error message, throw it as is
        if (decryptError.message?.includes('You cannot decrypt this blakQube')) {
          throw decryptError
        }
        // For other errors, throw the original error
        throw decryptError
      }
    } catch (error: any) {
      console.error('Decryption error:', error)
      setError(error.message || 'Failed to decrypt data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveIQube = (iQubeId: string) => {
    try {
      // Call the removeIQubeById function from the orchestrationAgent
      orchestrationAgent.removeIQubeById(iQubeId);
      
      // Optional: You can trigger a state update or re-fetch to update the UI after removal
      // For example, if you're managing state with React useState:
      // setIQubes(orchestrationAgent.getIQubes().values());
      setIQubes(Array.from(orchestrationAgent.getIQubes().values()));

  
      // console.log(`iQube with ID ${iQubeId} removed successfully.`);
    } catch (error) {
      console.error(`Error removing iQube: ${error}`);
    }
  };

  return (
    <>
      {/* Activate iQubes */}
      <div className="pt-4">
        <h2 className="text-lg font-medium text-gray-300 mb-3">
        Active iQubes
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {/* Check if orchestrationAgent is initialized and has iQubes */}
          {orchestrationAgent?.getIQubes().size > 0 ? (
            Array.from(orchestrationAgent.getIQubes().values()) // Use the getter method to get the iQubes map values
              .slice(0, 5) // Optional: Limit to the first 5 iQubes
              .map((iQube, index) => (
                <div
                  key={iQube.id} // Use the iQube id as a unique key
                  className="bg-gray-700 p-4 rounded-lg border border-gray-600 relative"
                >
                  {/* Remove Button (X) */}
                  <button
                    onClick={() => handleRemoveIQube(iQube.id)} // Call handler to remove iQube
                    className="absolute top-2 right-2 text-white text-xl bg-gray-600 p-1 rounded-full hover:bg-gray-500 focus:outline-none"
                  >
                    &times; {/* The "X" symbol */}
                  </button>

                  {/* iQube Information for "Data" */}
                  {iQube.iQubeContentType === "Data" && (
                    <>
                      <div className="text-sm font-medium text-gray-400 mb-1">
                        {"ID " + iQube.id || "No label"}
                      </div>
                      <div className="text-lg font-semibold text-white">
                        {iQube.iQubeIdentifier || "No value"}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {iQube.evmPublicKey || "No category"}
                      </div>
                    </>
                  )}

                  {iQube.iQubeContentType === "png" && (
                    <>
                      <div className="text-sm font-medium text-gray-400 mb-1">
                        {"ID " + iQube.id || "No label"}
                      </div>
                      <div className="text-lg font-semibold text-white">
                        {iQube.iQubeIdentifier || "No value"}
                      </div>
                      <img
                        src={`${process.env.REACT_APP_GATEWAY_URL}/ipfs/${iQube.encryptedFileHash}`}
                        alt="iQube Preview"
                        className="w-full h-32 object-cover rounded-md mt-2"
                      />
                    </>
                  )}

                  {iQube.iQubeContentType === "jpeg" && (
                    <>
                      <div className="text-sm font-medium text-gray-400 mb-1">
                        {"ID " + iQube.id || "No label"}
                      </div>
                      <div className="text-lg font-semibold text-white">
                        {iQube.iQubeIdentifier || "No value"}
                      </div>
                      <img
                        src={`${process.env.REACT_APP_GATEWAY_URL}/ipfs/${iQube.encryptedFileHash}`}
                        alt="iQube Preview"
                        className="w-full h-32 object-cover rounded-md mt-2"
                      />
                    </>
                  )}

                  {iQube.iQubeContentType === "pdf" && (
                    <>
                      <div className="text-sm font-medium text-gray-400 mb-1">
                        {"ID " + iQube.id || "No label"}
                      </div>
                      <div className="text-lg font-semibold text-white">
                        {iQube.iQubeIdentifier || "No value"}
                      </div>
                      <a
                        href={`${process.env.REACT_APP_GATEWAY_URL}/ipfs/${iQube.encryptedFileHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 underline mt-2 inline-block"
                      >
                        View PDF
                      </a>
                    </>
                  )}

                  {!["Data", "pdf", "png", "jpeg"].includes(iQube.iQubeContentType) && (
                    <>
                      <div className="text-sm font-medium text-gray-400 mb-1">
                        {"ID " + iQube.id || "No label"}
                      </div>
                      <div className="text-lg font-semibold text-white">
                        {iQube.iQubeIdentifier || "No value"}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {"Content Type Not Supported Yet"}
                      </div>
                    </>
                  )}


                </div>
              ))
          ) : (
            <div className="col-span-3">
              <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 text-center">
                <span className="text-gray-400">
                  No iQubes avaliable. Activate up to 3.
                </span>
              </div>
            </div>
          )}
        </div>
    
      </div>


      <div className="iqube-operations bg-gray-800 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold mb-4">iQube Operations</h2>
        
        {/* Use iQube Button */}
        <button 
          onClick={activateiQube}
          disabled={!iQubeTokenId || isLoading}
          className={`
            w-full py-2 rounded transition-all duration-300 ease-in-out
            ${iQubeTokenId && !isLoading
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
          `}
        >
          {isLoading ? 'Activating iQube...' : 'Activate iQube'}
        </button>

        {/* iQube Details Grid */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {/* iQube ID Input */}
          <input 
            type="text" 
            value={iQubeTokenId}
            onChange={(e) => {
              const newValue = e.target.value;
              setIQubeTokenId(newValue);
              if (error)
                setError(null);
              // if (!newValue) {
              //   setMetaQubeData(null);
              //   // setBlakQubeData(null);
              // }
            }}
            placeholder="Enter iQube Type or ID"
            className="w-full py-2 px-3 bg-gray-700 text-white rounded transition-all duration-300 ease-in-out hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* View iQube Button */}
          <button 
            onClick={handleViewQube}
            disabled={!iQubeTokenId}
            className={`
              w-full py-2 rounded transition-all duration-300 ease-in-out
              ${iQubeTokenId
                ? 'bg-gray-700 text-white hover:bg-blue-600' 
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
            `}
          >
            View
          </button>

          {/* Decrypt iQube Button */}
          <button 
            onClick={handleMemberDataDecryption}
            disabled={!iQubeTokenId || iQubeTokenId.toLowerCase() === "data"}
            className={`
              w-full py-2 rounded transition-all duration-300 ease-in-out
              ${iQubeTokenId && iQubeTokenId.toLowerCase() !== "data"
                ? 'bg-gray-700 text-white hover:bg-green-600' 
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
            `}
          >
            Decrypt
          </button>

          {/* Mint (Encrypt) Button */}
          <button 
            //simple function written below the handleMintToken that takes you to path + / + minter
            // {goToMintDashboard} 

            onClick={() => handleMint()}        
            disabled={(iQubeTokenId.toLowerCase() !== "data" && iQubeTokenId.toLowerCase() !== "agent" && iQubeTokenId.toLowerCase() !== "content")
              //function to check if any of the fields are empty
              || (Object.values(blakQubeData).some(v => v === "" || (Array.isArray(v) && v.length === 0)) && selectedFile == null)
            }
            className={`
              w-full py-2 rounded transition-all duration-300 ease-in-out
              ${
                (iQubeTokenId.toLowerCase() === "data" || iQubeTokenId.toLowerCase() === "agent" || iQubeTokenId.toLowerCase() === "content")
                && (!Object.values(blakQubeData).some(v => v === "" || (Array.isArray(v) && v.length === 0)) || selectedFile != null)
                  ? "bg-gray-700 text-white hover:bg-purple-600" 
                  : "bg-gray-700 text-gray-400 cursor-not-allowed s"
              }
            `}
          >
            Mint
          </button>
        </div>

        {/* Activated iQube Bar */}
        {iQubeTokenId && iQubeActivated && (
          <div className="bg-[#047857] text-white p-2 rounded mt-2 text-center">
            #{iQubeActivated.tokenId} [{iQubeActivated.name}] User Profile Activated
          </div>
        )}

        {/* Error Display */}
        {iQubeTokenId && error && (
          <div className="text-red-500 mt-2 bg-red-900 p-2 rounded">
            {error}
          </div>
        )}
        {showFormMint && <FormMint />}
        {/* MetaQube Visualization */}
        {iQubeTokenId && iQubeActivated && (
          <div className="mt-4 bg-gray-700 rounded p-4 space-y-2">
            {/* First Row: iQube ID, Creator, Type, Owner Type */}
            <div className="grid grid-cols-4 gap-2 text-white">
              <div>
                <span className="text-gray-400 block text-xs">iQube ID</span>
                {iQubeActivated.tokenId}
              </div>
              <div>
                <span className="text-gray-400 block text-xs">Creator</span>
                {metaQubeData ? metaQubeData.iQubeCreator : setIQubeActivated(null)}
              </div>
              <div>
                <span className="text-gray-400 block text-xs">iQube Type</span>
                {metaQubeData ? metaQubeData.iQubeContentType : setIQubeActivated(null)}
              </div>
              <div>
                <span className="text-gray-400 block text-xs">Owner Type</span>
                {metaQubeData ? metaQubeData.ownerType: setIQubeActivated(null)}
              </div>
            </div>

            {/* Second Row: iQube Scores */}
            <div className="grid grid-cols-4 gap-2 text-white">
              <div>
                <span className="text-gray-400 block text-xs">Sensitivity</span>
                <ScoreBar score={metaQubeData ? metaQubeData.sensitivityScore/10: 0} inv={true} />
              </div>
              <div>
                <span className="text-gray-400 block text-xs">Verifiability</span>
                <ScoreBar score={metaQubeData ? metaQubeData.verifiabilityScore/10: 0} inv={false}/>
              </div>
              <div>
                <span className="text-gray-400 block text-xs">Accuracy</span>
                <ScoreBar score={metaQubeData ? metaQubeData.accuracyScore/10: 0} inv={false} />
              </div>
              <div>
                <span className="text-gray-400 block text-xs">Risk</span>
                <ScoreBar score={metaQubeData ? metaQubeData.riskScore/10: 0} inv={true}/>
              </div>
            </div>
          </div>
        )}

        {/* BlackQube Encrypted Data Display (View iQube) */}
        {iQubeTokenId && encryptedBlakQubeData && !isDecrypted && iQubeActivated && showData &&(
          <div className="mt-4 bg-gray-700 rounded p-4 space-y-2">
            <h3 className="text-white text-lg mb-2">Encrypted Payload</h3>
            {renderEncryptedBlakQubeData()}
          </div>
        )}

        {/* BlackQube Decrypted Data Display (Decrypt iQube) */}
        {iQubeTokenId && blakQubeData && isDecrypted && iQubeActivated && showData && (
          <div className="mt-4 bg-gray-700 rounded p-4 space-y-2">
            <h3 className="text-white text-lg mb-2">Decrypted Payload</h3>
            {renderBlakQubeData()}
          </div>
        )}

        {/* BlackQube Encrypted Data Display (Mint iQube or View iQube) */}
        {/* {blakQubeData && mockEncryptedBlakQubeData === blakQubeData && 
        (
          <div className="mt-4 bg-gray-700 rounded p-4 space-y-2">
            <h3 className="text-white text-lg mb-2">Encrypted Payload</h3>
            {renderEncryptedBlakQubeData()}
          </div>
        )} */}

        {/* BlackQube Decrypted Data Display (Decrypt iQube) */}
        {/* {blakQubeData && mockBlakQubeData === blakQubeData && (
          <div className="mt-4 bg-gray-700 rounded p-4 space-y-2">
            <h3 className="text-white text-lg mb-2">Decrypted Payload</h3>
            {renderBlakQubeData()}
          </div>
        )} */}

        {/* Optional: Hint about decryption */}
        {/* {blakQubeData && mockEncryptedBlakQubeData === blakQubeData && (
          <div className="mt-2 bg-gray-600 rounded p-2 text-center text-white text-sm">
            Click "Decrypt iQube" to view full payload details
          </div>
        )} */}
      </div>

      {/* Add View Registry Button */}
      {/* <Button 
        onClick={onOpenRegistry} 
        variant="outline" 
        colorScheme="blue" 
        size="sm"
        className="mt-4"
      >
        View Registry
      </Button> */}

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