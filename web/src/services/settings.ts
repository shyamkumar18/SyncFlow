import api from './api';
import type { IApiResponse } from '../types';

export interface UserSettings {
  displayName?: string;
  monthlyIncome?: number;
  currency?: string;
  theme?: string;
  timezone?: string;
}

export async function getSettings() {
  const { data } = await api.get('/settings');
  return data as IApiResponse<UserSettings>;
}

export async function updateSettings(settings: Partial<UserSettings>) {
  const { data } = await api.put('/settings', settings);
  return data as IApiResponse<UserSettings>;
}
