import { z } from 'zod';

export const productVariantSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  quantity: z.coerce.number(),
});

const productCategorySchema = z.object({
  name: z.string(),
});

export const productSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  modelCode: z.string().nullish(),
  colorName: z.string().nullish(),
  typeName: z.string().nullish(),
  brandName: z.string().nullish(),
  image: z.string().nullish(),
  // API ek görselleri liste yerine numaralı alanlarda verir.
  image2: z.string().nullish(),
  image3: z.string().nullish(),
  image4: z.string().nullish(),
  image5: z.string().nullish(),
  image6: z.string().nullish(),
  image7: z.string().nullish(),
  image8: z.string().nullish(),
  price: z.coerce.number(),
  costPrice: z.coerce.number(),
  stock: z.coerce.number(),
  status: z.coerce.number(),
  variants: z
    .array(productVariantSchema)
    .nullish()
    .transform((variants) => variants ?? []),
  // Kategorisi olmayan üründe alan hiç gelmiyor.
  categories: z
    .array(productCategorySchema)
    .nullish()
    .transform((categories) => categories ?? []),
});

export const productListSchema = z.object({
  data: z.array(productSchema),
});

export type Product = z.infer<typeof productSchema>;
export type ProductVariant = z.infer<typeof productVariantSchema>;
