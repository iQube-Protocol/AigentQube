import { 
  IQubeTemplate, 
  MetaQube, 
  BlakQube, 
  TokenQube, 
  DataQube, 
  IQubeType 
} from '../types/iQube';
import { v4 as uuidv4 } from 'uuid';

export class IQubeService {
  // Mock blockchain service integration
  private mockBlockchainService = {
    mintToken: async (metadata: any) => {
      return {
        tokenId: `IQUBE-${uuidv4().split('-')[0].toUpperCase()}`,
        mintedAt: new Date()
      };
    }
  };

  public async createIQubeTemplate(
    type: IQubeType = 'DataQube', 
    creator: string = '0x742d35Cc6634C0532...'
  ): Promise<IQubeTemplate> {
    const metaQubeTemplate = {
      iQubeIdentifier: null,
      iQubeCreator: null,
      ownerType: null,
      ownerIdentifiability: null,
      iQubeType: null,
      transactionDate: null,
      sensitivity: null,
      verifiability: null,
      accuracy: null,
      risk: null
    };

    const blakQubeTemplate = type === 'DataQube' 
      ? {
          'personalFinance': { 
            value: null, 
            source: 'User Input', 
            type: 'object' 
          },
          'professionalBackground': { 
            value: null, 
            source: 'LinkedIn/Professional Profiles', 
            type: 'object' 
          }
        }
      : {};

    const tokenQube = await this.mockBlockchainService.mintToken({
      type,
      creator
    });

    return {
      metaQubeTemplate,
      blakQubeTemplate,
      tokenQube: {
        ...tokenQube,
        owner: creator,
        metadata: null
      }
    };
  }

  public async populateIQubeTemplate(
    template: IQubeTemplate, 
    data: any
  ): Promise<MetaQube> {
    const metaQube: MetaQube = {
      iQubeIdentifier: `IQUBE-${uuidv4().split('-')[0].toUpperCase()}`,
      iQubeCreator: template.tokenQube.owner,
      ownerType: 'Person',
      ownerIdentifiability: 'Identifiable',
      iQubeType: template.tokenQube.metadata?.iQubeType || 'DataQube',
      transactionDate: new Date(),
      sensitivity: { value: 4, source: 'Initial Assessment' },
      verifiability: { value: 7, source: 'Data Source Validation' },
      accuracy: { value: 6, source: 'Initial Data Quality Check' },
      risk: { value: 3, source: 'Preliminary Risk Analysis' },
      blakQubeTemplate: template.blakQubeTemplate
    };

    // Populate BlakQube with user data
    const blakQube: BlakQube = Object.keys(template.blakQubeTemplate).reduce((acc, key) => {
      acc[key] = {
        value: data[key] || null,
        source: template.blakQubeTemplate[key].source,
        type: template.blakQubeTemplate[key].type,
        encrypted: false
      };
      return acc;
    }, {});

    return {
      ...metaQube,
      blakQube
    } as DataQube;
  }

  // Simulate encryption of BlakQube
  public async encryptBlakQube(blakQube: BlakQube): Promise<BlakQube> {
    return Object.keys(blakQube).reduce((acc, key) => {
      acc[key] = {
        ...blakQube[key],
        encrypted: true,
        value: btoa(JSON.stringify(blakQube[key].value)) // Simple base64 mock encryption
      };
      return acc;
    }, {});
  }
}

// Singleton export for easy use across application
export const iQubeService = new IQubeService();
