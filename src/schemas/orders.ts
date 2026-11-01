import { z } from 'zod';

// coerce null'ı 0 yapar; boş alanlar (desi, özel durum…) null kalmalı.
const nullableNumber = z
  .union([z.number(), z.string()])
  .nullish()
  .transform((value) => (value === null || value === undefined || value === '' ? null : Number(value)));

// API sayıları bazen string döndürür; coerce ile tek tipe çekilir.
export const orderItemSchema = z.object({
  productId: z.coerce.number(),
  variantName: z.string().nullish(),
  qty: z.coerce.number(),
  price: z.coerce.number(),
  statusId: z.coerce.number(),
});

export const orderSchema = z.object({
  id: z.coerce.number(),
  orderDateTime: z.string(),
  orderAmount: z.coerce.number(),
  orderStatusId: z.coerce.number(),
  orderCustomStatusId: nullableNumber,
  orderPaymentTypeId: nullableNumber,
  deliveryFirstName: z.string().nullish(),
  deliveryLastName: z.string().nullish(),
  deliveryPhone: z.string().nullish(),
  shippingCargoCompanyId: nullableNumber,
  shippingPackageDeciValue: nullableNumber,
  // Panelde entegrasyon kodu ve barkod olarak görünür
  shippingTrackCode: z.string().nullish(),
  shippingTrackCode2: z.string().nullish(),
  affiliateAccountId: nullableNumber,
  items: z
    .array(orderItemSchema)
    .nullish()
    .transform((items) => items ?? []),
});

export const orderListSchema = z.object({
  data: z.array(orderSchema),
});

export const orderPaymentTypeSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
});

export const orderPaymentTypeListSchema = z.object({
  data: z.array(orderPaymentTypeSchema),
});

export const orderCustomStatusSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  status: z.coerce.number(),
});

export const orderCustomStatusListSchema = z.object({
  data: z.array(orderCustomStatusSchema),
});

export type Order = z.infer<typeof orderSchema>;
export type OrderPaymentType = z.infer<typeof orderPaymentTypeSchema>;
export type OrderCustomStatus = z.infer<typeof orderCustomStatusSchema>;
