import { api } from '../store/authStore';

export const getJobs = async (params) => {
  const { data } = await api.get('/jobs', { params });
  return data;
};

export const getJobById = async (id) => {
  const { data } = await api.get(`/jobs/${id}`);
  return data;
};

// Implement in M8
export const applyForJob = async (id, applicationData) => {
  const { data } = await api.post(`/jobs/${id}/apply`, applicationData);
  return data;
};

export const getMyApplications = async () => {
  const { data } = await api.get('/applications/me');
  return data;
};

export const withdrawApplication = async (id) => {
  const { data } = await api.patch(`/applications/${id}/withdraw`);
  return data;
};

export const uploadResume = async (formData) => {
  const { data } = await api.post('/users/me/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};
