import type { PeriodSelection } from '@/features/period/constants';
import { create } from 'zustand';

type ProductSalesState = {
  // Ürün detayındaki satış grafiğinin dönemi
  selection: PeriodSelection;
  setSelection: (selection: PeriodSelection) => void;
  reset: () => void;
};

// Son 7 gün anasayfayla aynı sipariş verisidir; açılışta ek istek atılmaz.
export const PRODUCT_SALES_DEFAULT_SELECTION: PeriodSelection = { kind: 'preset', period: 'weekly' };

// Dönem ayrı route'taki sheet'te seçildiği için ekranla paylaşılır. Detay kapanınca sıfırlanır;
// bir ürünün dönemi sonra açılan başka ürüne taşınmaz.
export const useProductSalesStore = create<ProductSalesState>()((set) => ({
  selection: PRODUCT_SALES_DEFAULT_SELECTION,
  setSelection: (selection) => set({ selection }),
  reset: () => set({ selection: PRODUCT_SALES_DEFAULT_SELECTION }),
}));
