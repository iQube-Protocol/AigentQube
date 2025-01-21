import axios, { AxiosInstance, AxiosError } from 'axios';
import { APIIntegration, APIResponse, APIConfig } from './APIIntegrationManager';
import { ServiceStatus } from '../../types/service';

interface UserProfile {
  Name: string;
  Number: string;
  Email: string;
  Organization: string;
  interests: string[];
}

interface Holding {
  currency: string;
  holding: number;
}

interface InitializationPayload {
  public_keys: string[];
  user_profile: UserProfile;
  holdings: Holding[];
  transaction_history: any[];
}

interface MetisConfig extends APIConfig {
  apiKey?: string;
}

export class MetisIntegration implements APIIntegration {
  public readonly id: string = 'metis';
  public readonly name: string = 'Metis AI Service';
  public readonly description: string = 'Crypto Analyst Domain AI Service';
  
  private _status: ServiceStatus = ServiceStatus.INITIALIZING;
  private axiosInstance: AxiosInstance;
  private baseURL: string = 'https://metisapi-8501e3beedcf.herokuapp.com';
  private apiKey: string = 'Hephaestus-Athena-1976-Bangalore-182003-Ricci';

  constructor(config: MetisConfig = {}) {
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // Increased timeout to 30 seconds
      // More lenient error handling
      validateStatus: function (status) {
        return status >= 200 && status < 600; // Accept wider range of status codes
      }
    });
  }

  get status(): ServiceStatus {
    return this._status;
  }

  public async initialize(): Promise<void> {
    try {
      // Initialization payload matching the provided structure
      const payload: InitializationPayload = {
        public_keys: [
          "bc1p4hm2mdgfhag5742q37xuh28cnecccuckwrpjuw6fy0ssuz0lmmzsnv7u9h"
        ],
        user_profile: {
          Name: "",
          Number: "",
          Email: "",
          Organization: "",
          interests: []
        },
        holdings: [
          { currency: "BTC", holding: 0.0008 },
          { currency: "ETH", holding: 0.02 },
          { currency: "QSWAP", holding: 8 }
        ],
        transaction_history: []
      };

      // Perform initialization POST request
      const response = await this.axiosInstance.post('/initialize', payload, {
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      // Check initialization success
      if (response.status === 200) {
        this._status = ServiceStatus.READY;
        console.log('[Metis API] Successfully initialized');
      } else {
        this._status = ServiceStatus.PARTIAL;
        console.warn('[Metis API] Initialization returned non-200 status:', response.status);
      }
    } catch (error) {
      console.error('[Metis API] Initialization failed:', error);
      this._status = ServiceStatus.ERROR;
      throw new Error(`Metis API Initialization Error: ${error.message}`);
    }
  }

  public async execute(params: any): Promise<APIResponse> {
    try {
      // Extract input flexibly
      const input = params.message || params.input || params.query;
      const domain = params.domain || 'crypto_analyst';

      // Validate input
      if (!input) {
        return {
          success: false,
          error: 'Invalid input: message, input, or query is required',
          metadata: { 
            timestamp: new Date(),
            domain,
            receivedParams: Object.keys(params)
          }
        };
      }

      // Construct URL exactly like the JavaScript example
      const url = new URL(`${this.baseURL}/service`);
      const queryParams = { input };
      url.search = new URLSearchParams(queryParams).toString();

      try {
        // Perform GET request
        const response = await this.axiosInstance.get(url.toString(), {
          params: queryParams
        });

        // Check if response is ok
        if (response.status < 200 || response.status >= 600) {
          return {
            success: false,
            error: `HTTP error! status: ${response.status}`,
            metadata: { 
              timestamp: new Date(),
              domain
            }
          };
        }

        // Parse JSON response
        const data = response.data;

        // Validate response data
        if (!data || !data.response) {
          return {
            success: false,
            error: 'No valid response received from Metis API',
            metadata: { 
              timestamp: new Date(),
              domain,
              rawResponse: data
            }
          };
        }

        return {
          success: true,
          data: data.response,
          metadata: { 
            domain, 
            timestamp: new Date(),
            originalResponse: data
          }
        };
      } catch (fetchError) {
        console.error('[Metis API] Fetch Error during execution:', fetchError);
        return {
          success: false,
          error: `Fetch error: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`,
          metadata: { 
            timestamp: new Date(),
            domain,
            errorDetails: fetchError
          }
        };
      }
    } catch (error: any) {
      console.error('[Metis API] Unexpected Execution Error:', error);

      return {
        success: false,
        error: error.message || 'Unexpected error during Metis API execution',
        metadata: { 
          timestamp: new Date(),
          domain: params.domain || 'crypto_analyst',
          errorDetails: error
        }
      };
    }
  }

  // Simplified query processing method
  public async processQuery(query: string): Promise<string> {
    try {
      // Construct URL exactly like the JavaScript example
      const url = new URL(`${this.baseURL}/service`);
      const params = { input: query };
      url.search = new URLSearchParams(params).toString();

      // Perform GET request
      const response = await this.axiosInstance.get(url.toString(), {
        params
      });

      // Check if response is ok
      if (response.status < 200 || response.status >= 600) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parse JSON response
      const data = response.data;

      // Return response or fallback
      return data.response || 'No response generated';
    } catch (error) {
      console.error('[Metis API] Query processing error:', error);
      return error instanceof Error ? error.message : 'Error processing query';
    }
  }
}
