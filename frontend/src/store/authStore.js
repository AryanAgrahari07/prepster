import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

// Base Axios instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/v1',
  withCredentials: true, // Send cookies (refresh token)
});

// Setup interceptor for silent token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isRefreshEndpoint = originalRequest.url?.includes('/auth/refresh');
    const hasToken = !!useAuthStore.getState().accessToken;

    // Only attempt refresh if:
    // 1. We got a 401
    // 2. This isn't already a retry
    // 3. This isn't the refresh endpoint itself (avoid infinite loop)
    // 4. We actually had a token in memory (skip for pure guest/unauthenticated requests)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshEndpoint &&
      hasToken
    ) {
      originalRequest._retry = true;

      // Clear the stale access token from store before attempting refresh.
      // This prevents the same expired token from being re-attached to the
      // retried request if the interceptor fires again before the store updates.
      useAuthStore.setState({ accessToken: null, isAuthenticated: false });

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL || '/v1'}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const { accessToken } = res.data.data;
        useAuthStore.getState().setAccessToken(accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed — clear session state but do NOT force logout() here
        // (which calls the API and may itself 401). Just wipe local state.
        useAuthStore.setState({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isHydrated: true,
        });
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isHydrated: false, // Ensures we don't flash login screen before checking auth

      setAccessToken: (token) => {
        set({ accessToken: token, isAuthenticated: !!token });
      },

      setUser: (user) => {
        set({ user });
      },

      login: async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { user, accessToken } = res.data.data;
        set({ user, accessToken, isAuthenticated: true });
        return res.data;
      },

      register: async (data) => {
        const res = await api.post('/auth/register', data);
        return res.data;
      },

      verifyOtp: async (userId, otp) => {
        const res = await api.post('/auth/verify-otp', { userId, otp });
        // Backend returns tokens — set auth state to auto-login the user
        const { accessToken, user } = res.data.data;
        set({ user, accessToken, isAuthenticated: true });
        return res.data;
      },

      logout: async (localOnly = false) => {
        if (!localOnly) {
          try {
            await api.post('/auth/logout');
          } catch (e) {
            console.error('Logout API failed', e);
          }
        }
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      checkAuth: async () => {
        try {
          let token = get().accessToken;
          if (!token) {
            // No token in memory — try to refresh via HttpOnly cookie
            const res = await axios.post(
              `${import.meta.env.VITE_API_URL || '/v1'}/auth/refresh`,
              {},
              { withCredentials: true }
            );
            token = res.data.data.accessToken;
            set({ accessToken: token, isAuthenticated: true });
          }

          // Skip fetching profile if we already have user data in memory.
          // This avoids a redundant round-trip (e.g. right after GoogleSuccess
          // already fetched and hydrated the profile).
          if (get().user) {
            set({ isHydrated: true, isAuthenticated: true });
            return;
          }

          // Only fetch profile if we have a valid token
          const profileRes = await api.get('/users/me');
          set({ user: profileRes.data.data.user, isHydrated: true, isAuthenticated: true });
        } catch (e) {
          // Refresh failed or profile fetch failed — treat as unauthenticated
          set({ user: null, accessToken: null, isAuthenticated: false, isHydrated: true });
        }
      },
    }),
    {
      name: 'prepster-auth-storage',
      partialize: (state) => ({ accessToken: state.accessToken }),
    }
  )
);

export default useAuthStore;
