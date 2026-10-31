import { z } from 'zod';

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
  items: z
    .array(orderItemSchema)
    .nullish()
    .transform((items) => items ?? []),
});

export const orderListSchema = z.object({
  data: z.array(orderSchema),
});

export type Order = z.infer<typeof orderSchema>;
