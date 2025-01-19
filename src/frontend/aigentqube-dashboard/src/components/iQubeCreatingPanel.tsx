import React, { useState } from 'react';
import Web3 from 'web3';

interface iQubeCreatingPanelProps {
  web3: Web3;
  account: string;
}

const iQubeCreatingPanel: React.FC<iQubeCreatingPanelProps> = ({ web3, account }) => {
  const [activeTokenType, setActiveTokenType] = useState<'DataQube' | 'ContentQube' | 'AgentQube' | null>(null);
  
  // DataQube State
  const [dataQubeDetails, setDataQubeDetails] = useState({
    iQubeType: 'DataQube',
    encryptionLevel: 'Standard',
    dataPoints: [{ name: '', value: '', source: '' }]
  });

  // ContentQube State
  const [contentQubeDetails, setContentQubeDetails] = useState({
    iQubeType: 'ContentQube',
    contentType: '',
    usageRights: '',
    accessLevel: '',
    uploadedFile: null as File | null,
    filePreview: null as string | null
  });

  // AgentQube State
  const [agentQubeDetails, setAgentQubeDetails] = useState({
    iQubeType: 'AgentQube',
    encryptionLevel: 'High',
    apiKey: '',
    name: '',
    domain: '',
    capabilities: '',
    specialization: '',
    integrations: ''
  });

  const addDataPoint = () => {
    setDataQubeDetails(prev => ({
      ...prev,
      dataPoints: [...prev.dataPoints, { name: '', value: '', source: '' }]
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setContentQubeDetails(prev => ({
        ...prev,
        uploadedFile: file,
        filePreview: URL.createObjectURL(file)
      }));
    }
  };

  const renderTokenTypeSelector = () => (
    <div className="grid grid-cols-3 gap-2 mb-4">
      {['DataQube', 'ContentQube', 'AgentQube'].map(type => (
        <button
          key={type}
          onClick={() => setActiveTokenType(type as any)}
          className={`
            py-2 rounded transition-all duration-300 ease-in-out
            ${activeTokenType === type 
              ? 'bg-[#047857] text-white' 
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}
          `}
        >
          {type}
        </button>
      ))}
    </div>
  );

  const renderDataQubeForm = () => (
    <div className="space-y-4">
      {/* First Row: iQube Type and Encryption Level */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-700 p-2 rounded">
          <span className="text-gray-400 block text-xs">iQube Type</span>
          <select 
            value={dataQubeDetails.iQubeType}
            onChange={(e) => setDataQubeDetails(prev => ({ ...prev, iQubeType: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded"
          >
            <option value="DataQube">DataQube</option>
          </select>
        </div>
        <div className="bg-gray-700 p-2 rounded">
          <span className="text-gray-400 block text-xs">Encryption Level</span>
          <select 
            value={dataQubeDetails.encryptionLevel}
            onChange={(e) => setDataQubeDetails(prev => ({ ...prev, encryptionLevel: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded"
          >
            <option value="Standard">Standard</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>

      {/* Data Points with Add Button */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="text-white">Data Points</h4>
          <button 
            onClick={addDataPoint}
            className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700"
          >
            +
          </button>
        </div>
        {dataQubeDetails.dataPoints.map((point, index) => (
          <div key={index} className="grid grid-cols-3 gap-2">
            <input 
              placeholder="Data Point Name"
              className="bg-gray-800 text-white p-2 rounded"
            />
            <input 
              placeholder="Data Point Value"
              className="bg-gray-800 text-white p-2 rounded"
            />
            <input 
              placeholder="Source"
              className="bg-gray-800 text-white p-2 rounded"
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderContentQubeForm = () => (
    <div className="space-y-4">
      {/* First Row: Content Type and Usage Rights */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-700 p-2 rounded">
          <span className="text-gray-400 block text-xs">Content Type</span>
          <select 
            value={contentQubeDetails.contentType}
            onChange={(e) => setContentQubeDetails(prev => ({ ...prev, contentType: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded"
          >
            <option>Document</option>
            <option>Image</option>
            <option>Video</option>
          </select>
        </div>
        <div className="bg-gray-700 p-2 rounded">
          <span className="text-gray-400 block text-xs">Usage Rights</span>
          <select 
            value={contentQubeDetails.usageRights}
            onChange={(e) => setContentQubeDetails(prev => ({ ...prev, usageRights: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded"
          >
            <option>Private</option>
            <option>Shared</option>
            <option>Public</option>
          </select>
        </div>
      </div>

      {/* Second Row: Browse/Upload and Access Level */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-700 p-2 rounded">
          <span className="text-gray-400 block text-xs">Upload Content</span>
          <input 
            type="file"
            onChange={handleFileUpload}
            className="w-full bg-gray-800 text-white rounded"
          />
        </div>
        <div className="bg-gray-700 p-2 rounded">
          <span className="text-gray-400 block text-xs">Access Level</span>
          <select 
            value={contentQubeDetails.accessLevel}
            onChange={(e) => setContentQubeDetails(prev => ({ ...prev, accessLevel: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded"
          >
            <option>Read</option>
            <option>Write</option>
            <option>Execute</option>
          </select>
        </div>
      </div>

      {/* File Preview */}
      {contentQubeDetails.filePreview && (
        <div className="mt-4 bg-gray-700 p-2 rounded">
          <span className="text-gray-400 block text-xs mb-2">File Preview</span>
          <img 
            src={contentQubeDetails.filePreview} 
            alt="Uploaded Content" 
            className="max-w-full h-auto rounded"
          />
        </div>
      )}
    </div>
  );

  const renderAgentQubeForm = () => (
    <div className="space-y-4">
      {/* First Row: iQube Type and Encryption Level */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-700 p-2 rounded">
          <span className="text-gray-400 block text-xs">iQube Type</span>
          <select 
            value={agentQubeDetails.iQubeType}
            onChange={(e) => setAgentQubeDetails(prev => ({ ...prev, iQubeType: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded"
          >
            <option>AgentQube</option>
          </select>
        </div>
        <div className="bg-gray-700 p-2 rounded">
          <span className="text-gray-400 block text-xs">Encryption Level</span>
          <select 
            value={agentQubeDetails.encryptionLevel}
            onChange={(e) => setAgentQubeDetails(prev => ({ ...prev, encryptionLevel: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded"
          >
            <option>High</option>
            <option>Standard</option>
          </select>
        </div>
      </div>

      {/* API Key Row */}
      <div className="bg-gray-700 p-2 rounded">
        <span className="text-gray-400 block text-xs">API Key</span>
        <input 
          type="text"
          value={agentQubeDetails.apiKey}
          onChange={(e) => setAgentQubeDetails(prev => ({ ...prev, apiKey: e.target.value }))}
          placeholder="Generate or Enter API Key"
          className="w-full bg-gray-800 text-white p-2 rounded"
        />
      </div>

      {/* Remaining Rows */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-700 p-2 rounded">
          <span className="text-gray-400 block text-xs">Name</span>
          <input 
            type="text"
            value={agentQubeDetails.name}
            onChange={(e) => setAgentQubeDetails(prev => ({ ...prev, name: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded p-2"
          />
        </div>
        <div className="bg-gray-700 p-2 rounded">
          <span className="text-gray-400 block text-xs">Domain</span>
          <input 
            type="text"
            value={agentQubeDetails.domain}
            onChange={(e) => setAgentQubeDetails(prev => ({ ...prev, domain: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded p-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-700 p-2 rounded">
          <span className="text-gray-400 block text-xs">Capabilities</span>
          <input 
            type="text"
            value={agentQubeDetails.capabilities}
            onChange={(e) => setAgentQubeDetails(prev => ({ ...prev, capabilities: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded p-2"
          />
        </div>
        <div className="bg-gray-700 p-2 rounded">
          <span className="text-gray-400 block text-xs">Specialization</span>
          <input 
            type="text"
            value={agentQubeDetails.specialization}
            onChange={(e) => setAgentQubeDetails(prev => ({ ...prev, specialization: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded p-2"
          />
        </div>
      </div>

      <div className="bg-gray-700 p-2 rounded">
        <span className="text-gray-400 block text-xs">Integrations</span>
        <input 
          type="text"
          value={agentQubeDetails.integrations}
          onChange={(e) => setAgentQubeDetails(prev => ({ ...prev, integrations: e.target.value }))}
          className="w-full bg-gray-800 text-white rounded p-2"
        />
      </div>
    </div>
  );

  const renderActiveTokenForm = () => {
    switch(activeTokenType) {
      case 'DataQube': return renderDataQubeForm();
      case 'ContentQube': return renderContentQubeForm();
      case 'AgentQube': return renderAgentQubeForm();
      default: return null;
    }
  };

  return (
    <div className="iqube-creating-panel bg-gray-800 rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-semibold mb-4">iQube Creating</h2>
      
      {renderTokenTypeSelector()}
      
      {activeTokenType && (
        <div className="space-y-4">
          {renderActiveTokenForm()}
          
          <button 
            className="w-full py-2 rounded bg-[#047857] text-white hover:bg-green-800 transition-colors"
          >
            Mint {activeTokenType}
          </button>
        </div>
      )}
    </div>
  );
};

export default iQubeCreatingPanel;
