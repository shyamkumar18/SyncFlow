import api from './api';
import type { IGoal, IApiResponse } from '../types';

export async function getGoals() {
  const { data } = await api.get('/goals');
  return data as IApiResponse<IGoal[]>;
}

export async function createGoal(body: Partial<IGoal>) {
  const { data } = await api.post('/goals', body);
  return data as IApiResponse<IGoal>;
}

export async function updateGoal(id: string, body: Partial<IGoal>) {
  const { data } = await api.put(`/goals/${id}`, body);
  return data as IApiResponse<IGoal>;
}

export async function deleteGoal(id: string) {
  const { data } = await api.delete(`/goals/${id}`);
  return data as IApiResponse<null>;
}

export async function updateGoalProgress(id: string, currentAmount: number) {
  const { data } = await api.patch(`/goals/${id}/progress`, { currentAmount });
  return data as IApiResponse<IGoal>;
}
