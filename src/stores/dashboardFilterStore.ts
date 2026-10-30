import { DEFAULT_PERIOD_SELECTION, type PeriodSelection } from '@/constants/periods';
import { create } from 'zustand';

type DashboardFilterState = {
  selection: PeriodSelection;
  setSelection: (selection: PeriodSelection) => void;
};

// Dönem seçimi ayrı route'lardaki native sheet'lerde yapıldığı için dashboard ile
// paylaşılır. Kalıcı değildir; uygulama her açılışta "bugün" ile başlar.
export const useDashboardFilterStore = create<DashboardFilterState>()((set) => ({
  selection: DEFAULT_PERIOD_SELECTION,
  setSelection: (selection) => set({ selection }),
}));
