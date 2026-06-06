import { api } from '../store/authStore';

export const getCompanies = async () => {
  const { data } = await api.get('/companies');
  return data;
};

export const getCompanyTrack = async (slug) => {
  const { data } = await api.get(`/companies/${slug}`);
  return data;
};

export const getCompanyMockTests = async (slug) => {
  const { data } = await api.get(`/companies/${slug}/mock-tests`);
  return data;
};

export const getCompanyProgress = async (slug) => {
  const { data } = await api.get(`/companies/${slug}/progress`);
  return data;
};

export const startCompanyMockTest = async (slug, mockId) => {
  const { data } = await api.post(`/companies/${slug}/mock-tests/${mockId}/start`);
  return data;
};

export const getCompanyQuestions = async (slug, limit = 20) => {
  const { data } = await api.get(`/companies/${slug}/questions?limit=${limit}`);
  return data;
};
