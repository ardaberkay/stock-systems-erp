import type { SizeCell } from '@/features/products/components/SizeRow';
import {
  DEFAULT_PRODUCT_FILTERS,
  LOW_STOCK_LIMIT,
  PRODUCT_STATUS,
  type ProductFilters,
  type StockFilter,
} from '@/features/products/constants/products';
import type { Product, ProductVariant } from '@/features/products/schemas/products';
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

// Barkod → o barkodu taşıyan ürünlerin id'leri
export type BarcodeIndex = ReadonlyMap<string, ReadonlySet<number>>;

const NO_BARCODE_MATCHES: ReadonlySet<number> = new Set();

// Okuyucu veya kamera barkodu eksiksiz verir; boşluk ve harf büyüklüğü fark etmez
export function normalizeBarcode(text: string): string {
  return text.replace(/\s/g, '').toLocaleUpperCase('en');
}

// Katalog değişince bir kez kurulur; her aramada tüm varyantlar tek tek gezilmez.
// Düzenlemede eklenen varyantın barkodu boş gelir, dizine girmez.
export function buildBarcodeIndex(products: Product[]): BarcodeIndex {
  const index = new Map<string, Set<number>>();

  for (const product of products) {
    for (const variant of product.variants) {
      const barcode = normalizeBarcode(variant.barcode ?? '');

      if (barcode) {
        const ids = index.get(barcode) ?? new Set<number>();
        ids.add(product.id);
        index.set(barcode, ids);
      }
    }
  }

  return index;
}

// Barkod tam eşleşmeyle aranır: parça eşleşme sayı olan model kodlarıyla karışır, gürültü üretir
export function getBarcodeMatches(index: BarcodeIndex, query: string): ReadonlySet<number> {
  return index.get(normalizeBarcode(query)) ?? NO_BARCODE_MATCHES;
}

// Barkod tek ürüne denk geldiyse o ürün; kartı kendiliğinden açmak için
export function getSingleBarcodeMatch(matches: ReadonlySet<number>): number | null {
  if (matches.size !== 1) {
    return null;
  }
  const [id] = matches;

  return id ?? null;
}

// Ad ve model kodunda parça eşleşme; search normalizeText'ten geçmiş olmalı
export function matchesProductText(product: Product, search: string): boolean {
  return (
    normalizeText(product.name).includes(search) ||
    normalizeText(product.modelCode ?? '').includes(search)
  );
}

// Arama ve filtre tüm katalogda telefonda çalışır; API'de isimle arama servisi yok.
// Barkodla bulunan ürün filtreye takılmaz: okutmak "tam olarak bu ürünü göster" demektir.
export function getVisibleProducts(
  products: Product[],
  query: string,
  filters: ProductFilters,
  barcodeMatches: ReadonlySet<number> = NO_BARCODE_MATCHES,
): Product[] {
  const search = normalizeText(query);

  return products
    .filter(
      (product) =>
        barcodeMatches.has(product.id) ||
        (matchesFilters(product, filters) && matchesProductText(product, search)),
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
