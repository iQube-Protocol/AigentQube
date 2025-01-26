// iQube Type Definitions

export type OwnerType = 'Person' | 'Organization' | 'Thing';
export type OwnerIdentifiability = 'Identifiable' | 'Semi-Identifiable' | 'Anonymous' | 'Semi-Anonymous';
export type IQubeType = 'DataQube' | 'ContentQube' | 'AgentQube';

// Generic Metadata Scoring (1-10)
export interface IQubeScore {
  value: number; // 1-10
  source?: string; // Optional source of the score
}

// MetaQube Template (Keys without values)
export interface MetaQubeTemplate {
  iQubeIdentifier: null;
  iQubeCreator: null;
  ownerType: null;
  ownerIdentifiability: null;
  iQubeType: null;
  transactionDate: null;
  sensitivity: null;
  verifiability: null;
  accuracy: null;
  risk: null;
}

// Populated MetaQube
export interface MetaQube extends Omit<MetaQubeTemplate, 'iQubeIdentifier'> {
  iQubeIdentifier: string;
  iQubeCreator: string;
  ownerType: OwnerType;
  ownerIdentifiability: OwnerIdentifiability;
  iQubeType: IQubeType;
  transactionDate: Date;
  sensitivity: IQubeScore;
  verifiability: IQubeScore;
  accuracy: IQubeScore;
  risk: IQubeScore;
  blakQubeTemplate?: BlakQubeTemplate; // Associated BlakQube Template
}

// BlakQube Template (Keys without values)
export interface BlakQubeTemplate {
  [key: string]: {
    value: null;
    source: string; // Source of potential value
    type: string; // Data type (string, number, etc.)
  };
}

// Encrypted/Decrypted BlakQube
export interface BlakQube {
  [key: string]: {
    value: any;
    source: string;
    type: string;
    encrypted?: boolean;
  };
}

// iQube Summary
export interface IQubeSummary {
  iQubeIdentifier: string;
  iQubeCreator: string;
  scores: {
    sensitivity: number;
    verifiability: number;
    accuracy: number;
    risk: number;
  };
}

// Specific Qube Types
export interface DataQube extends MetaQube {
  iQubeType: 'DataQube';
  blakQube: BlakQube; // Structured data payload
}

export interface ContentQube extends MetaQube {
  iQubeType: 'ContentQube';
  blakQube: {
    contentType: string;
    content: Blob | string; // Blob or base64 encoded content
    description?: string;
    usageRights?: string;
    version?: string;
    rarity?: string;
  };
}

export interface AgentQube extends MetaQube {
  iQubeType: 'AgentQube';
  blakQube: {
    apiAccessKeys?: Record<string, string>;
    performanceMetrics: {
      contextDepth?: number;
      realTimeDataSources?: string[];
    };
  };
}

// TokenQube Representation
export interface TokenQube {
  tokenId: string;
  iQubeTemplateId: string;
  owner: string;
  mintedAt: Date;
  metadata: MetaQube;
}

// iQube Template
export interface IQubeTemplate {
  metaQubeTemplate: MetaQubeTemplate;
  blakQubeTemplate: BlakQubeTemplate;
  tokenQube: TokenQube;
}

// Utility Types for Panels and Components
export interface IQubeRegistrationPanel {
  currentStep: 'MetaQube' | 'BlakQube' | 'TokenQube';
  templateInProgress?: IQubeTemplate;
}

export interface IQubeManagementComponent {
  availableTemplates: IQubeTemplate[];
  selectedTemplate?: IQubeTemplate;
}

// Comprehensive iQube Management Interface
export interface IQubeManager {
  registerTemplate(template: IQubeTemplate): Promise<string>;
  createIQube(template: IQubeTemplate, data: any): Promise<MetaQube>;
  getIQubeSummary(iQubeId: string): Promise<IQubeSummary>;
  encryptBlakQube(blakQube: BlakQube): Promise<BlakQube>;
  decryptBlakQube(blakQube: BlakQube): Promise<BlakQube>;
}
