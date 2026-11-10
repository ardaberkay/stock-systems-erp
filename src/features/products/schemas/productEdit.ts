import {
  checkVariantDuplicates,
  productBaseSchema,
  productVariantInputSchema,
} from '@/features/products/schemas/productCreate';
import { z } from 'zod';

const ERRORS = {
  quantity: 'stock.create.errors.quantity',
  noVariants: 'stock.create.errors.noVariants',
} as const;

// Kayıtlı stok eksi olabilir (panelde stoktan fazla satış); bu yüzden işaret de kabul edilir
const SIGNED_QUANTITY_PATTERN = /^-?\d+$/;

export const productEditVariantSchema = productVariantInputSchema.extend({
  // Kayıtlı varyantın id'si; yeni eklenen satırda null
  id: z.number().nullable(),
  quantity: z.string().trim().regex(SIGNED_QUANTITY_PATTERN, ERRORS.quantity),
});

export type ProductEditVariant = z.infer<typeof productEditVariantSchema>;

// Düzenleme formu: bilgi ve fiyat eklemedekiyle aynı. Model kodu ve renk API'de değişmediği
// için formda yok (test 10.11.2026). Görseller yalnızca sıralanabilir, adresleri sırayla tutulur.
// `originalQuantities`: kayıtlı varyantların düzenleme açıldığındaki stoğu (id → adet).
export function createProductEditSchema(originalQuantities: ReadonlyMap<number, number>) {
  return productBaseSchema.extend({
    images: z.array(z.string()),
    variants: z
      .array(productEditVariantSchema)
      .min(1, ERRORS.noVariants)
      .superRefine((variants, ctx) => {
        checkVariantDuplicates(variants, ctx);

        // Eksi stok yalnızca kayıtlı değer olarak kalabilir; kullanıcı eksiye çekemez
        variants.forEach((variant, index) => {
          const quantity = Number(variant.quantity);
          const original = variant.id === null ? undefined : originalQuantities.get(variant.id);

          if (quantity < 0 && quantity !== original) {
            ctx.addIssue({ code: 'custom', message: ERRORS.quantity, path: [index, 'quantity'] });
          }
        });
      }),
  });
}

export type ProductEditFormInput = z.input<ReturnType<typeof createProductEditSchema>>;
export type ProductEditForm = z.output<ReturnType<typeof createProductEditSchema>>;
