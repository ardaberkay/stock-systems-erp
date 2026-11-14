import DetailSection from '@/components/ui/DetailSection';
import LockedField from '@/components/ui/form/LockedField';
import Text from '@/components/ui/Text';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

// Panelde ödeme bilgileri ve fatura adresleri liste halinde. API tek IBAN / alıcı / TC alanı
// yazabiliyor ama okuyamıyor; listeye etkisi test edilene kadar hepsi kilitli.
const PAYMENT_FIELDS = ['paymentName', 'iban', 'tc', 'regularPayment'] as const;

export default function AffiliateEditBillingTab() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <>
      <DetailSection title={t('affiliates.edit.sections.payments')}>
        {PAYMENT_FIELDS.map((field) => (
          <LockedField key={field} label={t(`affiliates.edit.fields.${field}`)} value={null} />
        ))}
      </DetailSection>

      <DetailSection title={t('affiliates.edit.sections.addresses')}>
        <LockedField label={t('affiliates.edit.fields.billingAddress')} value={null} />
      </DetailSection>

      <Text style={styles.note}>{t('affiliates.edit.paymentLockedNote')}</Text>
    </>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    note: {
      ...typography.caption,
      color: colors.textSecondary,
    },
  });
}
