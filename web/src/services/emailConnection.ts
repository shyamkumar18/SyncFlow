import api from './api';

export interface EmailConnectionStatus {
  connected: boolean;
  email?: string;
  provider?: string;
  status?: string;
  lastConnected?: string;
}

export interface EmailProfile {
  email: string;
  provider: string;
}

export interface EmailTestResult {
  success: boolean;
  message: string;
  latency?: number;
}

export async function getConnectionStatus(): Promise<EmailConnectionStatus> {
  const { data } = await api.get('/email/status');
  return data.data;
}

export async function getConnectUrl(): Promise<string> {
  const { data } = await api.get('/email/connect');
  return data.data.url;
}

export async function disconnectGmail(): Promise<void> {
  await api.post('/email/disconnect');
}

export async function getProfile(): Promise<EmailProfile> {
  const { data } = await api.get('/email/profile');
  return data.data;
}

export async function testConnection(): Promise<EmailTestResult> {
  const { data } = await api.post('/email/test-connection');
  return data.data;
}
