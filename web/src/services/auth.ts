import api from './api';

interface AuthResponse {
  user: {
    id: string;
    email: string;
    displayName: string;
    avatar?: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

export async function register(email: string, password: string, displayName: string) {
  const { data } = await api.post('/auth/register', { email, password, displayName });
  return data.data as AuthResponse;
}

export async function login(email: string, password: string) {
  const { data } = await api.post('/auth/login', { email, password });
  return data.data as AuthResponse;
}

export async function googleAuth(code: string) {
  const { data } = await api.post('/auth/google', { code });
  return data.data as AuthResponse;
}

export async function refreshAccessToken(refreshToken: string) {
  const { data } = await api.post('/auth/refresh', { refreshToken });
  return data.data as { accessToken: string; refreshToken: string };
}

export async function logout(refreshToken: string) {
  await api.post('/auth/logout', { refreshToken });
}

export async function getProfile() {
  const { data } = await api.get('/auth/me');
  return data.data;
}
