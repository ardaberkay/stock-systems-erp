import { DEFAULT_PRODUCT_FILTERS, type ProductFilters } from '@/constants/products';
import { create } from 'zustand';

type ProductFilterState = {
  filters: ProductFilters;
  setFilters: (filters: ProductFilters) => void;
};

// Filtreler ayrı route'taki modalda seçildiği için ürün listesiyle paylaşılır.
export const useProductFilterStore = create<ProductFilterState>()((set) => ({
  filters: DEFAULT_PRODUCT_FILTERS,
  setFilters: (filters) => set({ filters }),
}));
