import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

/**
 * Handles the Google OAuth redirect: /auth/google/success?token=ACCESS_TOKEN
 * Sets the access token in store then fetches user profile, then redirects to dashboard.
 */
export default function GoogleSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAccessToken, checkAuth } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      navigate('/auth/login?error=oauth_failed');
      return;
    }
    // Store the access token then hydrate the user profile
    setAccessToken(token);
    checkAuth().then(() => {
      navigate('/dashboard');
    }).catch(() => {
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
