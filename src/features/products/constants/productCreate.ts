import type { ProductCreateFormInput, ProductVariantInput } from '@/features/products/schemas/productCreate';
import type { FieldPath } from 'react-hook-form';

// Görünen adlar `stock.create.steps.<adım>` çevirisinden gelir.
// Son adımın butonu doğrudan ürünü kaydeder; ayrı özet adımı yok.
export const PRODUCT_CREATE_STEPS = ['info', 'price', 'variants'] as const;

export type ProductCreateStep = (typeof PRODUCT_CREATE_STEPS)[number];

// Bir adımdan geçerken yalnızca o adımın alanları doğrulanır.
export const PRODUCT_CREATE_STEP_FIELDS: Record<
  ProductCreateStep,
  FieldPath<ProductCreateFormInput>[]
> = {
  info: ['name', 'brandId', 'typeId', 'categoryIds', 'description', 'active'],
  price: ['salePrice', 'listPrice', 'costPrice', 'costPrice2', 'taxRate'],
  variants: ['colorId', 'modelCode', 'variants'],
};

let variantKeySeed = 0;

// Satır anahtarı yalnızca listede satırları ayırt etmek içindir
export function createEmptyVariant(): ProductVariantInput {
  variantKeySeed += 1;

  return { key: `variant-${variantKeySeed}`, name: '', quantity: '', price: '', barcode: '' };
}

// Model kodu ekran açılınca katalogdan bakılarak önerilir (bkz. generateModelCode)
export function createProductDefaults(modelCode: string): ProductCreateFormInput {
  return {
    name: '',
    brandId: null,
    typeId: null,
    categoryIds: [],
    description: '',
    active: true,
    salePrice: '',
    listPrice: '',
    costPrice: '',
    costPrice2: '',
    taxRate: null,
    colorId: null,
    modelCode,
    variants: [createEmptyVariant()],
  };
}

// Panelde aktif kategoriler 1 durumundadır
export const ACTIVE_CATEGORY_STATUS = 1;

// Ürün ekleme toplu işlemde sırayla işleniyor (test hesabında 10 dakikada bir).
// Durum bu aralıkla sorulur; süre dolarsa takip bırakılır, ürün yine de oluşabilir.
export const PRODUCT_BATCH_POLL_MS = 30_000;
export const PRODUCT_BATCH_TIMEOUT_MS = 15 * 60_000;
export const BATCH_IN_PROGRESS = 'InProgress';
