import api from './api';
import type { IApiResponse } from '../types';

export interface DashboardOverview {
  totalIncome: number;
  totalExpense: number;
  savings: number;
  yearIncome: number;
  yearExpense: number;
  yearSavings: number;
  monthlyIncome: number;
  cashFlow: Array<{ month: number; year: number; income: number; expense: number; net: number }>;
  recentTransactions: Array<{
    _id: string;
    amount: number;
    type: 'debit' | 'credit';
    description?: string;
    merchant?: string;
    bank: string;
    date: string;
    category?: string;
  }>;
}

export interface CategorySpending {
  categoryId: string;
  total: number;
  count: number;
  percentage: number;
}

export interface MerchantSpending {
  name: string;
  total: number;
  count: number;
}

export interface MonthlyTrend {
  month: number;
  year: number;
  income: number;
  expense: number;
  net: number;
  count: number;
}

export interface BankDistribution {
  name: string;
  total: number;
  count: number;
  percentage: number;
}

export interface CardSpending {
  bank: string;
  cardType: string;
  total: number;
  count: number;
}

export interface CashFlowPoint {
  month: number;
  year: number;
  income: number;
  expense: number;
  net: number;
}

export async function getOverview() {
  const { data } = await api.get('/analytics/overview');
  return data as IApiResponse<DashboardOverview>;
}

export async function getSpendingByCategory(params?: Record<string, string>) {
  const { data } = await api.get('/analytics/spending-by-category', { params });
  return data as IApiResponse<CategorySpending[]>;
}

export async function getSpendingByMerchant(params?: Record<string, string | number>) {
  const { data } = await api.get('/analytics/spending-by-merchant', { params });
  return data as IApiResponse<MerchantSpending[]>;
}

export async function getMonthlyTrend(params?: Record<string, string | number>) {
  const { data } = await api.get('/analytics/monthly-trend', { params });
  return data as IApiResponse<MonthlyTrend[]>;
}

export async function getBankDistribution() {
  const { data } = await api.get('/analytics/bank-distribution');
  return data as IApiResponse<BankDistribution[]>;
}

export async function getCardSpending(params?: Record<string, string>) {
  const { data } = await api.get('/analytics/card-spending', { params });
  return data as IApiResponse<CardSpending[]>;
}

export async function getCashFlow(params?: Record<string, string | number>) {
  const { data } = await api.get('/analytics/cash-flow', { params });
  return data as IApiResponse<CashFlowPoint[]>;
}

export async function exportData(params?: Record<string, string>) {
  const { data } = await api.get('/analytics/export', { params, responseType: 'blob' });
  return data as Blob;
}

export async function downloadCSV(params?: Record<string, string>) {
  const response = await api.get('/analytics/export', { params, responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `syncflow-transactions-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
