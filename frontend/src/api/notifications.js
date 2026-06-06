import { api } from '../store/authStore';

export const getAnnouncements = async () => {
  const { data } = await api.get('/notifications');
  return data;
};
