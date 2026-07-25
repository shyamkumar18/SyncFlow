import api from './api';
import type { IApiResponse, IPaginatedResponse } from '../types';

export interface IEmailSyncResult {
  processed: number;
  newEmails: number;
  newTransactions: number;
  failed: number;
  errors: string[];
}

export async function getEmails(params?: Record<string, string | number>) {
  const { data } = await api.get('/emails', { params });
  return data as IPaginatedResponse<any>;
}

export async function getEmail(id: string) {
  const { data } = await api.get(`/emails/${id}`);
  return data as IApiResponse<any>;
}

export async function getEmailStats() {
  const { data } = await api.get('/emails/stats');
  return data as IApiResponse<{
    total: number;
    unprocessed: number;
    categories: Record<string, number>;
    banks: Record<string, number>;
  }>;
}

export async function getEmailBanks() {
  const { data } = await api.get('/emails/banks');
  return data as IApiResponse<Array<{ name: string; count: number; lastEmail: string }>>;
}

export async function syncEmails(transactionLimit = 500) {
  const { data } = await api.post('/emails/sync', { transactionLimit });
  return data as IApiResponse<IEmailSyncResult>;
}
