import DetailRow from '@/components/ui/DetailRow';
import DetailSection from '@/components/ui/DetailSection';
import { getAffiliateTitle, parseAffiliateCreateDay } from '@/features/affiliates/affiliateList';
import type { Affiliate } from '@/features/affiliates/schemas/affiliates';
import ContactActions from '@/features/orders/components/detail/ContactActions';
import { formatDate, formatPhone } from '@/utils/formatter';
import { useTranslation } from 'react-i18next';

type AffiliateGeneralSectionProps = {
  affiliate: Affiliate;
  locale: string;
};

// Genel Bilgiler sekmesi: get'in döndürdüğü tüm alanlar
export default function AffiliateGeneralSection({ affiliate, locale }: AffiliateGeneralSectionProps) {
  const { t } = useTranslation();
  const title = getAffiliateTitle(affiliate) || t('affiliates.unnamed', { id: affiliate.id });
  const createDay = parseAffiliateCreateDay(affiliate.createTime);

  return (
    <DetailSection>
      <DetailRow label={t('affiliates.detail.officeName')} value={affiliate.officeName} />
      <DetailRow label={t('affiliates.detail.firstName')} value={affiliate.firstName} />
      <DetailRow label={t('affiliates.detail.lastName')} value={affiliate.lastName} />
      <DetailRow
        label={t('affiliates.detail.phone')}
        value={affiliate.phone ? formatPhone(affiliate.phone) : null}
        selectable
        actions={
          affiliate.phone ? (
            <ContactActions
              phone={affiliate.phone}
              whatsappLabel={t('affiliates.detail.whatsapp', { name: title })}
              whatsappMessage={t('affiliates.detail.whatsappMessage', {
                name: affiliate.firstName || title,
              })}
            />
          ) : null
        }
      />
      <DetailRow label={t('affiliates.detail.email')} value={affiliate.email} selectable />
      <DetailRow
        label={t('affiliates.detail.createdAt')}
        value={createDay ? formatDate(createDay, locale) : null}
      />
      <DetailRow label={t('affiliates.detail.id')} value={`#${affiliate.id}`} selectable />
    </DetailSection>
  );
}
