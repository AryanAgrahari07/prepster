import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import useAuthStore, { api } from '@/store/authStore';

/**
 * Handles the Google OAuth redirect: /auth/google/success?token=ACCESS_TOKEN
 *
 * IMPORTANT: We intentionally do NOT call checkAuth() here.
 * checkAuth() may attempt a refresh-token flow which relies on an HttpOnly
 * cookie set during the cross-origin OAuth redirect chain. Some browsers do
 * not reliably persist cookies set in 3xx redirect responses, which causes
 * the refresh to fail and the user to be immediately logged out.
 *
 * Instead we:
 *  1. Set the access token directly in the store (persisted to localStorage).
 *  2. Use the api instance (which attaches the Bearer token via interceptor)
 *     to fetch the user profile directly.
 *  3. Mark the session as hydrated and navigate to the dashboard.
 */
export default function GoogleSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAccessToken, setUser } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      navigate('/auth/login?error=oauth_failed');
      return;
    }

    // 1. Persist the access token so the request interceptor can attach it.
    setAccessToken(token);

    // 2. Fetch the user profile — the interceptor will add Authorization: Bearer <token>.
    api
      .get('/users/me')
      .then((res) => {
        // 3. Hydrate the store with user data and mark as authenticated.
        useAuthStore.setState({
          user: res.data.data.user,
          isAuthenticated: true,
          isHydrated: true,
        });
        navigate('/dashboard');
      })
      .catch(() => {
        // Clear any partial state if the profile fetch fails.
        useAuthStore.setState({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isHydrated: true,
        });
        navigate('/auth/login?error=oauth_failed');
      });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground text-sm">Signing you in with Google…</p>
      </div>
    </div>
  );
}
