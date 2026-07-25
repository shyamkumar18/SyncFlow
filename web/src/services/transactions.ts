import api from './api';
import type { ITransaction, IApiResponse, IPaginatedResponse } from '../types';

export async function getTransactions(params?: Record<string, string | number>) {
  const { data } = await api.get('/transactions', { params });
  return data as IPaginatedResponse<ITransaction>;
}

export async function getTransaction(id: string) {
  const { data } = await api.get(`/transactions/${id}`);
  return data as IApiResponse<ITransaction>;
}

export async function createTransaction(body: Partial<ITransaction>) {
  const { data } = await api.post('/transactions', body);
  return data as IApiResponse<ITransaction>;
}

export async function createManualTransaction(body: Partial<ITransaction>) {
  const { data } = await api.post('/transactions/manual', body);
  return data as IApiResponse<ITransaction>;
}

export async function updateTransaction(id: string, body: Partial<ITransaction>) {
  const { data } = await api.patch(`/transactions/${id}`, body);
  return data as IApiResponse<ITransaction>;
}

export async function deleteTransaction(id: string) {
  const { data } = await api.delete(`/transactions/${id}`);
  return data as IApiResponse<null>;
}

export async function getTransactionSummary(params?: Record<string, string>) {
  const { data } = await api.get('/transactions/summary', { params });
  return data as IApiResponse<{ totalIncome: number; totalExpense: number; netSavings: number }>;
}
