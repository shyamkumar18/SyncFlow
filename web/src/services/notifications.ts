import api from './api';
import type { INotification, IApiResponse, IPaginatedResponse } from '../types';

export async function getNotifications(params?: Record<string, string | number>) {
  const { data } = await api.get('/notifications', { params });
  return data as IPaginatedResponse<INotification>;
}

export async function markRead(id: string) {
  const { data } = await api.patch(`/notifications/${id}/read`);
  return data as IApiResponse<INotification>;
}

export async function markAllRead() {
  const { data } = await api.patch('/notifications/read-all');
  return data as IApiResponse<null>;
}
