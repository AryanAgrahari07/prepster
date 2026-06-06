import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { startSession, submitAnswer, finishSession } from '../api/aptitude';

/**
 * useQuiz — encapsulates all quiz session state and actions.
 * Used by QuizSession and DailyChallenge pages.
 */
export default function useQuiz() {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  /**
   * Start a new session.
   * @param {object} params — sessionType, topic, difficulty, limit, companySlug, timeLimitSeconds
   * @returns {string} sessionId
   */
  const start = useCallback(async (params) => {
    try {
      setLoading(true);
      setError('');
      const res = await startSession(params);
      const id = res.data?.sessionId || res.sessionId;
      setSessionId(id);
      return id;
    } catch (err) {
      // Paywall redirect
      if (err.response?.data?.error?.code === 4002) {
        navigate('/upgrade');
        return null;
      }
      const msg = err.response?.data?.error?.message || 'Failed to start session';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  /**
   * Submit an answer within the current session.
   */
  const answer = useCallback(async (id, payload) => {
    try {
      await submitAnswer(id, payload);
    } catch (err) {
      console.error('[useQuiz] submitAnswer error:', err.message);
    }
  }, []);

  /**
   * Finish the session and navigate to results page.
   */
  const finish = useCallback(async (id) => {
    try {
      setLoading(true);
      await finishSession(id);
      navigate(`/aptitude/results/${id}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to submit session');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  return { sessionId, loading, error, start, answer, finish };
}
