import { create } from 'zustand';

export const useToastStore = create((set) => ({
  toasts: [],
  addToast: (message, type = 'default') => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }]
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }));
    }, 3000);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) })),
}));

const toast = (message) => useToastStore.getState().addToast(message, 'default');
toast.success = (message) => useToastStore.getState().addToast(message, 'success');
toast.error = (message) => useToastStore.getState().addToast(message, 'error');

export default toast;
