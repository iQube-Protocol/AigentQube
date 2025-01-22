// iQube Type Definitions
export type IQubeType = 'DataQube' | 'ContentQube' | 'AgentQube';

export interface IQubeTemplate {
  id: string;
  type: IQubeType;
  createdAt: Date;
  metadata: {
    version: string;
    description: string;
  };
}

export interface MetaQube {
  iQubeIdentifier: string;
  iQubeCreator: string;
  iQubeType: IQubeType;
  ownerType: string;
  ownerIdentifiability: string;
  transactionDate: Date;
  sensitivity: {
    value: number;
    source: string;
  };
  verifiability: {
    value: number;
    source: string;
  };
  accuracy: {
    value: number;
    source: string;
  };
  risk: {
    value: number;
    source: string;
  };
}

export interface DataQube extends MetaQube {
  dataType: string;
  dataSource: string;
  dataComplexity: number;
}

export interface ContentQube extends MetaQube {
  contentType: string;
  contentSource: string;
  contentLength: number;
}

export interface AgentQube extends MetaQube {
  agentCapability: string;
  agentDomain: string;
  performanceScore: number;
}
