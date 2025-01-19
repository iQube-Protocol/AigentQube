import React, { useState } from 'react';

interface ChatInterfaceProps {
  context?: any;
  className?: string;
}

interface Message {
  id: number;
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  context,
  className = ''
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');

  const sendMessage = () => {
    if (inputMessage.trim() === '') return;

    const newUserMessage: Message = {
      id: Date.now(),
      sender: 'user',
      text: inputMessage,
      timestamp: new Date()
    };

    const agentResponse: Message = {
      id: Date.now() + 1,
      sender: 'agent',
      text: context && context.specializedState 
        ? `Based on your ${context.specializedState} context, here's a tailored response.` 
        : 'How can I assist you today?',
      timestamp: new Date()
    };

    setMessages([...messages, newUserMessage, agentResponse]);
    setInputMessage('');
  };

  return (
    <div className={`chat-interface bg-gray-800 rounded-lg p-6 w-full ${className}`}>
      <div className="chat-header flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {context && context.specializedState 
            ? `${context.specializedState} Assistant` 
            : 'AigentQube Chat'}
        </h2>
        <div className="agent-status flex items-center space-x-2">
          <span className="status-indicator w-3 h-3 rounded-full bg-green-500"></span>
          <span>Active</span>
        </div>
      </div>

      <div className="chat-messages h-96 overflow-y-auto mb-4 bg-gray-900 rounded p-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`message mb-3 ${
              message.sender === 'user' 
                ? 'text-right' 
                : 'text-left'
            }`}
          >
            <div 
              className={`inline-block p-3 rounded-lg max-w-[90%] ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-200'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input flex space-x-2">
        <input 
          type="text" 
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow p-3 rounded bg-gray-700 text-white"
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button 
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded transition duration-300"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
