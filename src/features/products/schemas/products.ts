import { z } from 'zod';

// Varyant fiyatı metin ("110.00") veya null gelir; boşsa ürünün fiyatı geçerlidir
const optionalPriceSchema = z
  .union([z.string(), z.number()])
  .nullish()
  .transform((value) => (value === null || value === undefined || value === '' ? null : Number(value)));

export const productVariantSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  quantity: z.coerce.number(),
  barcode: z.string().nullish(),
  price: optionalPriceSchema,
});

const productCategorySchema = z.object({
  categoryId: z.coerce.number().nullish(),
  name: z.string(),
});

export const productSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  modelCode: z.string().nullish(),
  // Model kodu ve renk birlikte benzersizdir; yeni üründe tekrar kontrolü için gerekir
  colorId: z.coerce.number().nullish(),
  colorName: z.string().nullish(),
  typeId: z.coerce.number().nullish(),
  typeName: z.string().nullish(),
  // Markasız üründe 0 gelir
  brandId: z.coerce.number().nullish(),
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
  // Eklerken ve güncellerken listPrice adıyla yazılır, okurken marketPrice adıyla gelir
  marketPrice: z.coerce.number().nullish(),
  costPrice: z.coerce.number(),
  costPrice2: z.coerce.number().nullish(),
  // Açıklama; eklerken description, güncellerken details adıyla yazılır
  details: z.string().nullish(),
  taxRate: z.coerce.number().nullish(),
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
