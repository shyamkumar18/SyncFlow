import api from './api';
import type { ITransaction, IReviewItem, IApiResponse, IPaginatedResponse } from '../types';

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

export async function getReviewQueue(params?: Record<string, string | number>) {
  const { data } = await api.get('/transactions/review', { params });
  return data as IPaginatedResponse<IReviewItem>;
}

export async function getReviewQueueCount() {
  const { data } = await api.get('/transactions/review/count');
  return data as IApiResponse<{ count: number }>;
}

export async function approveReviewItem(id: string) {
  const { data } = await api.post(`/transactions/review/${id}/approve`);
  return data as IApiResponse<{ reviewItem: IReviewItem; transaction: ITransaction }>;
}

export async function rejectReviewItem(id: string, notes?: string) {
  const { data } = await api.post(`/transactions/review/${id}/reject`, { notes });
  return data as IApiResponse<IReviewItem>;
}

export async function updateReviewItem(id: string, body: Partial<IReviewItem>) {
  const { data } = await api.put(`/transactions/review/${id}`, body);
  return data as IApiResponse<{ reviewItem: IReviewItem; transaction: ITransaction }>;
}

export async function assignCategory(id: string, categoryId: string) {
  const { data } = await api.patch(`/transactions/${id}/category`, { categoryId });
  return data as IApiResponse<ITransaction>;
}
