import { IQubeData } from '../types/context';

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

export const mockIQubeProfiles: { [key: string]: IQubeData } = {
  'high-performance': {
    tokenId: 'iqube-high-001',
    userProfile: {
      profession: 'Software Engineer',
      industry: 'Tech',
      experience: 'Senior',
      interests: ['AI', 'Blockchain', 'Cloud Computing'],
      specializations: ['Machine Learning', 'Distributed Systems']
    },
    performanceMetrics: {
      computeCapacity: 0.95,
      dataProcessed: 0.92,
      uptime: 0.99,
      reliability: 0.97
    },
    aiMetrics: {
      modelAccuracy: 0.94,
      biasScore: 0.92,
      safetyScore: 0.96,
      privacyScore: 0.95
    },
    networkMetrics: {
      connectionStrength: 0.93,
      peersConnected: 0.88,
      consensusParticipation: 0.91,
      reputationScore: 0.94
    },
    sovereigntyMetrics: {
      dataControlScore: 0.96,
      identityStrength: 0.95,
      governanceParticipation: 0.89,
      privacyCompliance: 0.97
    },
    financialMetrics: {
      stakingBalance: 0.85,
      rewardsEarned: 0.88,
      stakingEfficiency: 0.92,
      networkContribution: 0.90
    }
  },
  'needs-optimization': {
    tokenId: 'iqube-opt-001',
    userProfile: {
      profession: 'Software Engineer',
      industry: 'Tech',
      experience: 'Senior',
      interests: ['Web Development', 'DevOps', 'Security'],
      specializations: ['Full Stack', 'Cloud Architecture']
    },
    performanceMetrics: {
      computeCapacity: 0.65,
      dataProcessed: 0.58,
      uptime: 0.82,
      reliability: 0.71
    },
    aiMetrics: {
      modelAccuracy: 0.68,
      biasScore: 0.62,
      safetyScore: 0.75,
      privacyScore: 0.69
    },
    networkMetrics: {
      connectionStrength: 0.61,
      peersConnected: 0.55,
      consensusParticipation: 0.59,
      reputationScore: 0.63
    },
    sovereigntyMetrics: {
      dataControlScore: 0.72,
      identityStrength: 0.68,
      governanceParticipation: 0.64,
      privacyCompliance: 0.71
    },
    financialMetrics: {
      stakingBalance: 0.58,
      rewardsEarned: 0.52,
      stakingEfficiency: 0.61,
      networkContribution: 0.57
    }
  },
  'security-focused': {
    tokenId: 'iqube-sec-001',
    userProfile: {
      profession: 'Software Engineer',
      industry: 'Tech',
      experience: 'Senior',
      interests: ['Cybersecurity', 'Privacy', 'Cryptography'],
      specializations: ['Security Architecture', 'Zero Trust']
    },
    performanceMetrics: {
      computeCapacity: 0.82,
      dataProcessed: 0.79,
      uptime: 0.88,
      reliability: 0.91
    },
    aiMetrics: {
      modelAccuracy: 0.85,
      biasScore: 0.89,
      safetyScore: 0.96,
      privacyScore: 0.94
    },
    networkMetrics: {
      connectionStrength: 0.87,
      peersConnected: 0.82,
      consensusParticipation: 0.85,
      reputationScore: 0.88
    },
    sovereigntyMetrics: {
      dataControlScore: 0.95,
      identityStrength: 0.97,
      governanceParticipation: 0.92,
      privacyCompliance: 0.96
    },
    financialMetrics: {
      stakingBalance: 0.78,
      rewardsEarned: 0.75,
      stakingEfficiency: 0.81,
      networkContribution: 0.79
    }
  }
};

export class MockIQubeService {
  private currentProfile: string = 'high-performance';

  public setProfile(profile: string): void {
    if (profile in mockIQubeProfiles) {
      this.currentProfile = profile;
    } else {
      throw new Error(`Profile ${profile} not found`);
    }
  }

  public getCurrentData(): IQubeData {
    return mockIQubeProfiles[this.currentProfile];
  }

  public getAvailableProfiles(): string[] {
    return Object.keys(mockIQubeProfiles);
  }
}
