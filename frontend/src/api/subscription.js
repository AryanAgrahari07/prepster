import { api } from '../store/authStore';

export const getPlans = async () => {
  const { data } = await api.get('/plans');
  return data;
};

export const getMySubscription = async () => {
  const { data } = await api.get('/subscriptions/me');
  return data;
};

export const createOrder = async (planId) => {
  const { data } = await api.post('/subscriptions/create-order', { planId });
  return data;
};

export const verifyPayment = async (paymentData) => {
  const { data } = await api.post('/subscriptions/verify', paymentData);
  return data;
};

export const cancelSubscription = async () => {
  const { data } = await api.post('/subscriptions/cancel');
  return data;
};

export const validateCoupon = async (code) => {
  const { data } = await api.post('/coupons/validate', { code });
  return data;
};
