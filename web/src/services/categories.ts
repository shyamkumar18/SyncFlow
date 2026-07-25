import api from './api';
import type { ICategory, IApiResponse } from '../types';

export async function getCategories() {
  const { data } = await api.get('/categories');
  return data as IApiResponse<ICategory[]>;
}
