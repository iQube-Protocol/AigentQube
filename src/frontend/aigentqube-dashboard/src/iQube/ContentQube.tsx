import React, { useState } from 'react';
import { pinata } from '../utils/pinata-config';
import PolygonNFTInterface from '../utils/MetaContract';
import axios from 'axios';

interface MetadataFields {
  iQubeIdentifier: string
  iQubeCreator: string
  ownerType: 'Individual' | 'Organization' 
  iQubeContentType: 'Data' | 'Agent' | 'png' | 'jpeg' | 'pdf' | 'mp3' | 'mp4' |'Other'
  ownerIdentifiability: 'Anonymous' | 'Semi-Anonymous' | 'Identifiable' | 'Semi-Identifiable'
  transactionDate: string
  sensitivityScore: number
  verifiabilityScore: number
  accuracyScore: number
  riskScore: number
}

interface BlakQubeFields {
  name: string;
  description: string;
}

interface ContentQubeFields {
  metaQube: MetadataFields, 
  blakQube: BlakQubeFields
}

interface ContentQubeProps {
  nftInterface: PolygonNFTInterface;
  onContentChange?: (content: any) => void;
}

const ContentQube: React.FC<ContentQubeProps> = ({ nftInterface, onContentChange }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenId, setTokenId] = useState<string | null>(null);
  
  // State for BlakQube structured data
  const [blakQubeData, setBlakQubeData] = useState<BlakQubeFields>({
    name: '',
    description: ''
  });

  // State for MetaQube data
  const [metaQubeData, setMetaQubeData] = useState<MetadataFields>({
    iQubeIdentifier: '',
    iQubeCreator: '',
    ownerType: 'Individual',
    iQubeContentType: 'jpeg',
    ownerIdentifiability: 'Semi-Anonymous',
    transactionDate: new Date().toISOString(),
    sensitivityScore: 5,
    verifiabilityScore: 5,
    accuracyScore: 5,
    riskScore: 5
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create file preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBlakQubeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBlakQubeData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // const handleMetaQubeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLDataElement>) => {
  //   const { name, value } = e.target;
    
  //   // For numeric fields, ensure value is between 1 and 10
  //   if (
  //     name === 'sensitivityScore' || 
  //     name === 'verifiabilityScore' || 
  //     name === 'accuracyScore' || 
  //     name === 'riskScore'
  //   ) {
  //     const numValue = Number(value);
  //     const clampedValue = Math.min(Math.max(numValue, 1), 10);
      
  //     setMetaQubeData(prev => ({
  //       ...prev,
  //       [name]: clampedValue
  //     }));
  //     return;
  //   }
    
  //   // For other fields, proceed as normal
  //   setMetaQubeData(prev => ({
  //     ...prev,
  //     [name]: value
  //   }));
  // };

  const handleMetaQubeChange = (
    field: string,
    value: string | number,
  ) => {
    setMetaQubeData(prev => ({
          ...prev,
          [field]: value
        }));
  }

  //added
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

  // const handleMint = async () => {
  //   if (!selectedFile) {
  //     setError('Please select a file to mint');
  //     return;
  //   }

  //   setIsLoading(true);
  //   setError(null);

  //   try {
  //     // Upload file to IPFS
  //     const fileUpload = await pinata.upload.file(selectedFile);
      
      

  //     // Prepare metadata
  //     const metaQube: MetadataFields = {
  //       ...metaQubeData,
  //       iQubeIdentifier: `ContentQube-${Date.now()}`,
  //       iQubeContentType: selectedFile.type.includes('image') ? 'Other' : 
  //                         selectedFile.type.includes('video') ? 'mp4' :
  //                         selectedFile.type.includes('audio') ? 'mp3' :
  //                         selectedFile.type.includes('pdf') ? 'pdf' :
  //                         selectedFile.type.includes('text') ? 'txt' : 'Other',
  //     };

  //     // Prepare encrypted content data
  //     const contentQubeData = {
  //       metaQube,
  //       blakQube: {
  //         ...blakQubeData,
  //         blobFile: selectedFile,
  //         blobPreview: filePreview,
  //         encryptedFileHash: fileUpload.IpfsHash,
  //       }
  //     };

  //     // Encrypt the content
  //     const encryptedFile = await axios.post(
  //       `${process.env.REACT_APP_SERVER_URL}/encrypt-file`, 
  //       { file: fileUpload.IpfsHash }
  //     );

  //     // Encrypt BlakQube data
  //     const encryptedBlakQube = await axios.post(
  //       `${process.env.REACT_APP_SERVER_URL}/encrypt-data`,
  //       {
  //         ...contentQubeData.blakQube,
  //         blobFile: null,
  //         blobPreview: null,
  //         encryptedFileHash: fileUpload.IpfsHash,
  //         encryptedFileKey: encryptedFile.data.key
  //       }
  //     );

  //     if (!encryptedBlakQube.data.success) {
  //       throw new Error('Failed to encrypt BlakQube data');
  //     }

  //     // Create metadata
  //     const metadata = JSON.stringify({
  //       name: `ContentQube NFT #${Date.now()}`,
  //       description: 'An encrypted ContentQube NFT',
  //       image: encryptedFile.data,
  //       attributes: [
  //         { trait_type: 'metaQube', value: contentQubeData.metaQube },
  //         { trait_type: 'blakQube', value: encryptedBlakQube.data.encryptedData.blakQube }
  //       ],
  //     });

  //     // Upload metadata to IPFS
  //     const metadataUpload = await pinata.upload.json(JSON.parse(metadata));

  //     // Mint NFT
  //     const receipt = await nftInterface.mintQube(
  //       `ipfs://${metadataUpload.IpfsHash}`,
  //       encryptedBlakQube.data.encryptedData.key
  //     );

  //     const newTokenId = await nftInterface.getTokenIdFromReceipt(receipt);
  //     if (newTokenId) {
  //       setTokenId(newTokenId);
  //       console.log('NFT minted successfully with token ID:', newTokenId);
        
  //       // Call onContentChange if provided
  //       if (onContentChange) {
  //         onContentChange({
  //           metaQube,
  //           blakQube: {
  //             ...contentQubeData.blakQube,
  //             encryptedFileKey: encryptedFile.data.key,
  //             tokenId: newTokenId
  //           }
  //         });
  //       }
  //     } else {
  //       console.log("NFT minted successfully, but couldn't retrieve token ID");
  //     }
  //   } catch (error) {
  //     console.error('Error minting NFT:', error);
  //     setError(String(error));
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };


  const handleMint = async () => {
    if (!selectedFile) {
      setError('Please select a file to mint');
      return;
    }
    console.log("MEOW")

    setIsLoading(true);
    setError('');

    try {
      // Upload file to IPFS
      const fileUpload = await pinata.upload.file(selectedFile);

      // Get Enc data.
      // IDK if i need this the working minter has it 
      // but this hashes the hash to hash again(when we create the qube and mint it))
      const encrypted = await getEncryptionData(fileUpload.IpfsHash)
      // Encrypt BlakQube data
      const { data: encryptedBlakQube } = await axios.post(
        'https://iqubes-server.onrender.com/encrypt-member-qube',
        {
          ...blakQubeData,
          blobFile: null, // Remove the file object before encrypting
          blobPreview: null,
          encryptedFileHash: fileUpload.IpfsHash,
          encryptedFileKey: encrypted.key
        }
      )

      if (!encryptedBlakQube.success) {
        throw new Error('Failed to encrypt BlakQube data')
      }
  
      // Create metadata with both MetaQube and encrypted BlakQube
      const metadata = JSON.stringify({
        name: metaQubeData.iQubeIdentifier,
        //description: metaQubeData.description,
        image: encrypted.data,
        attributes: [
          { trait_type: 'metaQube', value: metaQubeData },
          { trait_type: 'blakQube', value: encryptedBlakQube}
        ],
      })


      // Upload metadata to IPFS
      const metadataUpload = await pinata.upload.json(JSON.parse(metadata));

      // Mint NFT
      const receipt = await nftInterface.mintQube(
        `ipfs://${metadataUpload.IpfsHash}`,
        encrypted.key,
      );

      const newTokenId = await nftInterface.getTokenIdFromReceipt(receipt);
      if (newTokenId) {
        setTokenId(newTokenId);
        console.log('NFT minted successfully with token ID:', newTokenId);
        
        // Call onContentChange if provided
        /*
        if (onContentChange) {
          onContentChange({
            metaQube,
            blakQube: {
              ...contentQubeData.blakQube,
              encryptedFileKey: encrypted.data.key,
              tokenId: newTokenId
            }
          });
        }
        */

      } else {
        console.log("NFT minted successfully, but couldn't retrieve token ID");
      }
    } catch (error) {
      console.error('Error minting NFT:', error);
      setError(String(error));
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="w-full">
      
      {/* MetaQube Data Section */}
      <div className="bg-gray-700 border border-gray-600 p-6 rounded-lg">
        <div className="flex items-center mb-[10px]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-[10px] text-blue-500">
            <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
          </svg>
          <h3 className="font-bold text-[18px] text-white">MetaQube</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* First Row: iQube Identifier and iQube Creator */}
          <div>
            <label htmlFor="iQubeIdentifier" className="block text-[12px] font-medium text-white mb-2">
              iQube Identifier
            </label>
            <input 
              id="iQubeIdentifier"
              type="text" 
              name="iQubeIdentifier"
              placeholder="Enter iQube Identifier"
              value={metaQubeData.iQubeIdentifier}
              onChange={(e) =>
                handleMetaQubeChange(
                  'iQubeIdentifier',
                  e.target.value,
                )
              }
              className="w-full p-[10px] border rounded-[5px] bg-[#e8f5e9]"
              required
            />
          </div>
          <div>
            <label htmlFor="iQubeCreator" className="block text-[12px] font-medium text-white mb-2">iQube Creator</label>
            <input 
              id="iQubeCreator"
              type="text" 
              name="iQubeCreator"
              placeholder="Enter iQube Creator"
              value={metaQubeData.iQubeCreator}
              onChange={handleMetaQubeChange}
              className="w-full p-[10px] border rounded-[5px] bg-[#e8f5e9]"
              required
            />
          </div>

          {/* Second Row: Owner Type and Owner Identifiability */}
          <div>
            <label htmlFor="ownerType" className="block text-[12px] font-medium text-white mb-2">Owner Type</label>
            <select 
              id="ownerType"
              name="ownerType"
              value={metaQubeData.ownerType}
              onChange={handleMetaQubeChange}
              className="w-full p-[10px] border rounded-[5px] bg-[#e8f5e9]"
              required
            >
              <option value="Individual">Individual</option>
              <option value="Organisation">Organisation</option>
            </select>
          </div>
          <div>
            <label htmlFor="iQubeContentType" className="block text-[12px] font-medium text-white mb-2">Content Type</label>
            <select 
              id="iQubeContentType"
              name="iQubeContentType"
              value={metaQubeData.iQubeContentType}
              onChange={handleMetaQubeChange}
              className="w-full p-[10px] border rounded-[5px] bg-[#e8f5e9]"
              required
            >
              <option value="mp3">jpeg</option>
              <option value="mp4">png</option>
              <option value="pdf">pdf</option>
              <option value="txt">mp3</option>
              <option value="Code">mp4</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Third Row: Content Type and Transaction Date */}
          <div className="flex flex-col">
            <label htmlFor="ownerIdentifiability" className="block text-[12px] font-medium text-white mb-2">Owner Identifiability</label>
            <select 
              id="ownerIdentifiability"
              name="ownerIdentifiability"
              value={metaQubeData.ownerIdentifiability}
              onChange={handleMetaQubeChange}
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
            <label htmlFor="transactionDate" className="block text-[12px] font-medium text-white mb-2">Transaction Date</label>
            <input 
              id="transactionDate"
              type="date" 
              name="transactionDate"
              value={metaQubeData.transactionDate}
              onChange={handleMetaQubeChange}
              className="w-full p-[10px] border rounded-[5px] bg-[#e8f5e9]"
              required
            />
          </div>

          {/* Fourth Row: All Four Scores */}
          
        </div>
        <div className="grid grid-cols-4 gap-4 pt-4 items-end">
            <div>
              <label className="block text-[12px] font-medium text-white mb-2">
                Sensitivity Score
              </label>
              <select
                id="sensitivityScore"
                name="sensitivityScore"
                value={metaQubeData.sensitivityScore}
                onChange={handleMetaQubeChange}
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
                id="verifiabilityScore"
                name="verifiabilityScore"
                value={metaQubeData.verifiabilityScore}
                onChange={handleMetaQubeChange}
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
                id="accuracyScore"
                name="accuracyScore"
                value={metaQubeData.accuracyScore}
                onChange={handleMetaQubeChange}
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
                id="riskScore"
                name="riskScore"
                value={metaQubeData.riskScore}
                onChange={handleMetaQubeChange}
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

      {/* BlakQube Structured Data Section */}
      <div className="bg-gray-700 border border-gray-600 p-6 rounded-lg mt-6">
        <div className="flex items-center mb-[10px]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-[10px] text-red-500">
            <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
          </svg>
          <h3 className="font-bold text-[18px] text-white">BlakQube</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label htmlFor="format" className="text-sm mb-1 text-white">Name</label>
            <input 
              id="format"
              type="text" 
              name="format"
              placeholder="Enter Name"
              value={blakQubeData.name}
              onChange={handleBlakQubeChange}
              className="w-[95%] border rounded-[5px] p-[10px] bg-[#ffebee]"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="episode" className="text-sm mb-1 text-white">Description</label>
            <input 
              id="episode"
              type="text" 
              name="episode"
              placeholder="Enter Description"
              value={blakQubeData.description}
              onChange={handleBlakQubeChange}
              className="w-[95%] border rounded-[5px] p-[10px] bg-[#ffebee]"
            />
          </div>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="bg-gray-700 border border-gray-600 p-6 rounded-lg mt-6">
        <div className="flex items-center mb-[10px]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-[10px] text-red-500">
            <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
          </svg>
          <h3 className="font-bold text-[18px] text-white">File Upload</h3>
        </div>
        <input 
          type="file" 
          onChange={handleFileUpload}
          className="mt-1 block w-full bg-red-50 rounded-lg"
        />
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

      {/* Mint Button */}
      <button 
        type="submit" 
        disabled={isLoading || !selectedFile}
        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300"
        onClick={handleMint}
      >
        {isLoading ? 'Encrypting...' : 'Encrypt BlakQube'}
      </button>
      
      {/* Error and Token ID Display */}
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {tokenId && <p className="text-green-500 mt-2">Minted Token ID: {tokenId}</p>}
    </div>
  );
};

export default ContentQube;
