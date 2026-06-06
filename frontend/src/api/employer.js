import { api } from '../store/authStore';

export const getEmployerJobs = async () => {
  const { data } = await api.get('/employer/jobs');
  return data;
};

export const createEmployerJob = async (jobData) => {
  const { data } = await api.post('/employer/jobs', jobData);
  return data;
};

export const getEmployerJobById = async (jobId) => {
  const { data } = await api.get(`/employer/jobs/${jobId}`);
  return data;
};

export const updateEmployerJob = async (jobId, jobData) => {
  const { data } = await api.patch(`/employer/jobs/${jobId}`, jobData);
  return data;
};

export const getJobApplicants = async (jobId) => {
  const { data } = await api.get(`/employer/jobs/${jobId}/applicants`);
  return data;
};

export const updateApplicationStatus = async (applicationId, status) => {
  const { data } = await api.patch(`/employer/applications/${applicationId}`, { status });
  return data;
};
