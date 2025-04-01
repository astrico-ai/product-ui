import { create } from 'zustand';

const useToastStore = create((set) => ({
  toast: null,
  showToast: (message, icon) => {
    set({ toast: { message, icon } });
    setTimeout(() => set({ toast: null }), 3000);
  },
}));

export const useToast = () => {
  const { toast, showToast } = useToastStore();
  return { toast, showToast };
}; 