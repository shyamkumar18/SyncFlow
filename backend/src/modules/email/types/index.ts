import type { GmailConnectionStatus } from '../../../models/GmailAccount';

export interface EmailConnectionStatus {
  connected: boolean;
  provider: string;
  email?: string;
  status: GmailConnectionStatus;
  connectedAt?: string;
  lastConnected?: string;
  lastSync?: string;
}

export interface EmailProfile {
  email: string;
  name?: string;
  picture?: string;
  provider: string;
}

export interface EmailTestResult {
  success: boolean;
  message: string;
  latency?: number;
}
