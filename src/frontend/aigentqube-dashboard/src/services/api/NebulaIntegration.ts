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
  // Replace the baseURL with the actual Nebula API endpoint from the documentation if needed.
  private baseURL: string = 'https://api.nebula.thirdweb.com';

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

  // For Nebula, no extra initialization call is required.
  public async initialize(): Promise<void> {
    console.log('[Nebula API] Initialized');
    this.status = ServiceStatus.READY;
  }

  /**
   * Executes a query against the Nebula API.
   * Expects an object with a "query", "input", or "message" property.
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

      const response = await this.axiosInstance.get('/query', {
        params: { query },
        headers: {
          'X-API-Key': this.config.apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.data || !response.data.result) {
        console.error('[Nebula API] Invalid response:', response.data);
        return {
          success: false,
          error: 'Invalid response from Nebula API',
          metadata: { timestamp: new Date() },
        };
      }

      return {
        success: true,
        data: response.data.result,
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
