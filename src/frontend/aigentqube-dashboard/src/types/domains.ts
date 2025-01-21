export enum SpecializedDomain {
  CRYPTO_ANALYST = 'Crypto Analyst',
  AI_COACH = 'Agent AI Coach',
  BLOCKCHAIN_ADVISOR = 'Bitcoin Advisor',
  GUARDIAN_AIGENT = 'Guardian Aigent'
}

export interface DomainMetadata {
  id: SpecializedDomain;
  name: string;
  description: string;
  defaultInstructions: string;
}

export const DOMAIN_METADATA: Record<SpecializedDomain, DomainMetadata> = {
  [SpecializedDomain.CRYPTO_ANALYST]: {
    id: SpecializedDomain.CRYPTO_ANALYST,
    name: 'Crypto Analyst',
    description: 'Specialized in cryptocurrency analysis and market insights',
    defaultInstructions: 'You are a crypto analyst specialized in providing market insights and analysis for cryptocurrency portfolios.'
  },
  [SpecializedDomain.AI_COACH]: {
    id: SpecializedDomain.AI_COACH,
    name: 'Agent AI Coach',
    description: 'AI agent training and coaching specialist',
    defaultInstructions: 'You are an AI coach specialized in training and guiding AI agents for optimal performance and evolution.'
  },
  [SpecializedDomain.BLOCKCHAIN_ADVISOR]: {
    id: SpecializedDomain.BLOCKCHAIN_ADVISOR,
    name: 'Bitcoin Advisor',
    description: 'Specialized in Bitcoin and blockchain technology advisory',
    defaultInstructions: 'You are a Bitcoin advisor specialized in providing guidance on blockchain technology, Bitcoin investments, and cryptocurrency strategy.'
  },
  [SpecializedDomain.GUARDIAN_AIGENT]: {
    id: SpecializedDomain.GUARDIAN_AIGENT,
    name: 'Guardian Aigent',
    description: 'AI security and protection specialist',
    defaultInstructions: 'You are a Guardian Aigent specialized in AI security, protection strategies, and maintaining the safety and integrity of AI systems.'
  }
};
