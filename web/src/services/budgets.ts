import api from './api';
import type { IBudget, IApiResponse } from '../types';

export async function getBudgets() {
  const { data } = await api.get('/budgets');
  return data as IApiResponse<IBudget[]>;
}

export async function createBudget(body: Partial<IBudget>) {
  const { data } = await api.post('/budgets', body);
  return data as IApiResponse<IBudget>;
}

export async function updateBudget(id: string, body: Partial<IBudget>) {
  const { data } = await api.put(`/budgets/${id}`, body);
  return data as IApiResponse<IBudget>;
}

export async function deleteBudget(id: string) {
  const { data } = await api.delete(`/budgets/${id}`);
  return data as IApiResponse<null>;
}

export async function getBudgetSummary() {
  const { data } = await api.get('/budgets/summary');
  return data as IApiResponse<Array<{
    _id: string;
    category: { _id: string; name: string; icon: string; color: string };
    amount: number;
    spent: number;
    remaining: number;
    percentage: number;
    period: string;
    month: number;
    year: number;
  }>>;
}
