import { create } from 'zustand';
import authService from '../services/authService';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  level: 'silver' | 'gold' | 'platinum';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  loginUser: (email, password) => Promise<void>;
  registerUser: (username, email, password) => Promise<void>;
  logoutUser: () => void;
  loadUserFromToken: () => Promise<void>;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      loginUser: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(email, password);
          const { token } = response.data;
          set({ token });
          localStorage.setItem('token', token); // Also store in localStorage directly for loadUserFromToken
          await get().loadUserFromToken(); // Fetch profile after login
          set({ isLoading: false });
        } catch (err: any) {
          const message = err.response?.data?.message || err.message || 'Login failed';
          set({ isLoading: false, error: message });
          throw new Error(message);
        }
      },
      registerUser: async (username, email, password) => {
        set({ isLoading: true, error: null });
        try {
          await authService.register(username, email, password);
          // Optionally log in user directly or handle redirection
          set({ isLoading: false });
        } catch (err: any) {
          const message = err.response?.data?.message || err.message || 'Registration failed';
          set({ isLoading: false, error: message });
          throw new Error(message);
        }
      },
      logoutUser: () => {
        set({ user: null, token: null, error: null });
        localStorage.removeItem('token');
      },
      loadUserFromToken: async () => {
        const token = get().token || localStorage.getItem('token');
        if (token) {
          set({ isLoading: true, token });
          try {
            const response = await authService.getProfile(token);
            set({ user: response.data, isLoading: false, error: null });
          } catch (err) {
            set({ user: null, token: null, isLoading: false, error: 'Session expired or token invalid' });
            localStorage.removeItem('token');
          }
        } else {
            set({ user: null, token: null }); // Ensure state is cleared if no token
        }
      },
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      partialize: (state) => ({ token: state.token }), // only persist the token
    }
  )
);

export default useAuthStore;
