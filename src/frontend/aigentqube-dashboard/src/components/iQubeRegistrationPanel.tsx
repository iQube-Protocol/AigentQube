import React, { useState } from 'react';
import { iQubeService } from '../../../../services/iQubeService';
import { OrchestrationAgent } from '../services/OrchestrationAgent';
import { IQubeTemplate, DataQube } from '../../../../types/iQube';

export const IQubeRegistrationPanel: React.FC = () => {
  const [iQubeTemplate, setIQubeTemplate] = useState<IQubeTemplate | null>(null);
  const [populatedIQube, setPopulatedIQube] = useState<DataQube | null>(null);

  const createIQubeTemplate = async () => {
    const template = await iQubeService.createIQubeTemplate();
    setIQubeTemplate(template);
  };

  const populateIQubeTemplate = async () => {
    if (!iQubeTemplate) return;

    const mockData = {
      personalFinance: {
        annualIncome: 120000,
        investmentPortfolio: ['stocks', 'bonds', 'crypto']
      },
      professionalBackground: {
        title: 'Senior Software Engineer',
        industry: 'AI/Machine Learning'
      }
    };

    const populated = await iQubeService.populateIQubeTemplate(iQubeTemplate, mockData);
    setPopulatedIQube(populated as DataQube);

    // Integrate with OrchestrationAgent
    const orchestrationAgent = new OrchestrationAgent();
    await orchestrationAgent.processIQubeContext({
      type: 'DataQube',
      description: 'Personal Financial and Professional Profile',
      performanceMetrics: {
        complexityHandling: 7,
        accuracyRate: 0.85,
        responseTime: 3000
      }
    });
  };

  const encryptIQube = async () => {
    if (!populatedIQube) return;
    const encryptedBlakQube = await iQubeService.encryptBlakQube(populatedIQube.blakQube);
    console.log('Encrypted BlakQube:', encryptedBlakQube);
  };

  return (
    <div className="iQube-registration-panel">
      <h2>iQube Registration</h2>
      <div className="actions">
        <button onClick={createIQubeTemplate}>
          Create iQube Template
        </button>
        {iQubeTemplate && (
          <button onClick={populateIQubeTemplate}>
            Populate iQube Template
          </button>
        )}
        {populatedIQube && (
          <button onClick={encryptIQube}>
            Encrypt iQube
          </button>
        )}
      </div>
      {iQubeTemplate && (
        <div className="template-details">
          <h3>iQube Template</h3>
          <pre>{JSON.stringify(iQubeTemplate, null, 2)}</pre>
        </div>
      )}
      {populatedIQube && (
        <div className="populated-iqube">
          <h3>Populated iQube</h3>
          <pre>{JSON.stringify(populatedIQube, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
