export interface ContextDomain {
  name: string;
  description: string;
  keywords: string[];
  confidence_score: number;
  metadata?: Record<string, any>;
}

export interface ContextTransformation {
  sourceContext: ContextDomain;
  targetContext: ContextDomain;
  transformationType: 'merge' | 'split' | 'update' | 'delete';
  timestamp: Date;
}

export interface UserProfile {
  profession: string;
  industry: string;
  experience: string;
  interests: string[];
  specializations: string[];
}

export interface IQubeData {
  tokenId: string;
  userProfile: UserProfile;
  performanceMetrics: {
    computeCapacity: number;
    dataProcessed: number;
    uptime: number;
    reliability: number;
  };
  aiMetrics: {
    modelAccuracy: number;
    biasScore: number;
    safetyScore: number;
    privacyScore: number;
  };
  networkMetrics: {
    connectionStrength: number;
    peersConnected: number;
    consensusParticipation: number;
    reputationScore: number;
  };
  sovereigntyMetrics: {
    dataControlScore: number;
    identityStrength: number;
    governanceParticipation: number;
    privacyCompliance: number;
  };
  financialMetrics: {
    stakingBalance: number;
    rewardsEarned: number;
    stakingEfficiency: number;
    networkContribution: number;
  };
}

export interface ContextInsight {
  label: string;
  value: string | number;
  category: string;
  importance: number;
}

export interface DomainContext {
  specializedState: string;
  iQubeData?: IQubeData;
  insights: ContextInsight[];
  lastUpdate: Date;
}
