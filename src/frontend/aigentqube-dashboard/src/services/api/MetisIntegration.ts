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

export class MetisIntegration implements APIIntegration {
  public readonly id: string = 'metis';
  public readonly name: string = 'Metis AI Service';
  public readonly description: string = 'Crypto Analyst Domain AI Service';
  
  public status: ServiceStatus = ServiceStatus.INITIALIZING;
  public readonly config: APIConfig;

  private axiosInstance: AxiosInstance;
  private baseURL: string = 'https://metisapi2-8703aaeeb44e.herokuapp.com';

  constructor(config: APIConfig) {
    const apiKey = config.apiKey || process.env.REACT_APP_METIS_API_KEY;

     // Deep clone configuration to prevent external mutations
    this.config = { 
      ...config, 
      apiKey,
      timeout: config.timeout || 60000,
      retryAttempts: config.retryAttempts || 3
    };

    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 120000, // Increased timeout to 30 seconds
      // More lenient error handling
      validateStatus: function (s) {
        return s >= 200 && s < 600; // Accept wider range of status codes
      }
    });
  }

  get get_status(): ServiceStatus {
    return this.status;
  }

  public async initialize(): Promise<void> {
    
    //Below is the legacy code to connect to metis api: now only one call is needed so there is no need to init.

    ('[Metis API] Successfully initialized');

    // try {
    //   // Initialization payload matching the provided structure
    //   const payload: InitializationPayload = {
    //     public_keys: [
    //       "bc1p4hm2mdgfhag5742q37xuh28cnecccuckwrpjuw6fy0ssuz0lmmzsnv7u9h"
    //     ],
    //     user_profile: {
    //       Name: "",
    //       Number: "",
    //       Email: "",
    //       Organization: "",
    //       interests: []
    //     },
    //     holdings: [
    //       { currency: "BTC", holding: 0.0008 },
    //       { currency: "ETH", holding: 0.02 },
    //       { currency: "QSWAP", holding: 8 }
    //     ],
    //     transaction_history: []
    //   };

    //   // Perform initialization POST request
    //   const response = await this.axiosInstance.post('/initialize', payload, {
    //     headers: {
    //       'X-API-Key': this.config.apiKey,
    //       'Content-Type': 'application/json'
    //     }
    //   });

    //   // Check initialization success
    //   if (response.status === 202) {
    //     this.status = ServiceStatus.READY;
    //     console.log('[Metis API] Successfully initialized');
    //   } else {
    //     this.status = ServiceStatus.ERROR;
    //     console.warn('[Metis API] Initialization returned non-200 status:', response.status);
    //   }
    // } catch (error: any) {
    //   console.error('[Metis API] Initialization failed:', error);
    //   this.status = ServiceStatus.ERROR;
    //   throw new Error(`Metis API Initialization Error: ${error.message}`);
    // }
  }

  public async execute(params: any): Promise<APIResponse> {
    try {
      // Extract input flexibly
      const metis_input = params.message || params.input || params.query;
      const domain = params.domain || 'crypto_analyst';

      //console.log("[Metis API] Current active iqubes", params.iqubes)

      const iqubesMap = params.iqubes instanceof Map ? params.iqubes : new Map();
      const iqubesArray = Array.from(iqubesMap.values());
      
      // This needs to be changed for neq iqube
      // const interests = iqubesArray.flatMap(iqube => iqube.blakQube?.web3Interests || []);
      const keys = iqubesArray
        .flatMap(iqube => [
          iqube.evmPublicKey,
          // iqube.bitcoinPublicKey,
          // ...(iqube.walletsOfInterest || [])
        ])
        .filter(key => typeof key === "string" && key.startsWith("0x"));
        const uniqueKeys = Array.from(new Set(keys));
        const uniqueIqubesArray = iqubesArray.filter(iqube => 
          uniqueKeys.some(key => 
            key === iqube.evmPublicKey
          )
        );

      const metis_data = {
        "public_keys": uniqueKeys,
        "user_profile": {
          "Name": " ",
          "Number": " ",
          "Email": " ",
          "Organization": iqubesArray[0]?.iQubeCreator || "",
          "interests": []
        },
        "holdings": []
      };

      const metis_params = {input: metis_input, user_data: metis_data};

      console.log("Metis API] Params", metis_params)

      // Validate input
      if (!metis_input) {
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

      try {
        // Make a simple GET request with the input parameter
        const response = await this.axiosInstance.get('/service', {
          params: {
            input: metis_input,
            user_data: JSON.stringify(metis_data) // Ensuring it's a string for URL encoding
          },
          headers: {
            'X-API-Key': this.config.apiKey, 
            'Content-Type': 'application/json',
          }
        });

        // Validate response data
        if (!response.data || !response.data.response) {
          console.error('[Metis API] Invalid response structure:', response.data);
          return {
            success: false,
            error: 'No valid response received from Metis API',
            metadata: { 
              timestamp: new Date(),
              domain,
              rawResponse: response.data
            }
          };
        }

        return {
          success: true,
          data: response.data.response,
          metadata: { 
            domain, 
            timestamp: new Date(),
            originalResponse: response.data
          }
        };
      } catch (error: any) {
        console.error('[Metis API] Request Error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.error || error.message || 'Failed to get response from Metis API');
      }
    } catch (error: any) {
      console.error('[Metis API] Execution Error:', error);
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

  public async validate(): Promise<boolean> {
    try {
      // Check if the API key is present
      if (!this.config.apiKey) {
        console.error('[Metis API] No API key found');
        this.status = ServiceStatus.ERROR;
        return false;
      }

      //CD::console.log("[METIS] Calling validate()")

      return true
  
    } catch (error: any) {
      console.error('[Metis API] Validation Error:', error);
  
      // Handle specific error cases
      if (error.response) {
        if (error.response.status === 401) {
          console.error('[Metis API] Invalid API key');
          this.status = ServiceStatus.ERROR;
          return false;
        } else if (error.response.status === 404) {
          console.error('[Metis API] Endpoint not found');
          this.status = ServiceStatus.ERROR;
          return false;
        }
      }
  
      // Set status to ERROR and return false for any other errors
      this.status = ServiceStatus.ERROR;
      return false;
    }
  }

  // Simplified query processing method
  public async processQuery(query: string): Promise<string> {
    try {
      // Construct URL exactly like the JavaScript example
      const url = new URL(`${this.baseURL}/service`);
      const params = { input: query };
      url.search = new URLSearchParams(params).toString();

      // In the body of the request, send the public keys.

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
