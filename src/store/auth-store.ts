import { create } from 'zustand';
import type { AuthState, User } from '../types/auth.types';
import { secureStorage } from '../utils/secure-storage';

const REMEMBER_ME_KEY = 'auth_remember_me';
const USER_KEY = 'auth_user_profile';

// Retrieve initial state from secureStorage if rememberMe is enabled
const getInitialRememberMe = (): boolean => {
  return secureStorage.getItem<boolean>(REMEMBER_ME_KEY) || false;
};

const getInitialUserProfile = (): User | null => {
  const rememberMe = getInitialRememberMe();
  if (rememberMe) {
    return secureStorage.getItem<User>(USER_KEY) || null;
  }
  return null;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getInitialUserProfile(),
  accessToken: null,
  isAuthenticated: !!getInitialUserProfile(),
  rememberMe: getInitialRememberMe(),

  setAuth: (user: User, accessToken: string) => {
    const state = useAuthStore.getState();
    if (state.rememberMe) {
      secureStorage.setItem(USER_KEY, user);
    }
    set({
      user,
      accessToken,
      isAuthenticated: true,
    });
  },

  clearAuth: () => {
    secureStorage.removeItem(USER_KEY);
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  },

  setRememberMe: (rememberMe: boolean) => {
    secureStorage.setItem(REMEMBER_ME_KEY, rememberMe);
    if (!rememberMe) {
      secureStorage.removeItem(USER_KEY);
    } else {
      const state = useAuthStore.getState();
      if (state.user) {
        secureStorage.setItem(USER_KEY, state.user);
      }
    }
    set({ rememberMe });
  },
}));
