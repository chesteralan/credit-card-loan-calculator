import { create } from 'zustand';

interface CalculatorState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  activeTab: 'loan' | 'card' | 'compare';
  setActiveTab: (tab: 'loan' | 'card' | 'compare') => void;
}

export const useCalculatorStore = create<CalculatorState>((set) => ({
  theme: 'dark',
  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { theme: nextTheme };
    }),
  activeTab: 'loan',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
