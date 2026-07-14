import { create } from 'zustand';
import { CardInput } from './cardEngine';

interface CalculatorState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  activeTab: 'loan' | 'card' | 'compare';
  setActiveTab: (tab: 'loan' | 'card' | 'compare') => void;

  // 1. Traditional Loan Inputs
  loanAmount: number;
  loanApr: number;
  loanTermMonths: number;
  loanExtraPayment: number;
  setLoanInput: (
    key: 'loanAmount' | 'loanApr' | 'loanTermMonths' | 'loanExtraPayment',
    value: number
  ) => void;

  // 2. Credit Card Inputs
  cardBalance: number;
  cardApr: number;
  cardCustomPayment: number;
  cardMinPaymentFloor: number;
  cardMinPaymentPercent: number;
  setCardInput: (
    key:
      | 'cardBalance'
      | 'cardApr'
      | 'cardCustomPayment'
      | 'cardMinPaymentFloor'
      | 'cardMinPaymentPercent',
    value: number
  ) => void;

  // 3. Debt Consolidation Inputs
  consolidationCards: CardInput[];
  consolidationTermMonths: number;
  consolidationApr: number;
  consolidationOriginationFee: number;
  consolidationStrategy: 'avalanche' | 'snowball';
  consolidationCustomPayment: number;

  setConsolidationInput: (
    key:
      | 'consolidationTermMonths'
      | 'consolidationApr'
      | 'consolidationOriginationFee'
      | 'consolidationCustomPayment',
    value: number
  ) => void;
  addConsolidationCard: (card: Omit<CardInput, 'id'>) => void;
  removeConsolidationCard: (id: string) => void;
  updateConsolidationCard: (id: string, card: Partial<CardInput>) => void;
  setConsolidationStrategy: (strategy: 'avalanche' | 'snowball') => void;
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

  // 1. Traditional Loan Initial State & Setters
  loanAmount: 15000,
  loanApr: 6.5,
  loanTermMonths: 60,
  loanExtraPayment: 100,
  setLoanInput: (key, value) => set({ [key]: value }),

  // 2. Credit Card Initial State & Setters
  cardBalance: 5000,
  cardApr: 18.9,
  cardCustomPayment: 150,
  cardMinPaymentFloor: 25,
  cardMinPaymentPercent: 0.01,
  setCardInput: (key, value) => set({ [key]: value }),

  // 3. Debt Consolidation Initial State & Setters
  consolidationCards: [
    { id: '1', name: 'Card A', balance: 3500, apr: 18.9 },
    { id: '2', name: 'Card B', balance: 5500, apr: 22.4 },
    { id: '3', name: 'Card C', balance: 2000, apr: 15.9 },
  ],
  consolidationTermMonths: 36,
  consolidationApr: 9.5,
  consolidationOriginationFee: 2,
  consolidationStrategy: 'avalanche',
  consolidationCustomPayment: 400,

  setConsolidationInput: (key, value) => set({ [key]: value }),
  addConsolidationCard: (card) =>
    set((state) => ({
      consolidationCards: [
        ...state.consolidationCards,
        { ...card, id: Math.random().toString(36).substr(2, 9) },
      ],
    })),
  removeConsolidationCard: (id) =>
    set((state) => ({
      consolidationCards: state.consolidationCards.filter((c) => c.id !== id),
    })),
  updateConsolidationCard: (id, card) =>
    set((state) => ({
      consolidationCards: state.consolidationCards.map((c) =>
        c.id === id ? { ...c, ...card } : c
      ),
    })),
  setConsolidationStrategy: (strategy) =>
    set({ consolidationStrategy: strategy }),
}));
