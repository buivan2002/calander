import { create } from 'zustand';

interface AuthState {
  user: any | null;
  isLoading: boolean; // true khi đang gọi /me để rehydrate
  setUser: (user: any) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true, // Mặc định true — chờ rehydrate xong mới false
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  setLoading: (isLoading) => set({ isLoading }),
}));
