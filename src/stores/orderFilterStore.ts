import {
  DEFAULT_ORDER_FILTERS,
  DEFAULT_ORDER_PERIOD,
  type OrderFilters,
  type OrderPeriodSelection,
} from '@/constants/orderFilters';
import { create } from 'zustand';

type OrderFilterState = {
  selection: OrderPeriodSelection;
  filters: OrderFilters;
  setSelection: (selection: OrderPeriodSelection) => void;
  setFilters: (filters: OrderFilters) => void;
};

// Dönem ve filtreler ayrı route'lardaki sheet'lerde seçildiği için listeyle paylaşılır.
export const useOrderFilterStore = create<OrderFilterState>()((set) => ({
  selection: DEFAULT_ORDER_PERIOD,
  filters: DEFAULT_ORDER_FILTERS,
  setSelection: (selection) => set({ selection }),
  setFilters: (filters) => set({ filters }),
}));
