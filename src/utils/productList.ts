import type { SizeCell } from '@/components/ui/product/SizeRow';
import {
  DEFAULT_PRODUCT_FILTERS,
  LOW_STOCK_LIMIT,
  PRODUCT_STATUS,
  type ProductFilters,
  type StockFilter,
} from '@/constants/products';
import type { Product, ProductVariant } from '@/schemas/products';
import { formatNumber } from '@/utils/formatter';

const SEARCH_LETTERS: Record<string, string> = { ı: 'i', ş: 's', ç: 'c', ğ: 'g', ö: 'o', ü: 'u' };

// "NIKE" Türkçede "nıke" olur; harfler sadeleştirilir ki yazım biçimi aramayı etkilemesin.
export function normalizeText(text: string): string {
  return text
    .trim()
    .toLocaleLowerCase('tr')
    .replace(/[ışçğöü]/g, (letter) => SEARCH_LETTERS[letter]);
}

function matchesStock(stock: number, filter: StockFilter): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'inStock':
      return stock > 0;
    case 'lowStock':
      return stock > 0 && stock <= LOW_STOCK_LIMIT;
    case 'outOfStock':
      return stock <= 0;
  }
}

function matchesFilters(product: Product, filters: ProductFilters): boolean {
  if (filters.status === 'active' && product.status !== PRODUCT_STATUS.active) return false;
  if (filters.status === 'passive' && product.status !== PRODUCT_STATUS.passive) return false;
  if (filters.brand && product.brandName !== filters.brand) return false;
  if (filters.type && product.typeName !== filters.type) return false;
  if (filters.category && !product.categories.some((item) => item.name === filters.category)) {
    return false;
  }

  return matchesStock(product.stock, filters.stock);
}

function compareProducts(a: Product, b: Product, sort: ProductFilters['sort']): number {
  switch (sort) {
    // API tarih vermiyor; ürün kimlikleri yüklenme sırasını izliyor.
    case 'newest':
      return b.id - a.id;
    case 'stockDesc':
      return b.stock - a.stock;
    case 'stockAsc':
      return a.stock - b.stock;
    case 'priceDesc':
      return b.price - a.price;
    case 'priceAsc':
      return a.price - b.price;
    case 'name':
      return a.name.localeCompare(b.name, 'tr');
  }
}

// Arama ve filtre tüm katalogda telefonda çalışır; API'de isimle arama servisi yok.
export function getVisibleProducts(
  products: Product[],
  query: string,
  filters: ProductFilters,
): Product[] {
  const search = normalizeText(query);

  return products
    .filter(
      (product) =>
        matchesFilters(product, filters) &&
        (normalizeText(product.name).includes(search) ||
          normalizeText(product.modelCode ?? '').includes(search)),
    )
    .sort((a, b) => compareProducts(a, b, filters.sort));
}

function getUniqueSorted(values: (string | null | undefined)[]): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))].sort((a, b) =>
    a.localeCompare(b, 'tr'),
  );
}

// Filtre seçenekleri ayrı istek atılmadan katalogdan çıkarılır.
export function getProductFilterOptions(products: Product[]) {
  return {
    brands: getUniqueSorted(products.map((product) => product.brandName)),
    types: getUniqueSorted(products.map((product) => product.typeName)),
    categories: getUniqueSorted(
      products.flatMap((product) => product.categories.map((item) => item.name)),
    ),
  };
}

// Sıralama filtre sayılmaz; yalnızca sonuçları daraltan seçimler sayılır.
export function hasActiveFilters(filters: ProductFilters): boolean {
  const { sort: _sort, ...narrowing } = filters;
  const { sort: _defaultSort, ...defaults } = DEFAULT_PRODUCT_FILTERS;

  return JSON.stringify(narrowing) !== JSON.stringify(defaults);
}

export function getProductImages(product: Product): string[] {
  return [
    product.image,
    product.image2,
    product.image3,
    product.image4,
    product.image5,
    product.image6,
    product.image7,
    product.image8,
  ].filter((image): image is string => Boolean(image));
}

export function chunkItems<T>(items: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, (index + 1) * size),
  );
}

export function toSizeCell(variant: ProductVariant): SizeCell {
  return {
    key: String(variant.id),
    text: variant.name,
    isOutOfStock: variant.quantity <= 0,
  };
}

export function toQuantityCell(variant: ProductVariant, locale: string): SizeCell {
  return {
    key: String(variant.id),
    text: formatNumber(variant.quantity, locale),
    isOutOfStock: variant.quantity <= 0,
  };
}
