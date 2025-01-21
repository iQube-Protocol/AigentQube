export enum ServiceStatus {
  INITIALIZING = 'INITIALIZING',
  READY = 'READY',
  ERROR = 'ERROR'
}

export interface ServiceState {
  serviceId: string;
  status: 'active' | 'inactive' | 'error';
  lastUpdate: Date;
  metadata?: Record<string, any>;
}

export interface ServiceConfiguration {
  serviceId: string;
  config: Record<string, any>;
  dependencies: string[];
  version: string;
}
