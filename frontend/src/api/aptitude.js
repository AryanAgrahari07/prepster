import { api } from '../store/authStore';

export const getTopics = async () => {
  const { data } = await api.get('/aptitude/topics');
  return data;
};

export const startSession = async (sessionData) => {
  const { data } = await api.post('/aptitude/sessions', sessionData);
  return data;
};

export const submitAnswer = async (sessionId, answerData) => {
  const { data } = await api.patch(`/aptitude/sessions/${sessionId}`, answerData);
  return data;
};

export const finishSession = async (sessionId) => {
  const { data } = await api.post(`/aptitude/sessions/${sessionId}/finish`);
  return data;
};

export const getSessionResults = async (sessionId) => {
  const { data } = await api.get(`/aptitude/sessions/${sessionId}`);
  return data;
};

export const getAnalytics = async () => {
  const { data } = await api.get('/aptitude/analytics/me');
  return data;
};

export const getDailyChallenge = async () => {
  const { data } = await api.get('/aptitude/daily-challenge');
  return data;
};

export const getLeaderboard = async () => {
  const { data } = await api.get('/aptitude/leaderboard');
  return data;
};

export const getQuestions = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const { data } = await api.get(`/aptitude/questions${query ? `?${query}` : ''}`);
  return data;
};
