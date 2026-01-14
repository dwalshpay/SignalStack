import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, Organization, UserRole } from '@/types/api';
import {
  login as apiLogin,
  register as apiRegister,
  getCurrentUser,
  logout as apiLogout,
  acceptInvite as apiAcceptInvite,
} from '@/lib/api';
import { clearTokens, getRefreshToken } from '@/lib/api/client';

interface AuthState {
  // State
  user: User | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    organizationName: string
  ) => Promise<void>;
  acceptInvite: (token: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  initialize: () => Promise<void>;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      organization: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,

      // Login
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await apiLogin({ email, password });
          set({
            user: response.user,
            organization: response.user.organization,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Register
      register: async (
        email: string,
        password: string,
        name: string,
        organizationName: string
      ) => {
        set({ isLoading: true });
        try {
          const response = await apiRegister({
            email,
            password,
            name,
            organizationName,
          });
          set({
            user: response.user,
            organization: response.user.organization,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Accept invite
      acceptInvite: async (token: string, password: string, name: string) => {
        set({ isLoading: true });
        try {
          const response = await apiAcceptInvite({ token, password, name });
          set({
            user: response.user,
            organization: response.user.organization,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Logout
      logout: () => {
        apiLogout();
        set({
          user: null,
          organization: null,
          isAuthenticated: false,
        });
      },

      // Initialize session from stored refresh token
      initialize: async () => {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          set({ isInitialized: true });
          return;
        }

        set({ isLoading: true });
        try {
          // The API client will automatically refresh the access token
          // when we make an authenticated request
          const user = await getCurrentUser();
          set({
            user,
            organization: user.organization,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
          });
        } catch {
          // Session invalid, clear everything
          clearTokens();
          set({
            user: null,
            organization: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
          });
        }
      },

      // Update user
      updateUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'signalstack-auth',
      storage: createJSONStorage(() => localStorage),
      // Only persist the hasSession flag, not actual user data
      // User data is fetched fresh on initialize
      partialize: (state) => ({
        hasSession: state.isAuthenticated,
      }),
    }
  )
);

// Selector hooks
export const useUser = () => useAuthStore((state) => state.user);
export const useOrganization = () => useAuthStore((state) => state.organization);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useIsAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useUserRole = (): UserRole | null =>
  useAuthStore((state) => state.user?.role ?? null);
