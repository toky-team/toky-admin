import { create } from 'zustand';

import type { User } from '~/features/auth/types/user';

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  user: null,
  setUser: (user) => set({ user, isLoggedIn: !!user }),
  logout: () => set({ user: null, isLoggedIn: false }),
}));
