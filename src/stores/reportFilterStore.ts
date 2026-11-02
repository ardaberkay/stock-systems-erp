import type { PeriodSelection } from '@/constants/periods';
import { REPORT_DEFAULT_SELECTION } from '@/constants/reports';
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
