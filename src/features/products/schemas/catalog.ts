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

// Ekleme yeni kaydın id'sini, güncelleme ve silme etkilenen kayıt sayısını döner
export const catalogCreatedSchema = z.coerce.number();
export const catalogAffectedSchema = z.object({ numOfAffectedRecords: z.coerce.number() });

// Katalog yönetim sayfaları (catalog/[kind]); markalar, renkler ve kategoriler sırası gelince eklenir
export const catalogKindSchema = z.enum(['types']);

// Hata mesajları çeviri anahtarıdır; ekranda t() ile gösterilir
export const catalogItemFormSchema = z.object({
  name: z.string().trim().min(1, 'stock.catalogForm.errors.required'),
});

export type CatalogItem = z.infer<typeof namedItemSchema>;
export type CatalogKind = z.infer<typeof catalogKindSchema>;
export type CatalogItemForm = z.infer<typeof catalogItemFormSchema>;
export type ProductColorItem = z.infer<typeof colorSchema>;
export type Category = z.infer<typeof categorySchema>;
