import React from 'react';

export interface ContextTransformationPanelProps {
  context?: any;
  selectedAgent?: string | null;
}

const ContextTransformationPanel: React.FC<ContextTransformationPanelProps> = ({ 
  context = null, 
  selectedAgent 
}) => {
  const defaultInsights = [
    { label: 'Profession', value: context?.profession || 'Not Detected' },
    { label: 'Income Bracket', value: context?.incomeBracket || 'Not Available' },
    { label: 'Interaction Complexity', value: context?.interactionComplexity || 'Low' },
    { label: 'Domain Expertise', value: context?.domainExpertise || 'General' },
    { label: 'Contextual Adaptability', value: context?.adaptability || 'Basic' },
  ];

  return (
    <div className="context-transformation-panel bg-gray-800 rounded-lg p-6 mb-4">
      <h2 className="text-xl font-semibold mb-4">Context Transformation</h2>
      
      {selectedAgent ? (
        <div>
          <p>Transforming context for Agent: {selectedAgent}</p>
          {/* Add more detailed context transformation UI here */}
        </div>
      ) : (
        <p>Select an agent to view context transformation details.</p>
      )}
      
      <div className="payload-insights">
        <h3 className="font-medium mb-2">Decrypted Payload Insights</h3>
        <div className="grid grid-cols-3 gap-4">
          {defaultInsights.map((insight, index) => (
            <div 
              key={index} 
              className="bg-gray-700 p-3 rounded-lg"
            >
              <p className="text-sm text-gray-400">{insight.label}</p>
              <p className="text-white font-semibold">{insight.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContextTransformationPanel;
