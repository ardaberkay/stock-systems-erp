import { DELIVERY_PLACES, SHIPPING_PAYERS } from '@/features/orders/constants/detail';
import { toApiPhone } from '@/features/orders/utils/phone';
import { z } from 'zod';

// Hata mesajları çeviri anahtarıdır; ekranda t() ile gösterilir.
const ERRORS = {
  required: 'orders.create.errors.required',
  phone: 'orders.create.errors.phone',
  email: 'orders.create.errors.email',
  amount: 'orders.create.errors.amount',
  noItems: 'orders.create.errors.noItems',
  addressMin: 'orders.create.errors.addressMin',
} as const;

// API 7 karakterden kısa adresi reddeder (prepareOrderArgs:delivery.address)
export const ADDRESS_MIN_LENGTH = 7;
// Virgüllü de yazılabilir (1299,90); en fazla iki kuruş hanesi
export const MONEY_PATTERN = /^\d+([.,]\d{1,2})?$/;

const requiredText = z.string().trim().min(1, ERRORS.required);
const optionalText = z.string().trim();
const moneyText = z.string().trim().regex(MONEY_PATTERN, ERRORS.amount);
const optionalMoneyText = z
  .string()
  .trim()
  .refine((value) => value === '' || MONEY_PATTERN.test(value), ERRORS.amount);
const optionalEmail = z
  .string()
  .trim()
  .refine((value) => value === '' || z.email().safeParse(value).success, ERRORS.email);
// Seçim alanları boşken null tutulur
const requiredId = z
  .number()
  .nullable()
  .refine((value) => value !== null, ERRORS.required);

// Teslimat ve faturada ortak alanlar; il ve ilçe API'nin listesinden seçilir
const addressShape = {
  firstName: requiredText,
  lastName: requiredText,
  phoneCountry: z.string(),
  phone: z.string().trim().min(1, ERRORS.phone),
  cityId: requiredId,
  cityName: z.string(),
  districtName: requiredText,
  address: z.string().trim().min(ADDRESS_MIN_LENGTH, ERRORS.addressMin),
};

// Numaranın geçerliliği seçili ülkeye göre değişir (TR 10 hane, yurt dışı 6-14 hane)
function checkPhone(value: { phoneCountry: string; phone: string }, ctx: z.RefinementCtx) {
  if (value.phone !== '' && toApiPhone(value.phoneCountry, value.phone) === null) {
    ctx.addIssue({ code: 'custom', message: ERRORS.phone, path: ['phone'] });
  }
}

// Kalemde ürünün o anki adı ve görseli de tutulur; katalog yenilense de satır değişmez.
export const orderCreateItemSchema = z.object({
  productId: z.number(),
  variantId: z.number(),
  name: z.string(),
  sizeName: z.string(),
  // Aynı adlı ürünün renkleri ayrı üründür; sepette ayırt edilsin diye yalnızca gösterilir
  colorName: z.string().nullable(),
  image: z.string().nullable(),
  stock: z.number(),
  quantity: z.number().int().min(1),
  price: moneyText,
});

export const orderCreateSchema = z.object({
  items: z.array(orderCreateItemSchema).min(1, ERRORS.noItems),
  delivery: z.object({ ...addressShape, email: optionalEmail }).superRefine(checkPhone),
  billingDifferent: z.boolean(),
  // Yalnızca "fatura bilgileri farklı" açıkken alanlar ekrandadır; kapalıyken boş kalır
  billing: z
    .object({ ...addressShape, taxOffice: optionalText, taxNumber: optionalText })
    .superRefine(checkPhone)
    .optional(),
  cargoCompanyId: requiredId,
  deliveryPlace: z.enum(DELIVERY_PLACES),
  whoPaysShipping: z.enum(SHIPPING_PAYERS),
  chargeShipping: z.boolean(),
  shippingFee: moneyText,
  paymentTypeId: requiredId,
  paymentConfirmed: z.boolean(),
  // Boşsa ürünlerden hesaplanır; panelde olduğu gibi elle değiştirilebilir
  productsValue: optionalMoneyText,
  description: optionalText,
  description2: optionalText,
});

// Formda seçim alanları boşken null'dır (giriş tipi); doğrulama sonrası doludur (çıktı tipi)
export type OrderCreateFormInput = z.input<typeof orderCreateSchema>;
export type OrderCreateForm = z.output<typeof orderCreateSchema>;
export type OrderCreateItem = z.infer<typeof orderCreateItemSchema>;
