import {
  DEFAULT_AFFILIATE_FILTERS,
  type AffiliateFilters,
} from '@/features/affiliates/affiliateList';
import type { PeriodSelection } from '@/features/period/constants';
import { create } from 'zustand';

type AffiliateFilterState = {
  filters: AffiliateFilters;
  setFilters: (filters: AffiliateFilters) => void;
  // Detaydaki sipariş bölümünün dönemi; tüm ortak detaylarında ortaktır
  selection: PeriodSelection;
  setSelection: (selection: PeriodSelection) => void;
};

// Son 7 gün anasayfayla aynı sipariş verisidir; açılışta ek istek atılmaz.
export const AFFILIATE_DEFAULT_SELECTION: PeriodSelection = { kind: 'preset', period: 'weekly' };

// Filtre, sıralama ve dönem ayrı route'lardaki sheet'lerde seçildiği için ekranlarla paylaşılır.
export const useAffiliateFilterStore = create<AffiliateFilterState>()((set) => ({
  filters: DEFAULT_AFFILIATE_FILTERS,
  setFilters: (filters) => set({ filters }),
  selection: AFFILIATE_DEFAULT_SELECTION,
  setSelection: (selection) => set({ selection }),
}));
