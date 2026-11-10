import { MONEY_PATTERN } from '@/features/orders/schemas/orderCreate';
import { isValidEan13 } from '@/features/products/utils/productCreate';
import { z } from 'zod';

// Hata mesajları çeviri anahtarıdır; ekranda t() ile gösterilir.
const ERRORS = {
  required: 'stock.create.errors.required',
  amount: 'stock.create.errors.amount',
  quantity: 'stock.create.errors.quantity',
  modelCode: 'stock.create.errors.modelCode',
  barcode: 'stock.create.errors.barcode',
  noVariants: 'stock.create.errors.noVariants',
  duplicateSize: 'stock.create.errors.duplicateSize',
  duplicateBarcode: 'stock.create.errors.duplicateBarcode',
} as const;

// API model kodunda yalnızca harf, rakam ve tire kabul eder
export const MODEL_CODE_PATTERN = /^[a-zA-Z0-9-]+$/;
export const QUANTITY_PATTERN = /^\d+$/;
// Paneldeki KDV seçenekleri
export const TAX_RATES = [0, 1, 8, 10, 12, 18, 20] as const;

const requiredText = z.string().trim().min(1, ERRORS.required);
const optionalText = z.string().trim();
const moneyText = z.string().trim().regex(MONEY_PATTERN, ERRORS.amount);
const optionalMoneyText = z
  .string()
  .trim()
  .refine((value) => value === '' || MONEY_PATTERN.test(value), ERRORS.amount);
// Seçim alanları boşken null tutulur
const requiredId = z
  .number()
  .nullable()
  .refine((value) => value !== null, ERRORS.required);

export const productVariantInputSchema = z.object({
  // Yalnızca listedeki satırın anahtarı; API'ye gönderilmez
  key: z.string(),
  name: requiredText,
  quantity: z.string().trim().regex(QUANTITY_PATTERN, ERRORS.quantity),
  price: optionalMoneyText,
  // Boşsa sunucu barkodu kendisi üretir
  barcode: z
    .string()
    .trim()
    .refine((value) => value === '' || isValidEan13(value), ERRORS.barcode),
});

// Aynı ad veya barkod iki satırda olursa ikinci satır işaretlenir. API aynı üründe tekrar eden
// varyant adını kabul ediyor (test 10.11.2026), barkod tekrarını reddediyor; ikisi de burada durur.
export function checkVariantDuplicates(
  variants: Pick<ProductVariantInput, 'name' | 'barcode'>[],
  ctx: z.RefinementCtx,
) {
  const names = new Set<string>();
  const barcodes = new Set<string>();

  variants.forEach((variant, index) => {
    const name = variant.name.trim().toLocaleUpperCase('tr');
    const barcode = variant.barcode.trim();

    if (name && names.has(name)) {
      ctx.addIssue({ code: 'custom', message: ERRORS.duplicateSize, path: [index, 'name'] });
    }
    if (barcode && barcodes.has(barcode)) {
      ctx.addIssue({ code: 'custom', message: ERRORS.duplicateBarcode, path: [index, 'barcode'] });
    }
    names.add(name);
    barcodes.add(barcode);
  });
}

// Bilgi ve fiyat adımları: ekleme ve düzenleme formunda aynı alanlar, aynı adlarla
export const productBaseSchema = z.object({
  name: requiredText,
  brandId: requiredId,
  typeId: requiredId,
  categoryIds: z.array(z.number()),
  description: optionalText,
  active: z.boolean(),
  salePrice: moneyText,
  listPrice: optionalMoneyText,
  costPrice: optionalMoneyText,
  costPrice2: optionalMoneyText,
  // Panelde olduğu gibi önceden seçili oran yok; kullanıcı seçmek zorunda
  taxRate: requiredId.refine(
    (value) => TAX_RATES.some((rate) => rate === value),
    ERRORS.required,
  ),
});

export const productCreateSchema = productBaseSchema.extend({
  colorId: requiredId,
  modelCode: requiredText.regex(MODEL_CODE_PATTERN, ERRORS.modelCode),
  variants: z
    .array(productVariantInputSchema)
    .min(1, ERRORS.noVariants)
    .superRefine(checkVariantDuplicates),
});

// Formda seçim alanları boşken null'dır (giriş tipi); doğrulama sonrası doludur (çıktı tipi)
export type ProductBaseFormInput = z.input<typeof productBaseSchema>;
export type ProductCreateFormInput = z.input<typeof productCreateSchema>;
export type ProductCreateForm = z.output<typeof productCreateSchema>;
export type ProductVariantInput = z.infer<typeof productVariantInputSchema>;
// Varyant satırı yalnızca bu alanları kullanır; ekleme ve düzenleme formu ikisi de uyar
export type ProductVariantsFormInput = { variants: ProductVariantInput[] };
