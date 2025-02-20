import axios, { AxiosInstance } from 'axios';
import { APIIntegration, APIResponse, APIConfig } from './APIIntegrationManager';
import { ServiceStatus } from '../../types/service';

export class NebulaIntegration implements APIIntegration {
  public readonly id: string = 'nebula';
  public readonly name: string = 'Nebula AI Service';
  public readonly description: string = 'Blockchain AI powered by Nebula';
  public status: ServiceStatus = ServiceStatus.INITIALIZING;
  public readonly config: APIConfig;

  private axiosInstance: AxiosInstance;
  private baseURL: string = 'https://nebula-api.thirdweb.com';
  private sessionId: string | null = null;

  constructor(config: APIConfig) {
    const apiKey = config.apiKey || process.env.REACT_APP_NEBULA_SECRET_KEY;
    this.config = {
      ...config,
      apiKey,
      timeout: config.timeout || 60000,
      retryAttempts: config.retryAttempts || 3,
    };

    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 60000,
      validateStatus: (status: number) => status >= 200 && status < 600,
    });
  }

  /**
   * Initializes the Nebula integration by creating a session ID.
   */
  public async initialize(): Promise<void> {
    try {
      const response = await this.axiosInstance.post('/session', {}, {
        headers: {
          'x-secret-key': this.config.apiKey,
        },
      });

      this.sessionId = response.data.result.context.session_id
      console.log('[Nebula API] Session created with ID:', this.sessionId);
      this.status = ServiceStatus.READY;

    } catch (error: any) {
      // Log detailed error response from the API
      console.error('[Nebula API] Error initializing session:', error.response || error.message);
  
      if (error.response) {
        // Capture full error response if available
        console.error('[Nebula API] Full error response:', error.response.data);
        console.error('[Nebula API] Status code:', error.response.status);
      }
  
      this.status = ServiceStatus.ERROR;
    }
  }
  
  

  /**
   * Executes a query against the Nebula API, using the session ID if available.
   */
  public async execute(params: any): Promise<APIResponse> {
    try {
      const query = params.query || params.input || params.message;
      if (!query) {
        return {
          success: false,
          error: 'Query parameter is required',
          metadata: { timestamp: new Date() },
        };
      }

      if (!this.sessionId) {
        return {
          success: false,
          error: 'Session ID is missing. Please initialize first.',
          metadata: { timestamp: new Date() },
        };
      }
      
      const iqubesMap = params.iqubes instanceof Map ? params.iqubes : new Map();
      const iqubesArray = Array.from(iqubesMap.values());

      // This needs to be chained for new iQube

      const name = String(iqubesArray[0]?.firstName ) + String(iqubesArray[0]?.lastName );
      const key = iqubesArray.length > 0 && typeof iqubesArray[0].evmPublicKey === "string" 
        && iqubesArray[0].evmPublicKey.startsWith("0x") 
        ? iqubesArray[0].evmPublicKey 
        : null;


      const requestBody = {
        message: query,
        stream: false,
        session_id: this.sessionId,
        context: {
          chainIds: params.chainIds || ["1", "80002"],
          walletAddress: key || null,
        },
      };

      console.log(requestBody)

      const response = await this.axiosInstance.post('/chat', requestBody, {
        headers: {
          'x-secret-key': this.config.apiKey,
        },
      });

      console.log(response)


      if (!response.data || !response.data.message) {
        console.error('[Nebula API] Invalid response:', response.data);
        return {
          success: false,
          error: 'Invalid response from Nebula API',
          metadata: { timestamp: new Date() },
        };
      }

      return {
        success: true,
        data: response.data.message,
        metadata: { timestamp: new Date() },
      };
    } catch (error: any) {
      console.error('[Nebula API] Request error:', error);
      return {
        success: false,
        error: error.message || 'Nebula API request failed',
        metadata: { timestamp: new Date(), errorDetails: error },
      };
    }
  }

  /**
   * Validates the Nebula integration configuration.
   * Currently, it only checks for the presence of an API key.
   */
  public async validate(): Promise<boolean> {
    if (!this.config.apiKey) {
      console.error('[Nebula API] API key is missing');
      this.status = ServiceStatus.ERROR;
      return false;
    }
    console.log('[Nebula API] Calling validate()');
    return true;
  }
}
