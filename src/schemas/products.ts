import { z } from 'zod';

export const productSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  modelCode: z.string().nullish(),
  colorName: z.string().nullish(),
  image: z.string().nullish(),
});

export const productListSchema = z.object({
  data: z.array(productSchema),
});

export type Product = z.infer<typeof productSchema>;
