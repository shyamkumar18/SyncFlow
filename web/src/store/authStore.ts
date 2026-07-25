import { create } from 'zustand';
import type { IUser } from '../types';
import * as authApi from '../services/auth';

interface AuthState {
  user: IUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: IUser, accessToken: string) => void;
  setUser: (user: IUser) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, accessToken) => {
    sessionStorage.setItem('accessToken', accessToken);
    set({ user, accessToken, isAuthenticated: true, isLoading: false });
  },

  setUser: (user) => set({ user }),

  setLoading: (isLoading) => set({ isLoading }),

  logout: () => {
    sessionStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
  },

  initialize: async () => {
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const user = await authApi.getProfile();
      set({ user, accessToken: token, isAuthenticated: true, isLoading: false });
    } catch {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { accessToken, refreshToken: newRt } = await authApi.refreshAccessToken(refreshToken);
          sessionStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRt);
          const user = await authApi.getProfile();
          set({ user, accessToken, isAuthenticated: true, isLoading: false });
        } catch {
          sessionStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          set({ isLoading: false });
        }
      } else {
        sessionStorage.removeItem('accessToken');
        set({ isLoading: false });
      }
    }
  },
}));
