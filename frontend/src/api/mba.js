import { api } from '@/store/authStore';

export const getGdTopics = (params) => {
  return api.get('/mba/gd', { params });
};

export const getGdTopicById = (id) => {
  return api.get(`/mba/gd/${id}`);
};

export const getPiQuestions = (params) => {
  return api.get('/mba/pi', { params });
};

export const getCaseStudies = (params) => {
  return api.get('/mba/cases', { params });
};

export const getCaseStudyById = (id) => {
  return api.get(`/mba/cases/${id}`);
};

export const getWatTopics = (params) => {
  return api.get('/mba/wat', { params });
};

export const getWatTopicById = (id) => {
  return api.get(`/mba/wat/${id}`);
};

export const startMbaSession = (data) => {
  return api.post('/mba/sessions', data);
};

export const finishMbaSession = (id, data) => {
  return api.patch(`/mba/sessions/${id}/finish`, data);
};

export const getSectors = (params) => {
  return api.get('/mba/sectors', { params });
};

export const getSectorBySlug = (slug) => {
  return api.get(`/mba/sectors/${slug}`);
};

export const getGuesstimates = (params) => {
  return api.get('/mba/guesstimates', { params });
};

export const getGuesstimatById = (id) => {
  return api.get(`/mba/guesstimates/${id}`);
};

export const getMbaAnalytics = () => {
  return api.get('/mba/analytics/me');
};

export const startMockInterview = (count = 8) => {
  return api.post(`/mba/mock-interview/start?count=${count}`);
};

export const listMockInterviews = () => {
  return api.get('/mba/mock-interview');
};

export const submitMockInterviewAnswer = (id, payload) => {
  return api.patch(`/mba/mock-interview/${id}/answer`, payload);
};

export const finishMockInterview = (id) => {
  return api.post(`/mba/mock-interview/${id}/finish`);
};

export const getMockInterviewById = (id) => {
  return api.get(`/mba/mock-interview/${id}`);
};
