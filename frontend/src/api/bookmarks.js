import useAuthStore from '../store/authStore';

export const getBookmarks = (itemType = '') => {
  const query = itemType ? `?itemType=${itemType}` : '';
  return useAuthStore.getState().api.get(`/bookmarks${query}`);
};

export const addBookmark = (payload) => {
  // payload: { itemType, itemId, snapshot }
  return useAuthStore.getState().api.post('/bookmarks', payload);
};

export const removeBookmark = (itemId) => {
  return useAuthStore.getState().api.delete(`/bookmarks/${itemId}`);
};

export const checkBookmark = (itemId) => {
  return useAuthStore.getState().api.get(`/bookmarks/check/${itemId}`);
};
