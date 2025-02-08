export interface StateUpdate {
  type: 'context' | 'service' | 'ui' | 'blockchain';
  payload: any;
  timestamp: Date;
  source: string;
}

export interface StateSnapshot {
  context: Record<string, any>;
  services: Record<string, any>;
  ui: Record<string, any>;
  blockchain: Record<string, any>;
  timestamp: Date;
}
