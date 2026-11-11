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
  // 1 aktif, 0 pasif; pasif kategori ürün formunda seçilemez
  status: z.coerce.number().nullish(),
  // 1 görünür, 0 gizli
  visibility: z.coerce.number().nullish(),
  // Paneldeki sıra numarası; uygulamadaki listeyi etkilemez
  sortNum: z.coerce.number().nullish(),
  description: z.string().nullish(),
});

export const brandListSchema = z.object({ data: z.array(namedItemSchema) });
export const productTypeListSchema = z.object({ data: z.array(namedItemSchema) });
export const colorListSchema = z.object({ data: z.array(colorSchema) });
export const categoryListSchema = z.object({ data: z.array(categorySchema) });

// Ekleme yeni kaydın id'sini, güncelleme ve silme etkilenen kayıt sayısını döner
export const catalogCreatedSchema = z.coerce.number();
export const catalogAffectedSchema = z.object({ numOfAffectedRecords: z.coerce.number() });

// Katalog yönetim sayfaları (catalog/[kind])
export const catalogKindSchema = z.enum(['types', 'colors', 'brands', 'categories']);

// Hata mesajları çeviri anahtarıdır; ekranda t() ile gösterilir
const requiredName = z.string().trim().min(1, 'stock.catalogForm.errors.required');

export const catalogItemFormSchema = z.object({
  name: requiredName,
});

export const categoryFormSchema = z.object({
  name: requiredName,
  // 0 ana kategori
  parentId: z.number(),
  sortNum: z.string().trim().regex(/^\d+$/, 'stock.catalogForm.errors.sortNum'),
  description: z.string().trim(),
  visible: z.boolean(),
  active: z.boolean(),
});

export type CatalogItem = z.infer<typeof namedItemSchema>;
export type CatalogKind = z.infer<typeof catalogKindSchema>;
export type CatalogItemForm = z.infer<typeof catalogItemFormSchema>;
export type CategoryForm = z.infer<typeof categoryFormSchema>;
export type ProductColorItem = z.infer<typeof colorSchema>;
export type Category = z.infer<typeof categorySchema>;
