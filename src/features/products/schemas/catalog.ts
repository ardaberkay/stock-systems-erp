import { z } from 'zod';

// Marka, tip, renk ve kategori listeleri mağazaya özeldir; panelden eklenip silinebilir.
const namedItemSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
});

export const colorSchema = namedItemSchema.extend({
  code: z.string().nullish(),
});

export const categorySchema = namedItemSchema.extend({
  // 0 üst kategori demektir
  parentId: z.coerce.number().nullish(),
  status: z.coerce.number().nullish(),
});

export const brandListSchema = z.object({ data: z.array(namedItemSchema) });
export const productTypeListSchema = z.object({ data: z.array(namedItemSchema) });
export const colorListSchema = z.object({ data: z.array(colorSchema) });
export const categoryListSchema = z.object({ data: z.array(categorySchema) });

export type CatalogItem = z.infer<typeof namedItemSchema>;
export type ProductColorItem = z.infer<typeof colorSchema>;
export type Category = z.infer<typeof categorySchema>;
