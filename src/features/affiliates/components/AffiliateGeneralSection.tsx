import DetailRow from '@/components/ui/DetailRow';
import DetailSection from '@/components/ui/DetailSection';
import Text from '@/components/ui/Text';
import {
  isAffiliateActive,
  isAffiliateSubtractionOn,
  PANEL_ONLY_ACCOUNT_FIELDS,
  PANEL_ONLY_SALE_FIELDS,
  parseAffiliateCreateDay,
} from '@/features/affiliates/affiliateList';
import type { Affiliate } from '@/features/affiliates/schemas/affiliates';
import type { AppColors } from '@/theme/colors';
import { SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatDate, formatPhone } from '@/utils/formatter';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

type AffiliateGeneralSectionProps = {
  affiliate: Affiliate;
  colors: AppColors;
  locale: string;
};

// Bilgi sekmesi: düzenleme ekranıyla aynı başlıklı gruplar (okumada çerçevesiz, düzenlemede
// kart; ürün ve sipariş detayı gibi). API'nin okumadığı alanlar da
// yerinde durur ve "—" görünür; kullanıcı bilginin panelde olduğunu bilir. Kayıt tarihi en
// altta küçük bir satırdır.
export default function AffiliateGeneralSection({
  affiliate,
  colors,
  locale,
}: AffiliateGeneralSectionProps) {
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const createDay = parseAffiliateCreateDay(affiliate.createTime);

  return (
    <>
      <DetailSection title={t('affiliates.edit.sections.contact')} variant="plain">
        <DetailRow label={t('affiliates.edit.fields.officeName')} value={affiliate.officeName} />
        <DetailRow label={t('affiliates.edit.fields.firstName')} value={affiliate.firstName} />
        <DetailRow label={t('affiliates.edit.fields.lastName')} value={affiliate.lastName} />
        <DetailRow
          label={t('affiliates.edit.fields.phone')}
          value={affiliate.phone ? formatPhone(affiliate.phone) : null}
          selectable
        />
        <DetailRow label={t('affiliates.edit.fields.email')} value={affiliate.email} selectable />
      </DetailSection>

      <DetailSection title={t('affiliates.edit.sections.account')} variant="plain">
        {PANEL_ONLY_ACCOUNT_FIELDS.map((field) => (
          <DetailRow key={field} label={t(`affiliates.edit.fields.${field}`)} value={null} />
        ))}
        <DetailRow
          label={t('affiliates.edit.fields.status')}
          value={t(
            isAffiliateActive(affiliate) ? 'affiliates.status.active' : 'affiliates.status.passive',
          )}
        />
      </DetailSection>

      <DetailSection title={t('affiliates.edit.sections.sales')} variant="plain">
        <DetailRow
          label={t('affiliates.edit.fields.subtraction')}
          value={t(isAffiliateSubtractionOn(affiliate) ? 'affiliates.edit.on' : 'affiliates.edit.off')}
        />
        {PANEL_ONLY_SALE_FIELDS.map((field) => (
          <DetailRow key={field} label={t(`affiliates.edit.fields.${field}`)} value={null} />
        ))}
      </DetailSection>

      {createDay && (
        <Text style={styles.meta} selectable>
          {t('affiliates.detail.createdAt', { date: formatDate(createDay, locale) })}
        </Text>
      )}
    </>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    meta: {
      ...typography.caption,
      paddingTop: SPACING.xs,
      textAlign: 'center',
      color: colors.textSecondary,
    },
  });
}
