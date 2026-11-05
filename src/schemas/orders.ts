import { z } from 'zod';

// coerce null'ı 0 yapar; boş alanlar (desi, özel durum…) null kalmalı.
const nullableNumber = z
  .union([z.number(), z.string()])
  .nullish()
  .transform((value) => (value === null || value === undefined || value === '' ? null : Number(value)));

// Numara gibi görünen metinler (vergi no, dış sipariş no) sayı olarak da gelebilir.
const nullableText = z
  .union([z.string(), z.number()])
  .nullish()
  .transform((value) => (value === null || value === undefined || value === '' ? null : String(value)));

// API sayıları bazen string döndürür; coerce ile tek tipe çekilir.
export const orderItemSchema = z.object({
  id: nullableNumber,
  productId: nullableNumber,
  variantName: z.string().nullish(),
  qty: z.coerce.number(),
  price: z.coerce.number(),
  statusId: z.coerce.number(),
});

export const orderSchema = z.object({
  id: z.coerce.number(),
  // Entegrasyondan gelen siparişin dış numarası; panelde açılan siparişlerde boş
  customOrderId: nullableText,
  orderEmail: z.string().nullish(),
  orderDateTime: z.string(),
  orderDeliveryDateTime: z.string().nullish(),
  orderProductsValue: nullableNumber,
  orderAmount: z.coerce.number(),
  orderPaymentConfirm: nullableNumber,
  // Müşteriden alınan kargo; mağazanın kargo firmasına ödediği tutar API'de yok
  orderShippingValue: nullableNumber.transform((value) => value ?? 0),
  orderStatusId: z.coerce.number(),
  orderCustomStatusId: nullableNumber,
  orderPaymentTypeId: nullableNumber,
  deliveryFirstName: z.string().nullish(),
  deliveryLastName: z.string().nullish(),
  deliveryPhone: z.string().nullish(),
  deliveryCity: z.string().nullish(),
  deliveryDistrict: z.string().nullish(),
  deliveryAddress: z.string().nullish(),
  // Görülen değerler: 'sender' / 'home'; görünen metin i18n'den gelir
  deliveryWhoPaysShipping: z.string().nullish(),
  deliveryCargoPlaceOfDelivery: z.string().nullish(),
  shippingCargoCompanyId: nullableNumber,
  shippingPackageDeciValue: nullableNumber,
  shippingBarcodeCreateDateTime: z.string().nullish(),
  // Entegratör kullanılan siparişlerde paketi taşıyan asıl firma ("Sürat Kargo" gibi)
  shippingCarrierBranchName: z.string().nullish(),
  // Panelde entegrasyon kodu ve barkod olarak görünür
  shippingTrackCode: z.string().nullish(),
  shippingTrackCode2: z.string().nullish(),
  billingFirstName: z.string().nullish(),
  billingLastName: z.string().nullish(),
  billingCity: z.string().nullish(),
  billingDistrict: z.string().nullish(),
  billingAddress: z.string().nullish(),
  billingPhone: z.string().nullish(),
  billingMail: z.string().nullish(),
  billingTaxOffice: nullableText,
  billingTaxNumber: nullableText,
  affiliateAccountId: nullableNumber,
  description: z.string().nullish(),
  description2: z.string().nullish(),
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
