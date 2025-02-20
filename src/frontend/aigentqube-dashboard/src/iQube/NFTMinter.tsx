import React, { useState, useEffect, FormEvent } from 'react'
import { ABI } from '../utils/ABI'
import { pinata } from '../utils/pinata-config'
import PolygonNFTInterface from '../utils/MetaContract'
import axios from 'axios'
import { CircleUser, FileLock2, Send } from 'lucide-react'
import Web3CrossChain from './CrossChain'
import ContentQube from './ContentQube'
//import AgentQube from './AgentQube'

const CONTRACT_ADDRESS = '0x632E1d32e34F0A690635BBcbec0D066daa448ede'

interface DecryptedInformation {
  [key: string]: string | number | string[]
}

interface MetadataFields {
  iQubeIdentifier: string
  iQubeCreator: string
  ownerType: 'Individual' | 'Organization' 
  iQubeContentType: 'Data' | 'Content' | 'Workflow' | 'Agent' | 'Other'
  ownerIdentifiability: 'Anonymous' | 'Semi-Anonymous' | 'Identifiable' | 'Semi-Identifiable'
  transactionDate: string
  sensitivityScore: number
  verifiabilityScore: number
  accuracyScore: number
  riskScore: number
}

interface UserProfileMetaDataFields {
  metaQube: MetadataFields
  blakQube: {
    profession: string
    web3Interests: string
    localCity: string
    publicEmail: string
    evmPublicKey: string
    bitcoinPublicKey: string
    tokensOfInterest: string[]
    chainIDs: string[]
    walletsOfInterest: string[]
  }
}

interface AgentQubeMetaDataFields {
  metaQube: MetadataFields
  blakQube: {
    baseURL: string
    API_KEY: string
  }
}

const IQubeNFTMinter: React.FC = () => {
  const [uploadType, setUploadType] = useState<string>('memberProfile')
  const [activeTab, setActiveTab] = useState<string>('mint')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [nftInterface, setNftInterface] = useState<PolygonNFTInterface | null>(
    null,
  )
  const [account, setAccount] = useState<string>('')
  const [metadata, setMetadata] = useState<string>('')
  const [tokenId, setTokenId] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [decryptedLink, setDecryptedLink] = useState<string>('')
  
  const [metadataFields, setMetadataFields] = useState<MetadataFields>({
    iQubeIdentifier: 'iQube Name',
    iQubeCreator: 'Company or Individual',
    ownerType: 'Individual',
    iQubeContentType: 'Data',
    ownerIdentifiability: 'Identifiable',
    transactionDate: new Date().toISOString(),
    sensitivityScore: 5,
    verifiabilityScore: 7,
    accuracyScore: 6,
    riskScore: 4,
  })
  const [memberProfile, setMemberProfile] = useState<UserProfileMetaDataFields>({
    metaQube: {
      iQubeIdentifier: 'iQube Name',
      iQubeCreator: 'Company or Individual',
      ownerType: 'Individual',
      iQubeContentType: 'Data',
      ownerIdentifiability: 'Identifiable',
      transactionDate: new Date().toISOString(),
      sensitivityScore: 5,
      verifiabilityScore: 7,
      accuracyScore: 6,
      riskScore: 4,
    },
    blakQube: {
      profession: 'Consultant',
      web3Interests: 'Builder',
      localCity: 'New York',
      publicEmail: 'info@metame.com',
      evmPublicKey: '0x14b02B70a9740503ef4294FB4CAAf08e2759deA0',
      bitcoinPublicKey: '0x34355464656465',
      tokensOfInterest: ['AVA', 'POL', 'BTC','MOR'],
      chainIDs: ['1', '80002'],
      walletsOfInterest: ['0x0417409BEFbbE9474a7623b2e704389', '0x0417409BEFb7623b2e7043896566313', '0x041723b2e704389653138b'],
    },
  })

  const [agentProfile, setAgentProfile] = useState<AgentQubeMetaDataFields>({
    metaQube: {
      iQubeIdentifier: 'iQube Name',
      iQubeCreator: 'Company or Individual',
      ownerType: 'Individual',
      iQubeContentType: 'Data',
      ownerIdentifiability: 'Identifiable',
      transactionDate: new Date().toISOString(),
      sensitivityScore: 5,
      verifiabilityScore: 7,
      accuracyScore: 6,
      riskScore: 4,
    },
    blakQube: {
      baseURL: "https://nebula-api.thirdweb.com", 
      API_KEY: "API_KEY"
    }
  })

  const [decryptedInfo, setDecryptedInfo] = useState<DecryptedInformation>({})
  const [decryptedData, setDecryptedData] = useState<any>(null)
  const [metaQubeData, setMetaQubeData] = useState<any>(null)
  const [blakQubeData, setBlakQubeData] = useState<any>(null)
  const [encryptedBlakQubeData, setEncryptedBlakQubeData] = useState<any>(null)

  const handleMemberProfileChange = (
    section: 'metaQube' | 'blakQube',
    field: string,
    value: string | number,
  ) => {
    setMemberProfile((prevProfile) => ({
      ...prevProfile,
      [section]: {
        ...prevProfile[section],
        [field]: value,
      },
    }))
  }

  const handleAgentProfileChange = (
    section: 'metaQube' | 'blakQube',
    field: string,
    value: string | number,
  ) => {
    setAgentProfile((prevProfile) => ({
      ...prevProfile,
      [section]: {
        ...prevProfile[section],
        [field]: value,
      },
    }))
  }

  useEffect(() => {
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
        console.log('NFT Interface initialized successfully')
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error initializing NFT interface'
        setError(errorMessage)
        console.error('Detailed Initialization Error:', error)
      }
    }

    initNFTInterface()
  }, [])

  const validatePinataJWT = (token: string) => {
    console.log('[JWT Validation] Starting validation');
    
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
        console.log('[JWT Validation] Payload decoded successfully', {
            exp: payload.exp,
            iat: payload.iat
        });
    } catch (error) {
        console.error('[JWT Validation] Payload decoding failed', error);
        throw new Error('Invalid JWT token: Cannot decode payload');
    }

    console.log('[JWT Validation] Token is valid');
    return true;
  };

  const handleMemberProfileMint = async (e: FormEvent) => {
    console.log("RUNNING : handleMemberProfileMint")

    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {

      const pinataJWT = process.env.REACT_APP_PINATA_JWT;
      validatePinataJWT(pinataJWT || '');

      let _memberProfile = { ...memberProfile }

      let _blakQube = _memberProfile.blakQube

      let { data } = await axios.post(
        `https://iqubes-server.onrender.com/encrypt-member-qube`,
        _blakQube,
      )

      console.log(data)

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
          console.log('NFT minted successfully with token ID:', newTokenId)
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

  const handleAgentProfileMint = async (e: FormEvent) => {
    e.preventDefault()
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
      let _agentProfile = { ...agentProfile }
      let _blakQube = _agentProfile.blakQube

      console.log('Encrypting agent data:', _blakQube)

      let { data } = await axios.post(
        `https://iqubes-server.onrender.com/encrypt-member-qube`,
        _blakQube,
      )

      console.log(data)

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

  const handleToggle = (type: string) => {
    setUploadType(type)
  }

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

  const decryptData = async (key: string, encryptedText: string) => {
    try {
      let http = await axios.post(
        'https://iqubes-server.onrender.com/decrypt',
        {
          key,
          encryptedText,
        },
      )
      return http.data
    } catch (error) {
      console.log(error)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0])
    }
  }

  const handleMetadataChange = (
    field: keyof MetadataFields,
    value: string | number,
  ) => {
    setMetadataFields((prev) => ({ ...prev, [field]: value }))
  }

  const handleMint = async (contentQubeData: any) => {
    try {
      setIsLoading(true)
      setError(null)

      if (!contentQubeData.blakQube.blobFile) {
        throw new Error('Please select a file to mint')
      }

      if (!nftInterface) {
        throw new Error('Web3 connection not initialized. Please check your wallet connection.')
      }

      // Upload file to IPFS via Pinata
      const upload = await pinata.upload.file(contentQubeData.blakQube.blobFile)

      // Get Enc data for the file
      const encryptedFile = await getEncryptionData(upload.IpfsHash)

      // Encrypt BlakQube data
      const { data: encryptedBlakQube } = await axios.post(
        'https://iqubes-server.onrender.com/encrypt-member-qube',
        {
          ...contentQubeData.blakQube,
          blobFile: null, // Remove the file object before encrypting
          blobPreview: null,
          encryptedFileHash: upload.IpfsHash,
          encryptedFileKey: encryptedFile.key
        }
      )

      if (!encryptedBlakQube.success) {
        throw new Error('Failed to encrypt BlakQube data')
      }

      // Create metadata with both MetaQube and encrypted BlakQube
      const metadata = JSON.stringify({
        name: `iQube NFT #${Date.now()}`,
        description: 'An encrypted iQube NFT',
        image: encryptedFile.data,
        attributes: [
          { trait_type: 'metaQube', value: contentQubeData.metaQube },
          { trait_type: 'blakQube', value: encryptedBlakQube.encryptedData.blakQube }
        ],
      })

      // Upload metadata to IPFS
      const metadataUpload = await pinata.upload.json(JSON.parse(metadata))

      // Mint NFT with the encryption key from BlakQube encryption
      const receipt = await nftInterface.mintQube(
        `ipfs://${metadataUpload.IpfsHash}`,
        encryptedBlakQube.encryptedData.key
      )

      const newTokenId = await nftInterface.getTokenIdFromReceipt(receipt)
      if (newTokenId) {
        setTokenId(newTokenId)
        console.log('NFT minted successfully with token ID:', newTokenId)
      } else {
        console.log("NFT minted successfully, but couldn't retrieve token ID")
      }
    } catch (error) {
      console.error('Error minting NFT:', error)
      setError(handleError(error))
    } finally {
      setIsLoading(false)
    }
  }

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

  const handleRetrieveMetadata = async () => {
    console.log('retrieving meta data')
    setDecryptedLink('')
    setMetadata('')
    setMetaQubeData(null)
    setBlakQubeData(null)

    if (!tokenId || !nftInterface) {
      setError('Missing token ID or NFT interface')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const metadataURI = await nftInterface.getBlakQube(tokenId)
      let fullPath = metadataURI.replace(
        'ipfs://',
        `${process.env.REACT_APP_GATEWAY_URL}/ipfs/`,
      )
      console.log('Fetching metadata from:', fullPath)


      // Fetch and parse metadata
      const response = await fetch(fullPath)
      const data = await response.json()
      
      // Extract MetaQube and BlakQube data from attributes
      const metaQubeAttrs = data.attributes.find((attr: any) => attr.trait_type === 'metaQube')?.value || {}
      const blakQubeAttrs = data.attributes.find((attr: any) => attr.trait_type === 'blakQube')?.value || {}
      
      // Remove blakQube-related fields
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
      setEncryptedBlakQubeData(formattedBlakQubeData) // Store encrypted data separately
      setBlakQubeData(null) // Clear any previous decrypted data
      setMetadata(fullPath)
    } catch (error) {
      console.error('Error retrieving metadata:', error)
      setError('Failed to retrieve metadata. Please check console for details.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMemberDataDecryption = async () => {
    setIsLoading(true)
    setError('')
    try {
      if (!nftInterface || !account) {
        throw new Error('NFT interface not initialized or wallet not connected')
      }

      // Get the metadata URI using getBlakQube
      const metadataURI = await nftInterface.getBlakQube(tokenId)
      console.log('Fetching metadata from:', metadataURI)

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
      console.log('Metadata retrieved:', metadata)

      // Find the blakQube attribute
      const blakQubeAttribute = metadata.attributes?.find(
        (attr: any) => attr.trait_type === 'blakQube'
      )

      if (!blakQubeAttribute) {
        throw new Error('No blakQube data found in metadata')
      }

      try {
        console.log('Attempting to decrypt with tokenId:', tokenId)
        console.log('BlakQube value:', blakQubeAttribute.value)
        
        // Get the encryption key first
        let encryptionKey
        try {
          encryptionKey = await nftInterface.getEncryptionKey(tokenId)
        } catch (keyError: any) {
          // Check specifically for Web3 JSON-RPC error
          if (keyError.message?.includes('Internal JSON-RPC error')) {
            throw new Error('You cannot decrypt this blakQube as you do not own its token')
          }
          throw keyError
        }

        console.log('Encryption key retrieved:', encryptionKey)

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

        console.log('Server response:', response.data)

        if (response.data && response.data.decryptedData) {
          console.log('Decryption successful:', response.data.decryptedData)
          setBlakQubeData(response.data.decryptedData)
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

  const labelMapping: { [key: string]: string } = {
    profession: 'Profession',
    web3Interests: 'Web3 Interests',
    localCity: 'Local City',
    publicEmail: 'Email',
    evmPublicKey: 'EVM Public Key',
    bitcoinPublicKey: 'BTC Public Key',
    tokensOfInterest: "Tokens of Interest",
    chainIDs: "Chain IDs",
    walletsOfInterest: 'Wallets of Interest',
  };

  const labelAgentMapping: { [key: string]: string } = {
    baseURL: "Base URL", 
    API_KEY: "API KEY"
  };

  const tabNames = {
    mint: 'Mint',
    transfer: 'Transfer',
    knytCharactersOwned: 'KNYT Characters Owned'
  };

  // function goToAIDashboard () : void {
  //   window.location.href = window.location.href.slice(0,6);
  // }

  function goToAIDashboard () : void {
    window.location.href = window.location.href.slice(0,-7);
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-blue-900">
      {error && (
        <div className="relative bg-red-50 border-l-4 border-red-500 p-4 my-4">
          <div className="flex items-center pr-8">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm text-red-700 font-medium">{error}</p>
              {error.includes('rejected') && (
                <p className="text-xs text-red-600 mt-1">
                  You can safely try again when you're ready to approve the transaction.
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setError(null)}
            className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors"
            aria-label="Close error message"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
      <header className="p-8 border-b border-gray-700">
        <div className="absolute top-4 left-4 flex items-center space-x-4">
          <button 
            onClick={goToAIDashboard}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded transition-all duration-300">
            Back to AI dashboard
          </button>
        </div>
      </header>
      <div className="w-[100%] bg-gradient-to-br from-gray-900 to-blue-900 p-[25px] flex flex-col">
        <div className="w-[100%] justify-between flex">
          {/* Left Section - Create Qube */}
          <div className="w-[50%] pr-[20px]">
            <h1 className="font-bold text-[28px] mb-[20px] text-white">Create iQube</h1>
            <hr className="w-[20%] mb-[20px]" />
            <div className="flex my-[20px]">
              {/* Existing tab navigation remains the same */}
              <div
                className={`${
                  uploadType === 'memberProfile' ? 'border-b border-b-white' : ''
                }  mr-[10px] cursor-pointer flex items-center pb-[10px]`}
                onClick={() => handleToggle('memberProfile')}
              >
                <CircleUser color="white" className="mr-[10px]" />
                <h5 className={`text-white text-[12px]`}>Data Qube</h5>
              </div>
              <div
                className={`${
                  uploadType === 'agent' ? 'border-b border-b-[white]' : ''
                } mr-[10px] cursor-pointer flex items-center pb-[10px]`}
                onClick={() => handleToggle('agent')}
              >
                <FileLock2 color="white" className="mr-[10px]" />
                <h5 className={`text-[white] text-[12px]`}>Agent Qube</h5>
              </div>
              <div
                className={`${
                  uploadType === 'mediaBlob' ? 'border-b border-b-[white]' : ''
                } mr-[10px] cursor-pointer flex items-center pb-[10px]`}
                onClick={() => handleToggle('mediaBlob')}
              >
                <FileLock2 color="white" className="mr-[10px]" />
                <h5 className={`text-white text-[12px]`}>Content Qube</h5>
              </div>
              
            </div>
            {uploadType === 'mediaBlob' ? (
              <div className="flex w-full">
                {/* Left Section - Content Form */}
                <div className="w-full">
                  <ContentQube 
                    nftInterface={nftInterface}
                    onContentChange={(content) => handleMint(content)} 
                  />
                </div>
              </div>
            ) : null}

            {uploadType === 'memberProfile' ? (
              <form onSubmit={handleMemberProfileMint}>
                {/* MetaQube Section */}
                <div className="bg-gray-700 border border-gray-600 p-6 rounded-lg">
                  <div className="flex items-center mb-[10px]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-[10px] text-blue-500">
                      <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
                    </svg>
                    <h3 className="font-bold text-[18px] text-white">MetaQube</h3>
                  </div>

                  {/* First row - 2 items */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-[12px] font-medium text-white mb-2">
                        iQube Identifier
                      </label>
                      <input
                        type="text"
                        value={memberProfile.metaQube.iQubeIdentifier}
                        onChange={(e) =>
                          handleMemberProfileChange(
                            'metaQube',
                            'iQubeIdentifier',
                            e.target.value,
                          )
                        }
                        className="w-full p-[10px] border rounded-[5px] bg-[#e8f5e9]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-white mb-2">
                        iQube Creator
                      </label>
                      <input
                        type="text"
                        value={memberProfile.metaQube.iQubeCreator}
                        onChange={(e) =>
                          handleMemberProfileChange(
                            'metaQube',
                            'iQubeCreator',
                            e.target.value,
                          )
                        }
                        className="w-full p-[10px] border rounded-[5px] bg-[#e8f5e9]"
                        required
                      />
                    </div>
                  </div>

                  {/* Second row - 2 items */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-[12px] font-medium text-white mb-2">
                        Owner Type
                      </label>
                      <select
                        value={memberProfile.metaQube.ownerType}
                        onChange={(e) =>
                          handleMemberProfileChange(
                            'metaQube',
                            'ownerType',
                            e.target.value,
                          )
                        }
                        className="w-full p-[10px] border rounded-[5px] bg-[#e8f5e9]"
                        required
                      >
                        <option value="Person">Person</option>
                        <option value="Organization">Organization</option>
=                      </select>
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-white mb-2">
                        Content Type
                      </label>
                      <select
                        value={memberProfile.metaQube.iQubeContentType}
                        onChange={(e) =>
                          handleMemberProfileChange(
                            'metaQube',
                            'iQubeContentType',
                            e.target.value,
                          )
                        }
                        className="w-full p-[10px] border rounded-[5px] bg-[#e8f5e9]"
                        required
                      >
                        <option value="data">Data</option>
                        <option value="mp3">MP3</option>
                        <option value="mp4">MP4</option>
                        <option value="pdf">PDF</option>
                        <option value="txt">TXT</option>
                        <option value="agent">Agent</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Third row - 2 items */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-[12px] font-medium text-white mb-2">
                        Owner Identifiability
                      </label>
                      <select
                        value={memberProfile.metaQube.ownerIdentifiability}
                        onChange={(e) =>
                          handleMemberProfileChange(
                            'metaQube',
                            'ownerIdentifiability',
                            e.target.value,
                          )
                        }
                        className="w-full p-[10px] border rounded-[5px] bg-[#e8f5e9]"
                        required
                      >
                        <option value="Anonymous">Anonymous</option>
                        <option value="Semi-Anonymous">Semi-Anonymous</option>
                        <option value="Identifiable">Identifiable</option>
                        <option value="Semi-Identifiable">Semi-Identifiable</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-white mb-2">
                        Transaction Date
                      </label>
                      <input
                        type="date"
                        value={memberProfile.metaQube.transactionDate.split('T')[0]}
                        onChange={(e) =>
                          handleMemberProfileChange(
                            'metaQube',
                            'transactionDate',
                            e.target.value,
                          )
                        }
                        className="w-full p-[10px] border rounded-[5px] bg-[#e8f5e9]"
                        required
                      />
                    </div>
                  </div>

                  {/* Fourth row - 4 scores */}
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[12px] font-medium text-white mb-2">
                        Sensitivity Score
                      </label>
                      <select
                        value={memberProfile.metaQube.sensitivityScore}
                        onChange={(e) =>
                          handleMemberProfileChange(
                            'metaQube',
                            'sensitivityScore',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full p-[10px] border rounded-[5px] bg-[#e8f5e9]"
                        required
                      >
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-white mb-2">
                        Verifiabile Score
                      </label>
                      <select
                        value={memberProfile.metaQube.verifiabilityScore}
                        onChange={(e) =>
                          handleMemberProfileChange(
                            'metaQube',
                            'verifiabilityScore',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full p-[10px] border rounded-[5px] bg-[#e8f5e9]"
                        required
                      >
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-white mb-2">
                        Accuracy Score
                      </label>
                      <select
                        value={memberProfile.metaQube.accuracyScore}
                        onChange={(e) =>
                          handleMemberProfileChange(
                            'metaQube',
                            'accuracyScore',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full p-[10px] border rounded-[5px] bg-[#e8f5e9]"
                        required
                      >
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-white mb-2">
                        Risk Score
                      </label>
                      <select
                        value={memberProfile.metaQube.riskScore}
                        onChange={(e) =>
                          handleMemberProfileChange(
                            'metaQube',
                            'riskScore',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full p-[10px] border rounded-[5px] bg-[#e8f5e9]"
                        required
                      >
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* BlakQube Section */}
                <div className="bg-gray-700 border border-gray-600 p-6 rounded-lg mt-6">
                  <div className="flex items-center mb-[10px]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-[10px] text-red-500">
                      <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
                    </svg>
                    <h3 className="font-bold text-[18px] text-white">BlakQube</h3>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(memberProfile.blakQube).map(([key, value]) => (
                      <div key={key} className="mb-[10px]">
                        <label className="block text-[10px] font-[500] text-white">
                          {labelMapping[key] || key}:{' '}
                        </label>
                        <input
                          type={typeof value === 'number' ? 'number' : 'text'}
                          value={
                            Array.isArray(value)
                              ? value.join(', ')
                              : typeof value === 'string' ||
                                typeof value === 'number'
                              ? value
                              : ''
                          }
                          onChange={(e) =>
                            handleMemberProfileChange(
                              'blakQube',
                              key,
                              e.target.value,
                            )
                          }
                          disabled={isLoading}
                          required
                          className="w-[95%] border rounded-[5px] p-[10px] bg-[#ffebee]"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  disabled={isLoading}
                  className={`w-full p-[10px] rounded-[5px] ${
                    isLoading ? 'bg-[grey]' : 'bg-[blue]'
                  } text-[#fff]`}
                >
                  {isLoading ? 'Encrypting...' : 'Encrypt BlakQube'}
                </button>
              </form>
            ) : null}

            {uploadType === 'agent' ? (
              <form onSubmit={handleAgentProfileMint}>
                {/* MetaQube Section */}
                <div className="bg-gray-700 border border-gray-600 p-6 rounded-lg">
                  <div className="flex items-center mb-[10px]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-[10px] text-blue-500">
                      <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
                    </svg>
                    <h3 className="font-bold text-[18px] text-white">MetaQube</h3>
                  </div>

                  {/* First row - 2 items */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-[12px] font-medium text-white mb-2">
                        iQube Identifier
                      </label>
                      <input
                        type="text"
                        value={memberProfile.metaQube.iQubeIdentifier}
                        onChange={(e) =>
                          handleMemberProfileChange(
                            'metaQube',
                            'iQubeIdentifier',
                            e.target.value,
                          )
                        }
                        className="w-full p-[10px] border rounded-[5px] bg-[#e8f5e9]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-white mb-2">
                        iQube Creator
                      </label>
                      <input
                        type="text"
                        value={memberProfile.metaQube.iQubeCreator}
                        onChange={(e) =>
                          handleMemberProfileChange(
                            'metaQube',
                            'iQubeCreator',
                            e.target.value,
                          )
                        }
                        className="w-full p-[10px] border rounded-[5px] bg-[#e8f5e9]"
                        required
                      />
                    </div>
                  </div>

                  {/* Second row - 2 items */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-[12px] font-medium text-white mb-2">
                        Owner Type
                      </label>
                      <select
                        value={memberProfile.metaQube.ownerType}
                        onChange={(e) =>
                          handleMemberProfileChange(
                            'metaQube',
                            'ownerType',
                            e.target.value,
                          )
                        }
                        className="w-full p-[10px] border rounded-[5px] bg-[#e8f5e9]"
                        required
                      >
                        <option value="Person">Person</option>
                        <option value="Organization">Organization</option>
=                      </select>
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-white mb-2">
                        Content Type
                      </label>
                      <select
                        value={memberProfile.metaQube.iQubeContentType}
                        onChange={(e) =>
                          handleMemberProfileChange(
                            'metaQube',
                            'iQubeContentType',
                            e.target.value,
                          )
                        }
                        className="w-full p-[10px] border rounded-[5px] bg-[#e8f5e9]"
                        required
                      >
                        <option value="data">Data</option>
                        <option value="mp3">MP3</option>
                        <option value="mp4">MP4</option>
                        <option value="pdf">PDF</option>
                        <option value="txt">TXT</option>
                        <option value="agent">Agent</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Third row - 2 items */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-[12px] font-medium text-white mb-2">
                        Owner Identifiability
                      </label>
                      <select
                        value={memberProfile.metaQube.ownerIdentifiability}
                        onChange={(e) =>
                          handleMemberProfileChange(
                            'metaQube',
                            'ownerIdentifiability',
                            e.target.value,
                          )
                        }
                        className="w-full p-[10px] border rounded-[5px] bg-[#e8f5e9]"
                        required
                      >
                        <option value="Anonymous">Anonymous</option>
                        <option value="Semi-Anonymous">Semi-Anonymous</option>
                        <option value="Identifiable">Identifiable</option>
                        <option value="Semi-Identifiable">Semi-Identifiable</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-white mb-2">
                        Transaction Date
                      </label>
                      <input
                        type="date"
                        value={memberProfile.metaQube.transactionDate.split('T')[0]}
                        onChange={(e) =>
                          handleMemberProfileChange(
                            'metaQube',
                            'transactionDate',
                            e.target.value,
                          )
                        }
                        className="w-full p-[10px] border rounded-[5px] bg-[#e8f5e9]"
                        required
                      />
                    </div>
                  </div>

                  {/* Fourth row - 4 scores */}
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[12px] font-medium text-white mb-2">
                        Sensitivity Score
                      </label>
                      <select
                        value={memberProfile.metaQube.sensitivityScore}
                        onChange={(e) =>
                          handleMemberProfileChange(
                            'metaQube',
                            'sensitivityScore',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full p-[10px] border rounded-[5px] bg-[#e8f5e9]"
                        required
                      >
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-white mb-2">
                        Verifiabile Score
                      </label>
                      <select
                        value={memberProfile.metaQube.verifiabilityScore}
                        onChange={(e) =>
                          handleMemberProfileChange(
                            'metaQube',
                            'verifiabilityScore',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full p-[10px] border rounded-[5px] bg-[#e8f5e9]"
                        required
                      >
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-white mb-2">
                        Accuracy Score
                      </label>
                      <select
                        value={memberProfile.metaQube.accuracyScore}
                        onChange={(e) =>
                          handleMemberProfileChange(
                            'metaQube',
                            'accuracyScore',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full p-[10px] border rounded-[5px] bg-[#e8f5e9]"
                        required
                      >
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-white mb-2">
                        Risk Score
                      </label>
                      <select
                        value={memberProfile.metaQube.riskScore}
                        onChange={(e) =>
                          handleMemberProfileChange(
                            'metaQube',
                            'riskScore',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full p-[10px] border rounded-[5px] bg-[#e8f5e9]"
                        required
                      >
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                      </select>
                    </div>
                  </div>
                </div>

                  {/* BlakQube Section */}
                  <div className="bg-gray-700 border border-gray-600 p-6 rounded-lg mt-6">
                  <div className="flex items-center mb-[10px]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-[10px] text-red-500">
                      <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
                    </svg>
                    <h3 className="font-bold text-[18px] text-white">BlakQube</h3>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(agentProfile.blakQube).map(([key, value]) => (
                      <div key={key} className="mb-[10px]">
                        <label className="block text-[10px] font-[500] text-white">
                          {labelAgentMapping[key] || key}:{' '}
                        </label>
                        <input
                          type={typeof value === 'number' ? 'number' : 'text'}
                          value={
                            Array.isArray(value)
                              ? value.join(', ')
                              : typeof value === 'string' ||
                                typeof value === 'number'
                              ? value
                              : ''
                          }
                          onChange={(e) =>
                            handleAgentProfileChange(
                              'blakQube',
                              key,
                              e.target.value,
                            )
                          }
                          disabled={isLoading}
                          required
                          className="w-[95%] border rounded-[5px] p-[10px] bg-[#ffebee]"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  disabled={isLoading}
                  className={`w-full p-[10px] rounded-[5px] ${
                    isLoading ? 'bg-[grey]' : 'bg-[blue]'
                  } text-[#fff]`}
                >
                  {isLoading ? 'Encrypting...' : 'Encrypt BlakQube'}
                </button>
              </form>
            ) : null}

          </div>

          {/* Right Section - TokenQube Operations */}
          <div className="w-[50%] pl-[20px]">
            <h1 className="font-bold text-[28px] mb-[20px] text-white">TokenQube Operations</h1>
            <hr className="w-[20%] mb-[20px]" />
            <div className="flex my-[20px]">
              <div
                className={`${
                  uploadType === 'crosschain' ? 'border-b border-b-[blue]' : ''
                } mr-[10px] cursor-pointer flex items-center pb-[10px]`}
                onClick={() => handleToggle('crosschain')}
              >
                <Send color="white" className="mr-[10px]" />
                <h5 className={`text-[white] text-[12px]`}>Qube Transfer</h5>
              </div>
            </div>

            {uploadType === 'crosschain' && <Web3CrossChain />}
            <div className="bg-gray-700 border border-gray-600 border rounded-[10px] p-[30px] w-full">
              <div className="flex items-center mb-[10px]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-[10px] text-blue-500">
                  <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
                </svg>
                <h3 className="font-bold text-[18px] text-white">TokenQube</h3>
              </div>
              {/* Four-button Grid Layout */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Token ID Input */}
                <div className="pt-4 flex flex-col text-white">
                  <input
                    type="text"
                    value={tokenId}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setTokenId(newValue);
                      if (!newValue) {
                        setMetaQubeData(null);
                        setBlakQubeData(null);
                      }
                    }}
                    disabled={isLoading}
                    placeholder="Enter Token ID"
                    // className="w-full border rounded-[5px] p-[10px] bg-[gray] text-white rounded"
                   className="placeholder-white rounded-[5px] p-[10px] bg-[gray] text-[white]"
                  />
                </div>

                {/* Mint iQube Button */}
                <div className="pt-4 flex flex-col">
                  <button
                    onClick={() => handleMint({})}
                    disabled={isLoading || !selectedFile || !nftInterface || tokenId}
                    className={`w-full py-[10px] rounded-[5px] bg-[grey] hover:bg-purple-600
                     text-[#fff]`}
                  >
                    {isLoading ? 'Minting...' : 'Mint iQube'}
                  </button>
                </div>
                
                {/* Get Metadata Button */}
                <div className="pt-2 flex flex-col">
                  <button
                    onClick={handleRetrieveMetadata}
                    disabled={isLoading || !tokenId || !nftInterface}
                    className={`

                      w-full py-[10px] bg-[grey] rounded-[5px]
                      ${tokenId
                        ? ' text-white hover:bg-blue-600' 
                        : ' text-gray-400 cursor-not-allowed'}

                    `}
                  >
                    {isLoading ? 'Retrieving...' : 'View MetaQube'}
                  </button>
                </div>

                {/* Decrypt BlakQube Button */}
                <div className="pt-2 flex flex-col">
                  <button
                    onClick={handleMemberDataDecryption}
                    disabled={isLoading || !tokenId || !nftInterface}
                    className={`w-full py-[10px] rounded-[5px] bg-[grey]
                      ${tokenId
                        ? 'hover:bg-[#1a8f3c]'
                        : 'text-gray-400 cursor-not-allowed'
                    } text-[#fff]`}
                  >
                    {isLoading ? 'Decrypting...' : 'Decrypt BlakQube'}
                  </button>
                </div>

                
              </div>
            </div>

            {/* Qube Data Display */}
            {tokenId && (metaQubeData || blakQubeData) && (
              <div className="mt-6 space-y-6">
                {/* MetaQube Data */}
                {metaQubeData && (
                  <div className="bg-gray-700 border border-gray-600 p-6 rounded-lg">
                    <h3 className="font-bold text-[18px] mb-4 text-white">MetaQube Data</h3>
                    <div className="space-y-4">
                      {/* First row - 2 items: iQube Identifier and iQube Creator */}
                      <div className="grid grid-cols-2 gap-4">
                        {['iQubeIdentifier', 'iQubeCreator'].map((key) => (
                          <div key={key} className="flex flex-col">
                            <label className="text-[14px] font-medium text-white mb-2">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </label>
                            <div className="relative group">
                              <div className="bg-[#e8f5e9] p-4 rounded-[5px] shadow-sm min-h-[45px] flex items-center">
                                <span className="text-[14px] text-gray-700 truncate">
                                  {metaQubeData[key]}
                                </span>
                              </div>
                              {typeof metaQubeData[key] === 'string' && metaQubeData[key].length > 40 && (
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50">
                                  <div className="bg-gray-900 p-3 rounded-lg shadow-lg max-w-[300px] break-all">
                                    <div className="text-sm text-gray-700">{metaQubeData[key]}</div>
                                    <div className="absolute left-4 bottom-[-6px] w-3 h-3 bg-gray-900 transform rotate-45"></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Second row - 2 items: Owner Type and Content Type */}
                      <div className="grid grid-cols-2 gap-4">
                        {['ownerType', 'iQubeContentType'].map((key) => (
                          <div key={key} className="flex flex-col">
                            <label className="text-[14px] font-medium text-white mb-2">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </label>
                            <div className="relative group">
                              <div className="bg-[#e8f5e9] p-4 rounded-[5px] shadow-sm min-h-[45px] flex items-center">
                                <span className="text-[14px] text-gray-700 truncate">
                                  {metaQubeData[key]}
                                </span>
                              </div>
                              {typeof metaQubeData[key] === 'string' && metaQubeData[key].length > 40 && (
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50">
                                  <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg max-w-[300px] break-all">
                                    <div className="text-sm">{metaQubeData[key]}</div>
                                    <div className="absolute left-4 bottom-[-6px] w-3 h-3 bg-gray-900 transform rotate-45"></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Third row - 2 items: Owner Identifiability and Transaction Date */}
                      <div className="grid grid-cols-2 gap-4">
                        {['ownerIdentifiability', 'transactionDate'].map((key) => (
                          <div key={key} className="flex flex-col">
                            <label className="text-[14px] font-medium text-white mb-2">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </label>
                            <div className="relative group">
                              <div className="bg-[#e8f5e9] p-4 rounded-[5px] shadow-sm min-h-[45px] flex items-center">
                                <span className="text-[14px] text-gray-700 truncate">
                                  {metaQubeData[key]}
                                </span>
                              </div>
                              {typeof metaQubeData[key] === 'string' && metaQubeData[key].length > 40 && (
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50">
                                  <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg max-w-[300px] break-all">
                                    <div className="text-sm">{metaQubeData[key]}</div>
                                    <div className="absolute left-4 bottom-[-6px] w-3 h-3 bg-gray-900 transform rotate-45"></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Fourth row - 4 scores */}
                      <div className="grid grid-cols-4 gap-4">
                        {['sensitivityScore', 'verifiabilityScore', 'accuracyScore', 'riskScore'].map((key) => (
                          <div key={key} className="flex flex-col">
                            <label className="text-[14px] font-medium text-white mb-2">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </label>
                            <div className="relative group">
                              <div className="bg-[#e8f5e9] p-4 rounded-[5px] shadow-sm min-h-[45px] flex items-center">
                                <span className="text-[14px] text-gray-700 truncate">
                                  {metaQubeData[key]}
                                </span>
                              </div>
                              {typeof metaQubeData[key] === 'string' && metaQubeData[key].length > 40 && (
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50">
                                  <div className="bg-gray-900 text-black p-3 rounded-lg shadow-lg max-w-[300px] break-all">
                                    <div className="text-sm">{metaQubeData[key]}</div>
                                    <div className="absolute left-4 bottom-[-6px] w-3 h-3 bg-gray-900 transform rotate-45"></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {/* BlakQube Data */}
                {blakQubeData && (
                  <div className="bg-[#f6f6f6] p-6 rounded-lg">
                    <h3 className="font-bold text-[18px] mb-4">BlakQube Data (Decrypted)</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(blakQubeData).map(([key, value]) => (
                        <div key={key} className="flex flex-col">
                          <label className="text-[14px] font-medium text-gray-700 mb-2">
                            {labelMapping[key] || key}
                          </label>
                          <div className="relative group">
                            <div className="bg-[#e8f5e9] p-4 rounded-[5px] shadow-sm min-h-[45px] flex items-center">
                              <span className="text-[14px] text-gray-600 truncate">
                                {value}
                              </span>
                            </div>
                            {typeof value === 'string' && value.length > 40 && (
                              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50">
                                <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg max-w-[300px] break-all">
                                  <div className="text-sm">{value}</div>
                                  <div className="absolute left-4 bottom-[-6px] w-3 h-3 bg-gray-900 transform rotate-45"></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Encrypted BlakQube Data */}
                {encryptedBlakQubeData && !blakQubeData && (
                  <div className="bg-gray-700 border border-gray-600 p-6 rounded-lg">
                    <h3 className="font-bold text-[18px] text-white mb-4">BlakQube Data (Encrypted)</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(encryptedBlakQubeData).map(([key, value]) => (
                        <div key={key} className="flex flex-col">
                          <label className="text-[14px] font-medium text-white mb-2">
                            {labelMapping[key] || key}
                          </label>
                          <div className="relative group">
                            <div className="bg-[#ffebee] p-4 rounded-[5px] shadow-sm min-h-[45px] flex items-center">
                              <span className="text-[14px] text-gray-600 truncate">
                                {value}
                              </span>
                            </div>
                            {typeof value === 'string' && value.length > 40 && (
                              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50">
                                <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg max-w-[300px] break-all">
                                  <div className="text-sm">{value}</div>
                                  <div className="absolute left-4 bottom-[-6px] w-3 h-3 bg-gray-900 transform rotate-45"></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

export default IQubeNFTMinter
