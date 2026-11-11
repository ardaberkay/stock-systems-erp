// Görünen adlar `stock.<grup>.<anahtar>` çevirisinden gelir.
export const STOCK_FILTERS = ['all', 'inStock', 'lowStock', 'outOfStock'] as const;
export const STATUS_FILTERS = ['all', 'active', 'passive'] as const;
export const PRODUCT_SORTS = ['newest', 'name', 'stockDesc', 'stockAsc', 'priceDesc', 'priceAsc'] as const;

export type StockFilter = (typeof STOCK_FILTERS)[number];
export type StatusFilter = (typeof STATUS_FILTERS)[number];
export type ProductSort = (typeof PRODUCT_SORTS)[number];

export type ProductFilters = {
  stock: StockFilter;
  status: StatusFilter;
  sort: ProductSort;
  brand: string | null;
  type: string | null;
  category: string | null;
};

export const DEFAULT_PRODUCT_FILTERS: ProductFilters = {
  stock: 'all',
  status: 'all',
  sort: 'newest',
  brand: null,
  type: null,
  category: null,
};

// API'de ürün durumu 1 aktif, 0 pasif olarak gelir.
export const PRODUCT_STATUS = {
  passive: 0,
  active: 1,
} as const;

// Kategoride 0 üst kategorisi olmayan, ana kategori demektir.
export const ROOT_CATEGORY_ID = 0;

// Kategori durumu (pasif kategori ürün formunda seçilemez) ve görünürlüğü
export const CATEGORY_STATUS = { active: 1, passive: 0 } as const;
export const CATEGORY_VISIBILITY = { visible: 1, hidden: 0 } as const;

// Paneldeki yeni kategori formunun varsayılan sırası
export const DEFAULT_CATEGORY_SORT = 1;

// Bu adet ve altı "az stok" sayılır.
export const LOW_STOCK_LIMIT = 5;

export const SIZES_PER_ROW = 6;
