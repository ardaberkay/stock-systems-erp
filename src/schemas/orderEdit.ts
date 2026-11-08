import { DELIVERY_PLACES, SHIPPING_PAYERS } from '@/constants/orderDetail';
import { ADDRESS_MIN_LENGTH, MONEY_PATTERN } from '@/schemas/orderCreate';
import { isValidTrMobile } from '@/utils/phone';
import { z } from 'zod';

// Hata mesajları çeviri anahtarıdır; ekranda t() ile gösterilir.
const ERRORS = {
  required: 'orders.create.errors.required',
  email: 'orders.create.errors.email',
  amount: 'orders.create.errors.amount',
  addressMin: 'orders.create.errors.addressMin',
  phone: 'orders.editMode.errors.phone',
  taxOffice: 'orders.editMode.errors.taxOffice',
  taxNumber: 'orders.editMode.errors.taxNumber',
  cannotClear: 'orders.editMode.errors.cannotClear',
} as const;

// API vergi dairesinde rakam kabul etmiyor ("1" reddedildi, "ab" kabul edildi)
const TAX_OFFICE_PATTERN = /^[\p{L} ]{2,}$/u;
// Vergi no 10, TC 11 hane
const TAX_NUMBER_PATTERN = /^\d{10,11}$/;

const requiredText = z.string().trim().min(1, ERRORS.required);
const optionalText = z.string().trim();
const address = z.string().trim().min(ADDRESS_MIN_LENGTH, ERRORS.addressMin);

// Teslimat ve faturada ortak adres alanları; il ve ilçe API'nin listesinden adla seçilir
const addressShape = {
  firstName: requiredText,
  cityName: requiredText,
  districtName: requiredText,
  address,
};

const baseSchema = z.object({
  statusId: z.number(),
  // Mağazanın kendi tanımladığı durum; null = yok
  customStatusId: z.number().nullable(),
  paymentTypeId: z.number().nullable(),
  shippingFee: z.string().trim().regex(MONEY_PATTERN, ERRORS.amount),
  description: optionalText,
  description2: optionalText,
  // Teslimat telefonu yok: API delivery.phone'u fatura telefonuna yazıyor (test edildi)
  delivery: z.object({
    ...addressShape,
    lastName: requiredText,
    email: optionalText,
    place: z.enum(DELIVERY_PLACES),
  }),
  // Fatura soyadı ve e-postası yok: API soyadı telefona yazıyor, e-postayı kabul etmiyor
  billing: z.object({
    ...addressShape,
    phone: z.string(),
    taxOffice: optionalText,
    taxNumber: optionalText,
  }),
  cargoCompanyId: z.number().nullable(),
  whoPaysShipping: z.enum(SHIPPING_PAYERS),
});

export type OrderEditForm = z.infer<typeof baseSchema>;

// Kurallar siparişin kayıtlı haline göre değişir: dokunulmayan alan doğrulanmaz
// (test siparişlerinde 5555555555 gibi eski değerler var), dolu vergi alanı boşaltılamaz.
export function createOrderEditSchema(original: OrderEditForm) {
  return baseSchema.superRefine((values, ctx) => {
    const { email } = values.delivery;
    const { phone, taxOffice, taxNumber } = values.billing;

    if (email !== original.delivery.email) {
      if (email === '' && original.delivery.email !== '') {
        ctx.addIssue({ code: 'custom', message: ERRORS.required, path: ['delivery', 'email'] });
      } else if (email !== '' && !z.email().safeParse(email).success) {
        ctx.addIssue({ code: 'custom', message: ERRORS.email, path: ['delivery', 'email'] });
      }
    }

    if (phone !== original.billing.phone && !isValidTrMobile(phone)) {
      ctx.addIssue({ code: 'custom', message: ERRORS.phone, path: ['billing', 'phone'] });
    }

    if (taxOffice !== original.billing.taxOffice) {
      if (taxOffice === '' && original.billing.taxOffice !== '') {
        ctx.addIssue({ code: 'custom', message: ERRORS.cannotClear, path: ['billing', 'taxOffice'] });
      } else if (taxOffice !== '' && !TAX_OFFICE_PATTERN.test(taxOffice)) {
        ctx.addIssue({ code: 'custom', message: ERRORS.taxOffice, path: ['billing', 'taxOffice'] });
      }
    }

    if (taxNumber !== original.billing.taxNumber) {
      if (taxNumber === '' && original.billing.taxNumber !== '') {
        ctx.addIssue({ code: 'custom', message: ERRORS.cannotClear, path: ['billing', 'taxNumber'] });
      } else if (taxNumber !== '' && !TAX_NUMBER_PATTERN.test(taxNumber)) {
        ctx.addIssue({ code: 'custom', message: ERRORS.taxNumber, path: ['billing', 'taxNumber'] });
      }
    }
  });
}
