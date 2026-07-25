import { useAuthStore } from '../store/authStore';
import * as authService from '../services/auth';
import type { IUser } from '../types';

function mapUser(user: any): IUser {
  return { ...user, _id: user._id || user.id } as IUser;
}

export function useAuth() {
  const { user, isAuthenticated, isLoading, setAuth, logout: storeLogout } = useAuthStore();

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    localStorage.setItem('refreshToken', result.refreshToken);
    setAuth(mapUser(result.user), result.accessToken);
  };

  const register = async (email: string, password: string, displayName: string) => {
    const result = await authService.register(email, password, displayName);
    localStorage.setItem('refreshToken', result.refreshToken);
    setAuth(mapUser(result.user), result.accessToken);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch {
      }
    }
    storeLogout();
  };

  return { user, isAuthenticated, isLoading, login, register, logout };
}
