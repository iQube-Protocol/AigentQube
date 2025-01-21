import { ServiceStatus } from '../../types/service';

export interface APIConfig {
  apiKey?: string;
  endpoint?: string;
  options?: Record<string, any>;
}

export interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface APIIntegration {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly config: APIConfig;
  status: ServiceStatus;
  initialize(): Promise<void>;
  execute(params: Record<string, any>): Promise<APIResponse>;
  validate(): Promise<boolean>;
}
