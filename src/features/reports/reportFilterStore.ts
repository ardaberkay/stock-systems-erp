import type { PeriodSelection } from '@/features/period/constants';
import { REPORT_DEFAULT_SELECTION } from '@/features/reports/constants';
import { create } from 'zustand';

type ReportFilterState = {
  selection: PeriodSelection;
  setSelection: (selection: PeriodSelection) => void;
};

// Rapor detayının dönemi; seçim ayrı route'lardaki native sheet'lerde yapılır.
// Kartlar bu seçimi okumaz, detay her açılışta varsayılan döneme döner.
export const useReportFilterStore = create<ReportFilterState>()((set) => ({
  selection: REPORT_DEFAULT_SELECTION,
  setSelection: (selection) => set({ selection }),
}));
