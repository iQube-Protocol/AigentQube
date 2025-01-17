import { APIIntegration, APIResponse, APIConfig } from './APIIntegrationManager';
import { ServiceStatus } from '../../types/service';

interface MetisConfig extends APIConfig {
  apiKey: string;
}

interface UserInfo {
  public_keys: string[];
  user_profile: {
    Name: string;
    Number: string;
    Email: string;
    Organization: string;
    interests: string[];
  };
  holdings: Array<{
    currency: string;
    holding: number;
  }>;
  transaction_history: any[];
}

export class MetisIntegration implements APIIntegration {
  public readonly id: string;
  public readonly name: string = 'Metis AI Service';
  public readonly description: string = 'Specialized domain service powered by Metis AI';
  private _status: ServiceStatus = ServiceStatus.INITIALIZING;
  public readonly config: MetisConfig;

  constructor(config: MetisConfig) {
    this.id = `metis-${Date.now()}`;
    this.config = {
      ...config,
      baseURL: process.env.REACT_APP_API_BASE_URL || 'https://metisapi-8501e3beedcf.herokuapp.com',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.apiKey
      }
    };
  }

  get status(): ServiceStatus {
    return this._status;
  }

  public async initialize(): Promise<void> {
    try {
      console.log('Initializing Metis service');
      
      const userPayload = {
        public_keys: ["bc1p4hm2mdgfhag5742q37xuh28cnecccuckwrpjuw6fy0ssuz0lmmzsnv7u9h"],
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

      const response = await fetch(`${this.config.baseURL}/initialize`, {
        method: 'POST',
        headers: {
          'X-API-Key': this.config.apiKey || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Metis initialization error:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        });
        
        this._status = ServiceStatus.ERROR;
        throw new Error(`Failed to initialize Metis API: ${errorText}`);
      }

      console.log('Metis service initialized successfully');
      this._status = ServiceStatus.READY;
    } catch (error: any) {
      console.error('Metis initialization failed:', error.message);
      this._status = ServiceStatus.ERROR;
      throw error;
    }
  }

  public async execute(params: { 
    input: string, 
    domain?: string 
  }): Promise<APIResponse> {
    if (this._status !== ServiceStatus.READY) {
      return {
        success: false,
        error: 'Metis service not initialized',
        data: null
      };
    }

    try {
      let url: URL;
      
      // Use different endpoint based on domain
      if (params.domain === 'AI Coach') {
        url = new URL(`${this.config.baseURL}/teaching`);
      } else {
        url = new URL(`${this.config.baseURL}/service`);
      }
      
      url.search = new URLSearchParams({ input: params.input }).toString();

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'X-API-Key': this.config.apiKey || ''
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `HTTP error! status: ${response.status} - ${errorText}`,
          data: null
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data.response,
        error: null
      };
    } catch (error: any) {
      console.error('Metis service execution error:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  public async validate(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseURL}/health`, {
        method: 'GET',
        headers: {
          'X-API-Key': this.config.apiKey || ''
        }
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  private async makeRequest(
    endpoint: string, 
    method: string = 'POST', 
    body?: any
  ): Promise<APIResponse> {
    try {
      const response = await fetch(`${this.config.baseURL}${endpoint}`, {
        method: method,
        headers: {
          'X-API-Key': this.config.apiKey || '',
          'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `HTTP error! status: ${response.status} - ${errorText}`,
          data: null
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
        error: null
      };
    } catch (error: any) {
      console.error('Metis API Request Error:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }
}
