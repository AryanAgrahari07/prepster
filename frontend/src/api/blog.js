import { api } from '../store/authStore';

export const getBlogs = async (params) => {
  const { data } = await api.get('/blogs', { params });
  return data;
};

export const getBlogBySlug = async (slug) => {
  const { data } = await api.get(`/blogs/${slug}`);
  return data;
};
