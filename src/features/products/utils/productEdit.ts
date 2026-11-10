import { parseMoney } from '@/features/orders/utils/orderCreate';
import { createEmptyVariant } from '@/features/products/constants/productCreate';
import {
  PRODUCT_DETAIL_TABS,
  PRODUCT_EDIT_TAB_FIELDS,
  type ProductDetailTab,
} from '@/features/products/constants/productEdit';
import { PRODUCT_STATUS } from '@/features/products/constants/products';
import type {
  ProductEditForm,
  ProductEditFormInput,
  ProductEditVariant,
} from '@/features/products/schemas/productEdit';
import type { CatalogItem, Category } from '@/features/products/schemas/catalog';
import type { Product } from '@/features/products/schemas/products';
import { getProductImages } from '@/features/products/utils/productList';
import type { FieldErrors } from 'react-hook-form';

// 0 "girilmemiş" sayılır; alan boş görünür, boş bırakılınca yine 0 gider
function toOptionalMoneyText(value: number | null | undefined): string {
  return value ? String(value) : '';
}

// Formun başlangıcı ürünün kayıtlı hali; değişiklikler buna göre bulunur
export function getProductEditDefaults(product: Product): ProductEditFormInput {
  return {
    name: product.name,
    // Markasız üründe API 0 döner; alan boş açılır
    brandId: product.brandId || null,
    typeId: product.typeId || null,
    categoryIds: product.categories.flatMap((category) =>
      typeof category.categoryId === 'number' ? [category.categoryId] : [],
    ),
    description: product.details ?? '',
    active: product.status === PRODUCT_STATUS.active,
    salePrice: String(product.price),
    listPrice: toOptionalMoneyText(product.marketPrice),
    costPrice: toOptionalMoneyText(product.costPrice),
    costPrice2: toOptionalMoneyText(product.costPrice2),
    taxRate: product.taxRate ?? null,
    images: getProductImages(product),
    variants: product.variants.map((variant) => ({
      key: `variant-saved-${variant.id}`,
      id: variant.id,
      name: variant.name,
      quantity: String(variant.quantity),
      price: variant.price === null ? '' : String(variant.price),
      barcode: variant.barcode ?? '',
    })),
  };
}

export function createEmptyEditVariant(): ProductEditVariant {
  return { ...createEmptyVariant(), id: null };
}

// Formun başlangıcındaki kayıtlı varyant stokları (id → adet); stok farkı ve eksi stok
// kontrolü buna göre yapılır
export function getOriginalQuantities(original: ProductEditFormInput): Map<number, number> {
  return new Map(
    original.variants.flatMap((variant) =>
      variant.id === null ? [] : [[variant.id, Number(variant.quantity)]],
    ),
  );
}

type ApiFields = Record<string, unknown>;

export type NewVariantPayload = {
  variantName: string;
  quantity: number;
  barcode?: string;
  price?: number;
};

// Kaydetmede gidecek istekler; yalnızca değişenler. Sıra api/products.ts'teki saveProductEdit'te.
export type ProductEditPlan = {
  product: ApiFields | null;
  deletedVariantIds: number[];
  variantUpdates: { id: number; update: ApiFields }[];
  stockChanges: { id: number; delta: number }[];
  // key: formdaki satır; sunucunun verdiği id kayıttan sonra bu satıra yazılır
  newVariants: { key: string; payload: NewVariantPayload }[];
};

// Kaydetmede başarıyla uygulanan adımlar (bkz. saveProductEdit)
export type AppliedEdit = {
  product: boolean;
  deletedIds: number[];
  updatedIds: number[];
  stockIds: number[];
  added: { key: string; id: number }[];
};

function optionalMoney(text: string): number | null {
  return text.trim() === '' ? null : parseMoney(text);
}

function sameList(a: readonly (string | number)[], b: readonly (string | number)[]): boolean {
  return a.length === b.length && a.every((item, index) => item === b[index]);
}

// product/update gövdesi. Alan adları eklemedekinden farklı: açıklama `details`, fiyat `price`.
function buildProductUpdate(values: ProductEditForm, original: ProductEditFormInput): ApiFields {
  const update: ApiFields = {};

  if (values.name !== original.name.trim()) update.name = values.name;
  if (values.description !== original.description.trim()) update.details = values.description;
  if (values.brandId !== original.brandId) update.brandId = values.brandId;
  if (values.typeId !== original.typeId) update.typeId = values.typeId;
  if (values.taxRate !== original.taxRate) update.taxRate = values.taxRate;
  if (values.active !== original.active) {
    update.status = values.active ? PRODUCT_STATUS.active : PRODUCT_STATUS.passive;
  }
  if (parseMoney(values.salePrice) !== parseMoney(original.salePrice)) {
    update.price = parseMoney(values.salePrice);
  }
  // Boşaltılan fiyat ve maliyet 0 olarak gider
  if (parseMoney(values.listPrice) !== parseMoney(original.listPrice)) {
    update.listPrice = parseMoney(values.listPrice);
  }
  if (parseMoney(values.costPrice) !== parseMoney(original.costPrice)) {
    update.costPrice = parseMoney(values.costPrice);
  }
  if (parseMoney(values.costPrice2) !== parseMoney(original.costPrice2)) {
    update.costPrice2 = parseMoney(values.costPrice2);
  }
  // Gönderilen kategori listesi eskisinin yerine geçer
  const categories = [...values.categoryIds].sort((a, b) => a - b);
  if (!sameList(categories, [...original.categoryIds].sort((a, b) => a - b))) {
    update.categoryId = categories;
  }
  // Görseller sıra numarasıyla yazılır; sunucu hepsini adresinden yeniden indirir
  if (!sameList(values.images, original.images)) {
    update.images = values.images.map((url) => ({ url }));
  }

  return update;
}

export function buildProductEditPlan(
  values: ProductEditForm,
  original: ProductEditFormInput,
): ProductEditPlan | null {
  const product = buildProductUpdate(values, original);
  const originalVariants = new Map(
    original.variants.flatMap((variant) => (variant.id === null ? [] : [[variant.id, variant]])),
  );
  const keptIds = new Set(values.variants.flatMap((variant) => variant.id ?? []));
  const variantUpdates: ProductEditPlan['variantUpdates'] = [];
  const stockChanges: ProductEditPlan['stockChanges'] = [];
  const newVariants: ProductEditPlan['newVariants'] = [];

  values.variants.forEach((variant) => {
    const before = variant.id === null ? undefined : originalVariants.get(variant.id);

    if (variant.id === null || !before) {
      newVariants.push({
        key: variant.key,
        payload: {
          variantName: variant.name,
          quantity: Number(variant.quantity),
          barcode: variant.barcode || undefined,
          price: optionalMoney(variant.price) ?? undefined,
        },
      });
      return;
    }

    const update: ApiFields = {};
    if (variant.name !== before.name.trim()) update.variantName = variant.name;
    // Boş barkod null ile silinir
    if (variant.barcode !== before.barcode.trim()) update.barcode = variant.barcode || null;
    // Boş özel fiyat null ile silinir; ürünün fiyatı geçerli olur
    const price = optionalMoney(variant.price);
    if (price !== optionalMoney(before.price)) update.price = price;
    if (Object.keys(update).length > 0) variantUpdates.push({ id: variant.id, update });

    // Adet yazılmaz, fark gönderilir: form açıkken gelen sipariş stoğu bozulmasın
    const delta = Number(variant.quantity) - Number(before.quantity);
    if (delta !== 0) stockChanges.push({ id: variant.id, delta });
  });

  const plan: ProductEditPlan = {
    product: Object.keys(product).length > 0 ? product : null,
    deletedVariantIds: [...originalVariants.keys()].filter((id) => !keptIds.has(id)),
    variantUpdates,
    stockChanges,
    newVariants,
  };

  return getPlanRequestCount(plan) > 0 ? plan : null;
}

// Kayıt yarıda kalınca formun yeni başlangıcı: uygulanan adımlar "kaydedilmiş" sayılır, kalanlar
// bekleyen değişiklik olarak durur. Tekrar kaydedince yalnızca kalanlar gider; stok farkı ikinci
// kez uygulanmaz, eklenen varyant ikinci kez eklenmez.
export function advanceEditBaseline(
  original: ProductEditFormInput,
  values: ProductEditForm,
  applied: AppliedEdit,
): ProductEditFormInput {
  const originalVariants = new Map(
    original.variants.flatMap((variant) => (variant.id === null ? [] : [[variant.id, variant]])),
  );
  const addedIds = new Map(applied.added.map(({ key, id }) => [key, id]));
  const formIds = new Set(values.variants.flatMap((variant) => variant.id ?? []));

  // Satırlar formdaki sırayla dizilir ki değişmemiş liste "değişti" görünmesin
  const variants = values.variants.flatMap((variant) => {
    const before = variant.id === null ? undefined : originalVariants.get(variant.id);

    if (before && variant.id !== null) {
      const updated = applied.updatedIds.includes(variant.id);
      const stocked = applied.stockIds.includes(variant.id);

      return [
        {
          ...before,
          name: updated ? variant.name : before.name,
          barcode: updated ? variant.barcode : before.barcode,
          price: updated ? variant.price : before.price,
          quantity: stocked ? variant.quantity : before.quantity,
        },
      ];
    }
    const addedId = addedIds.get(variant.key);

    return addedId === undefined ? [] : [{ ...variant, id: addedId }];
  });
  // Silinemeyen varyantlar başlangıçta kalır; formda olmadıkları için silme yeniden denenir
  const notDeleted = original.variants.filter(
    (variant) =>
      variant.id !== null && !formIds.has(variant.id) && !applied.deletedIds.includes(variant.id),
  );

  return {
    ...original,
    ...(applied.product
      ? {
          name: values.name,
          brandId: values.brandId,
          typeId: values.typeId,
          categoryIds: values.categoryIds,
          description: values.description,
          active: values.active,
          salePrice: values.salePrice,
          listPrice: values.listPrice,
          costPrice: values.costPrice,
          costPrice2: values.costPrice2,
          taxRate: values.taxRate,
          images: values.images,
        }
      : {}),
    variants: [...variants, ...notDeleted],
  };
}

export function getPlanRequestCount(plan: ProductEditPlan): number {
  return (
    (plan.product ? 1 : 0) +
    plan.deletedVariantIds.length +
    plan.variantUpdates.length +
    plan.stockChanges.length +
    plan.newVariants.length
  );
}

// Bellekteki marka, tip ve kategori listeleri; değişen seçimin adı buradan bulunur
export type CatalogLookups = {
  brands: CatalogItem[] | undefined;
  types: CatalogItem[] | undefined;
  categories: Category[] | undefined;
};

function findName(items: CatalogItem[] | undefined, id: number | null): string | null {
  return items?.find((item) => item.id === id)?.name ?? null;
}

// Kaydedilen değerlerle ürünün ekranda görünecek hali. Sunucu güncel ürünü dönmediği için
// sayfa beklemeden bunu gösterir; asıl veri arkadan okununca yerine geçer. Stok, form açıkken
// gelen siparişleri bilmez; yeni varyantların id'si okuyana kadar geçicidir (eksi sayı).
export function applyProductEdit(
  product: Product,
  values: ProductEditForm,
  lookups: CatalogLookups,
): Product {
  const variants = values.variants.map((variant, index) => ({
    id: variant.id ?? -(index + 1),
    name: variant.name,
    quantity: Number(variant.quantity),
    barcode: variant.barcode || null,
    price: optionalMoney(variant.price),
  }));
  const savedCategories = new Map(
    product.categories.map((category) => [category.categoryId, category.name]),
  );
  // API görselleri numaralı alanlarda tutar (image, image2 … image8)
  const imageAt = (index: number) => values.images[index] ?? null;

  return {
    ...product,
    name: values.name,
    details: values.description,
    brandId: values.brandId,
    brandName:
      values.brandId === product.brandId
        ? product.brandName
        : (findName(lookups.brands, values.brandId) ?? product.brandName),
    typeId: values.typeId,
    typeName:
      values.typeId === product.typeId
        ? product.typeName
        : (findName(lookups.types, values.typeId) ?? product.typeName),
    categories: values.categoryIds.map((categoryId) => ({
      categoryId,
      name: savedCategories.get(categoryId) ?? findName(lookups.categories, categoryId) ?? '',
    })),
    status: values.active ? PRODUCT_STATUS.active : PRODUCT_STATUS.passive,
    price: parseMoney(values.salePrice),
    marketPrice: parseMoney(values.listPrice),
    costPrice: parseMoney(values.costPrice),
    costPrice2: parseMoney(values.costPrice2),
    taxRate: values.taxRate,
    image: imageAt(0),
    image2: imageAt(1),
    image3: imageAt(2),
    image4: imageAt(3),
    image5: imageAt(4),
    image6: imageAt(5),
    image7: imageAt(6),
    image8: imageAt(7),
    variants,
    stock: variants.reduce((total, variant) => total + variant.quantity, 0),
  };
}

export function getTabsWithErrors(errors: FieldErrors<ProductEditFormInput>): ProductDetailTab[] {
  const invalidKeys = Object.keys(errors);

  return PRODUCT_DETAIL_TABS.filter((tab) =>
    PRODUCT_EDIT_TAB_FIELDS[tab].some((key) => invalidKeys.includes(key)),
  );
}
