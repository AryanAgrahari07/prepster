import { api } from '../store/authStore';

// ─── STATS & ANALYTICS ────────────────────────────────────────────────────────
export const getStats = async () => {
  const { data } = await api.get('/admin/stats');
  return data;
};

export const getAnalytics = async (days = 30) => {
  const { data } = await api.get('/admin/analytics', { params: { days } });
  return data;
};

// ─── USERS ────────────────────────────────────────────────────────────────────
export const getUsers = async (params) => {
  const { data } = await api.get('/admin/users', { params });
  return data;
};

export const getUserById = async (id) => {
  const { data } = await api.get(`/admin/users/${id}`);
  return data;
};

export const updateUser = async (id, updates) => {
  const { data } = await api.patch(`/admin/users/${id}`, updates);
  return data;
};

export const deleteUser = async (id) => {
  const { data } = await api.delete(`/admin/users/${id}`);
  return data;
};

// ─── QUESTIONS ────────────────────────────────────────────────────────────────
export const getQuestions = async (params) => {
  const { data } = await api.get('/admin/questions', { params });
  return data;
};

export const getQuestionById = async (id) => {
  const { data } = await api.get(`/admin/questions/${id}`);
  return data;
};

export const createQuestion = async (questionData) => {
  const { data } = await api.post('/admin/questions', questionData);
  return data;
};

export const updateQuestion = async (id, questionData) => {
  const { data } = await api.put(`/admin/questions/${id}`, questionData);
  return data;
};

export const deleteQuestion = async (id) => {
  const { data } = await api.delete(`/admin/questions/${id}`);
  return data;
};

export const bulkImportQuestions = async (questions) => {
  const { data } = await api.post('/admin/questions/bulk', { questions });
  return data;
};

// ─── COMPANIES ────────────────────────────────────────────────────────────────
export const getCompanies = async () => {
  const { data } = await api.get('/admin/companies');
  return data;
};

export const getCompany = async (id) => {
  const { data } = await api.get(`/admin/companies/${id}`);
  return data;
};

export const createCompany = async (companyData) => {
  const { data } = await api.post('/admin/companies', companyData);
  return data;
};

export const updateCompany = async (id, companyData) => {
  const { data } = await api.put(`/admin/companies/${id}`, companyData);
  return data;
};

export const deleteCompany = async (id) => {
  const { data } = await api.delete(`/admin/companies/${id}`);
  return data;
};

// ─── MOCK TESTS ───────────────────────────────────────────────────────────────
export const getMockTests = async (params) => {
  const { data } = await api.get('/admin/mock-tests', { params });
  return data;
};

export const getMockTest = async (id) => {
  const { data } = await api.get(`/admin/mock-tests/${id}`);
  return data;
};

export const createMockTest = async (mockTestData) => {
  const { data } = await api.post('/admin/mock-tests', mockTestData);
  return data;
};

export const updateMockTest = async (id, mockTestData) => {
  const { data } = await api.put(`/admin/mock-tests/${id}`, mockTestData);
  return data;
};

export const deleteMockTest = async (id) => {
  const { data } = await api.delete(`/admin/mock-tests/${id}`);
  return data;
};

// ─── JOBS ─────────────────────────────────────────────────────────────────────
export const getJobs = async (params) => {
  const { data } = await api.get('/admin/jobs', { params });
  return data;
};

export const getAdminJobById = async (id) => {
  const { data } = await api.get(`/admin/jobs/${id}`);
  return data;
};

export const createAdminJob = async (jobData) => {
  const { data } = await api.post('/admin/jobs', jobData);
  return data;
};

export const updateAdminJob = async (id, jobData) => {
  const { data } = await api.put(`/admin/jobs/${id}`, jobData);
  return data;
};

export const deleteAdminJob = async (id) => {
  const { data } = await api.delete(`/admin/jobs/${id}`);
  return data;
};

export const updateJobStatus = async (id, updates) => {
  const { data } = await api.patch(`/admin/jobs/${id}`, updates);
  return data;
};

export const triggerJobScraper = async () => {
  const { data } = await api.post('/admin/jobs/scrape');
  return data;
};

// ─── APPLICATIONS ─────────────────────────────────────────────────────────────
export const getApplications = async (params) => {
  const { data } = await api.get('/admin/applications', { params });
  return data;
};

// ─── SUBSCRIPTIONS ────────────────────────────────────────────────────────────
export const getSubscriptions = async (params) => {
  const { data } = await api.get('/admin/subscriptions', { params });
  return data;
};

export const getRevenue = async () => {
  const { data } = await api.get('/admin/revenue');
  return data;
};

// ─── COUPONS ──────────────────────────────────────────────────────────────────
export const getCoupons = async () => {
  const { data } = await api.get('/admin/coupons');
  return data;
};

export const createCoupon = async (couponData) => {
  const { data } = await api.post('/admin/coupons', couponData);
  return data;
};

export const updateCoupon = async (id, updates) => {
  const { data } = await api.patch(`/admin/coupons/${id}`, updates);
  return data;
};

export const deleteCoupon = async (id) => {
  const { data } = await api.delete(`/admin/coupons/${id}`);
  return data;
};

// ─── ANNOUNCEMENTS ────────────────────────────────────────────────────────────
export const getAnnouncements = async () => {
  const { data } = await api.get('/admin/announcements');
  return data;
};

export const createAnnouncement = async (announcementData) => {
  const { data } = await api.post('/admin/announcements', announcementData);
  return data;
};

export const updateAnnouncement = async (id, updates) => {
  const { data } = await api.patch(`/admin/announcements/${id}`, updates);
  return data;
};

export const deleteAnnouncement = async (id) => {
  const { data } = await api.delete(`/admin/announcements/${id}`);
  return data;
};

// ─── COMPANY-SPECIFIC QUESTIONS ───────────────────────────────────────────────
export const getAdminCompanyQuestions = async (slug, params) => {
  const { data } = await api.get(`/admin/companies/${slug}/questions`, { params });
  return data;
};

export const bulkImportCompanyQuestions = async (slug, questions) => {
  const { data } = await api.post(`/admin/companies/${slug}/questions/bulk`, { questions });
  return data;
};

// ─── BLOGS ────────────────────────────────────────────────────────────────────
export const getAdminBlogs = async (params) => {
  const { data } = await api.get('/admin/blogs', { params });
  return data;
};

export const getAdminBlogById = async (id) => {
  const { data } = await api.get(`/admin/blogs/${id}`);
  return data;
};

export const createBlog = async (blogData) => {
  const { data } = await api.post('/admin/blogs', blogData);
  return data;
};

export const updateBlog = async (id, updates) => {
  const { data } = await api.put(`/admin/blogs/${id}`, updates);
  return data;
};

export const deleteBlog = async (id) => {
  const { data } = await api.delete(`/admin/blogs/${id}`);
  return data;
};

