import { useState, useEffect, useCallback } from 'react';
import { api } from '../store/authStore';

/**
 * useSubscription — fetches and manages the current user's subscription.
 * Provides: sub, isPro, loading, error, refresh, cancel
 */
export default function useSubscription() {
  const [sub, setSub]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/subscriptions/me');
      setSub(res.data.data?.subscription || null);
    } catch (err) {
      // 404 = no subscription record yet (free user with no payment history)
      if (err.response?.status !== 404) {
        setError(err.response?.data?.error?.message || 'Failed to load subscription');
      }
      setSub(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const cancel = useCallback(async () => {
    await api.post('/subscriptions/cancel');
    await fetch(); // Refresh after cancel
  }, [fetch]);

  const isPro =
    sub?.plan === 'pro' &&
    sub?.status === 'active' &&
    new Date(sub?.expiresAt) > new Date();

  const expiresAt = sub?.expiresAt ? new Date(sub.expiresAt) : null;
  const daysLeft  = expiresAt
    ? Math.max(0, Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  return { sub, isPro, loading, error, expiresAt, daysLeft, refresh: fetch, cancel };
}
