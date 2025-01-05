import React, { useState } from 'react';

// Local icon replacements
const Icons = {
  FileLock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  ),
  Send: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  ),
  CircleUser: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <circle cx="12" cy="10" r="3"></circle>
      <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path>
    </svg>
  ),
  Layers: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
      <polyline points="2 17 12 22 22 17"></polyline>
      <polyline points="2 12 12 17 22 12"></polyline>
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

  const handleActionClick = (action: 'view' | 'decrypt' | 'share' | 'mint') => {
    if (!iQubeId) {
      alert('Please enter an iQube ID first');
      return;
    }

    switch (action) {
      case 'view':
        onViewMetaQube?.(iQubeId);
        break;
      case 'decrypt':
        onDecryptBlakQube?.(iQubeId);
        break;
      case 'share':
        onShareiQube?.(iQubeId);
        break;
      case 'mint':
        onMintiQube?.(iQubeId);
        break;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <div className="mb-4">
        <label htmlFor="iQubeId" className="block text-sm font-medium text-gray-300 mb-2">
          Enter iQube ID
        </label>
        <input 
          type="text" 
          id="iQubeId"
          value={iQubeId}
          onChange={(e) => setIQubeId(e.target.value)}
          placeholder="iQube Identifier"
          className="w-full bg-gray-700 border-none text-white rounded-md focus:ring-2 focus:ring-blue-500 p-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => handleActionClick('mint')}
          className="btn btn-primary flex items-center justify-center space-x-2"
        >
          <Icons.Layers className="w-5 h-5" />
          <span>Mint iQube</span>
        </button>

        <button 
          onClick={() => handleActionClick('view')}
          className="btn btn-primary flex items-center justify-center space-x-2"
        >
          <Icons.CircleUser className="w-5 h-5" />
          <span>View MetaQube</span>
        </button>

        <button 
          onClick={() => handleActionClick('decrypt')}
          className="btn btn-primary flex items-center justify-center space-x-2"
        >
          <Icons.FileLock className="w-5 h-5" />
          <span>Decrypt BlakQube</span>
        </button>

        <button 
          onClick={() => handleActionClick('share')}
          className="btn btn-primary flex items-center justify-center space-x-2"
        >
          <Icons.Send className="w-5 h-5" />
          <span>Share iQube</span>
        </button>
      </div>
    </div>
  );
};

export default IQubeOperations;
