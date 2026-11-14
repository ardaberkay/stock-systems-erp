import DetailSection from '@/components/ui/DetailSection';
import Text from '@/components/ui/Text';
import type { AppColors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

type AffiliateBillingSectionProps = {
  colors: AppColors;
};

// Ödeme sekmesi. Panelde ödeme bilgileri (IBAN, alıcı, TC) ve fatura adresleri liste halinde;
// API listeyi döndürmüyor (update tek kayıt alanı yazıyor, get hiçbirini okumuyor), fatura
// adresi alanı hiç yok. Bölümler yerini korur; API listeyi verince kayıtlar kart kart buraya
// gelir (backend listesinde).
export default function AffiliateBillingSection({ colors }: AffiliateBillingSectionProps) {
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <>
      <DetailSection title={t('affiliates.detail.payments')}>
        <Text style={styles.empty}>{t('affiliates.detail.paymentsEmpty')}</Text>
      </DetailSection>
      <DetailSection title={t('affiliates.detail.addresses')}>
        <Text style={styles.empty}>{t('affiliates.detail.addressesEmpty')}</Text>
      </DetailSection>
    </>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    empty: {
      ...typography.bodySmall,
      color: colors.textSecondary,
    },
  });
}
