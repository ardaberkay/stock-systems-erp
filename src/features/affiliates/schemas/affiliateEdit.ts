import { isValidTrMobile } from '@/features/orders/utils/phone';
import { z } from 'zod';

// Hata mesajları çeviri anahtarıdır; ekranda t() ile gösterilir.
const ERRORS = {
  required: 'affiliates.edit.errors.required',
  email: 'affiliates.edit.errors.email',
  phone: 'affiliates.edit.errors.phone',
} as const;

const requiredText = z.string().trim().min(1, ERRORS.required);
const optionalText = z.string().trim();

// Yalnızca affiliateAccount/update'in kabul ettiği ve get'in döndürdüğü alanlar düzenlenir.
// Ödeme alanları (IBAN, alıcı, TC, düzenli ödeme) update'te var ama get döndürmüyor ve panelde
// liste halinde; update'in listeye etkisi test edilmeden forma eklenmez.
const baseSchema = z.object({
  firstName: requiredText,
  lastName: requiredText,
  officeName: optionalText,
  // 10 hane (5xx…), get de bu biçimde döndürüyor
  phone: z.string(),
  email: optionalText,
});

export type AffiliateEditForm = z.infer<typeof baseSchema>;

// Kurallar kayıtlı hale göre: dokunulmayan alan doğrulanmaz; dolu alan boşaltılamaz
// (API'nin boş değeri kabul edip etmediği test edilmedi).
export function createAffiliateEditSchema(original: AffiliateEditForm) {
  return baseSchema.superRefine((values, ctx) => {
    if (values.phone !== original.phone) {
      if (values.phone === '' && original.phone !== '') {
        ctx.addIssue({ code: 'custom', message: ERRORS.required, path: ['phone'] });
      } else if (values.phone !== '' && !isValidTrMobile(values.phone)) {
        ctx.addIssue({ code: 'custom', message: ERRORS.phone, path: ['phone'] });
      }
    }

    if (values.email !== original.email) {
      if (values.email === '' && original.email !== '') {
        ctx.addIssue({ code: 'custom', message: ERRORS.required, path: ['email'] });
      } else if (values.email !== '' && !z.email().safeParse(values.email).success) {
        ctx.addIssue({ code: 'custom', message: ERRORS.email, path: ['email'] });
      }
    }

    if (values.officeName === '' && original.officeName !== '') {
      ctx.addIssue({ code: 'custom', message: ERRORS.required, path: ['officeName'] });
    }
  });
}
