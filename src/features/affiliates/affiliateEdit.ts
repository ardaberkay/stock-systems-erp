import type { AffiliateEditForm } from '@/features/affiliates/schemas/affiliateEdit';
import type { Affiliate } from '@/features/affiliates/schemas/affiliates';

// affiliateAccount/update'in alan adları; e-posta get'te `email`, update'te `mail`
export type AffiliateUpdate = Partial<{
  firstName: string;
  lastName: string;
  officeName: string;
  phone: string;
  mail: string;
}>;

export function getAffiliateEditDefaults(affiliate: Affiliate): AffiliateEditForm {
  return {
    firstName: affiliate.firstName ?? '',
    lastName: affiliate.lastName ?? '',
    officeName: affiliate.officeName ?? '',
    phone: affiliate.phone ?? '',
    email: affiliate.email ?? '',
  };
}

// Yalnızca değişen alanlar gönderilir; hiçbiri değişmediyse null (istek atılmaz).
export function getAffiliateChanges(
  original: AffiliateEditForm,
  values: AffiliateEditForm,
): AffiliateUpdate | null {
  const changes: AffiliateUpdate = {};

  if (values.firstName !== original.firstName) changes.firstName = values.firstName;
  if (values.lastName !== original.lastName) changes.lastName = values.lastName;
  if (values.officeName !== original.officeName) changes.officeName = values.officeName;
  if (values.phone !== original.phone) changes.phone = values.phone;
  if (values.email !== original.email) changes.mail = values.email;

  return Object.keys(changes).length > 0 ? changes : null;
}
