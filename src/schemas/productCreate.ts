import { MONEY_PATTERN } from '@/schemas/orderCreate';
import { isValidEan13 } from '@/utils/productCreate';
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
} as const;

// API model kodunda yalnızca harf, rakam ve tire kabul eder
export const MODEL_CODE_PATTERN = /^[a-zA-Z0-9-]+$/;
const QUANTITY_PATTERN = /^\d+$/;
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

export const productCreateSchema = z.object({
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
  colorId: requiredId,
  modelCode: requiredText.regex(MODEL_CODE_PATTERN, ERRORS.modelCode),
  variants: z
    .array(productVariantInputSchema)
    .min(1, ERRORS.noVariants)
    .superRefine((variants, ctx) => {
      // Aynı beden iki kez yazılırsa ikinci satır işaretlenir
      const seen = new Set<string>();

      variants.forEach((variant, index) => {
        const name = variant.name.trim().toLocaleUpperCase('tr');

        if (name && seen.has(name)) {
          ctx.addIssue({ code: 'custom', message: ERRORS.duplicateSize, path: [index, 'name'] });
        }
        seen.add(name);
      });
    }),
});

// Formda seçim alanları boşken null'dır (giriş tipi); doğrulama sonrası doludur (çıktı tipi)
export type ProductCreateFormInput = z.input<typeof productCreateSchema>;
export type ProductCreateForm = z.output<typeof productCreateSchema>;
export type ProductVariantInput = z.infer<typeof productVariantInputSchema>;
