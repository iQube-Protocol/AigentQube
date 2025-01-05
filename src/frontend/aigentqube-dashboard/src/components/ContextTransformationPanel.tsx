import React from 'react';

interface ContextTransformationPanelProps {
  context: any;
  selectedAgent?: string | null;
}

const ContextTransformationPanel: React.FC<ContextTransformationPanelProps> = ({ context, selectedAgent }) => {
  const defaultInsights = [
    { label: 'Profession', value: 'Not Detected' },
    { label: 'Income Bracket', value: 'Not Available' },
    { label: 'Investment Interests', value: 'Pending' }
  ];

  const insights = context ? [
    { label: 'Profession', value: 'Software Engineer' },
    { label: 'Income Bracket', value: '$120,000/year' },
    { label: 'Investment Interests', value: 'Tech Startups' }
  ] : defaultInsights;

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
          {insights.map((insight, index) => (
            <div 
              key={index} 
              className="bg-gray-700 rounded p-4 flex flex-col"
            >
              <span className="text-gray-400 text-sm mb-1">
                {insight.label}
              </span>
              <span className="font-semibold">
                {insight.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {context && context.specializedState && (
        <div className="agent-adaptation mt-6">
          <h3 className="font-medium mb-2">Agent Adaptation</h3>
          <div className="bg-green-900 rounded p-4 space-y-2">
            <div className="flex items-center space-x-2">
              <span>🧠</span>
              <span>Switching to {context.specializedState}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>💼</span>
              <span>Generating Personalized Strategy</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>📊</span>
              <span>Analyzing Relevant Market Trends</span>
            </div>
          </div>
        </div>
      )}

      <div className="recommended-actions mt-6">
        <h3 className="font-medium mb-2">Recommended Actions</h3>
        <ul className="list-disc list-inside space-y-2 bg-gray-700 rounded p-4">
          <li>Startup Investment Strategy</li>
          <li>Tax Optimization for Professionals</li>
          <li>Blockchain Investment Opportunities</li>
        </ul>
      </div>
    </div>
  );
};

export default ContextTransformationPanel;
