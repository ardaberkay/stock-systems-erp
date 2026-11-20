import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Text from '@/components/ui/Text';
import { StyleSheet } from 'react-native';

// Adımlı formların üstündeki "* ile işaretli alanlar zorunludur" notu (ürün ekleme, sipariş
// oluşturma). Yıldızın kendisi alan etiketinde çizilir (bkz. FieldLabel).
export default function RequiredNote() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return <Text style={styles.note}>{t('common.requiredNote')}</Text>;
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    // Formların içerik aralığı SPACING.xl; not ilk bölüme yakın dursun diye yarısı geri alınır
    note: {
      ...typography.caption,
      marginBottom: -SPACING.sm,
      color: colors.textSecondary,
    },
  });
}
