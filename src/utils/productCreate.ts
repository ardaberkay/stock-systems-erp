import type { BatchFailedItem } from '@/schemas/batchRequest';
import type { ProductCreateForm } from '@/schemas/productCreate';
import { parseMoney } from '@/utils/orderCreate';

export const EAN13_LENGTH = 13;

// 13 hane ve son hane kontrol hanesi: tek sıradakiler 1, çift sıradakiler 3 ile çarpılır
export function isValidEan13(value: string): boolean {
  if (!new RegExp(`^\\d{${EAN13_LENGTH}}$`).test(value)) {
    return false;
  }

  const digits = value.split('').map(Number);
  const sum = digits
    .slice(0, EAN13_LENGTH - 1)
    .reduce((total, digit, index) => total + digit * (index % 2 === 0 ? 1 : 3), 0);
  const check = (10 - (sum % 10)) % 10;

  return check === digits[EAN13_LENGTH - 1];
}

const MODEL_CODE_MIN = 10_000_000;
const MODEL_CODE_RANGE = 90_000_000;
const MODEL_CODE_ATTEMPTS = 20;

// Panel gibi 8 haneli sayısal kod önerilir; katalogda kullanılanlar atlanır.
// Kullanıcı kodu değiştirebilir, öneri yalnızca yazma zahmetini kaldırır.
export function generateModelCode(usedCodes: ReadonlySet<string>): string {
  let code = '';

  for (let attempt = 0; attempt < MODEL_CODE_ATTEMPTS; attempt += 1) {
    code = String(MODEL_CODE_MIN + Math.floor(Math.random() * MODEL_CODE_RANGE));

    if (!usedCodes.has(code)) {
      return code;
    }
  }

  return code;
}

function optionalMoney(text: string): number | undefined {
  return text === '' ? undefined : parseMoney(text);
}

// product/add gövdesi. API listede birden fazla ürün kabul eder; her renk ayrı üründür.
// Boş bırakılan isteğe bağlı alanlar gönderilmez, sunucu varsayılanını kullanır.
export function buildProductCreatePayload(values: ProductCreateForm) {
  return {
    products: [
      {
        modelCode: values.modelCode,
        name: values.name,
        colorId: values.colorId,
        typeId: values.typeId,
        brandId: values.brandId,
        categoryId: values.categoryIds.length > 0 ? values.categoryIds : undefined,
        description: values.description || undefined,
        salePrice: parseMoney(values.salePrice),
        listPrice: optionalMoney(values.listPrice),
        costPrice: optionalMoney(values.costPrice),
        // Dokümanda yok ama sunucu kabul ediyor (test 09.11.2026)
        costPrice2: optionalMoney(values.costPrice2),
        status: values.active ? 1 : 0,
        taxRate: values.taxRate,
        variants: values.variants.map((variant) => ({
          variantName: variant.name,
          quantity: Number(variant.quantity),
          price: optionalMoney(variant.price),
          barcode: variant.barcode || undefined,
        })),
      },
    ],
  };
}

export type BatchFailureReason = { kind: 'duplicate' } | { kind: 'other'; detail: string };

function isUniquenessError(errorList: unknown): boolean {
  const entries = Array.isArray(errorList) ? errorList : [errorList];

  return entries.some(
    (entry) =>
      typeof entry === 'object' &&
      entry !== null &&
      'problemType' in entry &&
      entry.problemType === 'uniqueness',
  );
}

// Toplu işin hata satırı anlaşılır nedene çevrilir; bilinmeyen hata ham haliyle gösterilir.
export function getBatchFailureReason(item: BatchFailedItem | undefined): BatchFailureReason {
  if (item && isUniquenessError(item.errorList)) {
    return { kind: 'duplicate' };
  }

  return { kind: 'other', detail: item?.errorMsg ?? item?.error ?? '' };
}
