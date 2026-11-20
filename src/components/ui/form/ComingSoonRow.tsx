import Badge from '@/components/ui/Badge';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { MIN_TOUCH_SIZE, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Text from '@/components/ui/Text';
import { StyleSheet, View } from 'react-native';

type ComingSoonRowProps = {
  label: string;
};

// API'nin henüz kabul etmediği alanların yeri. Backend açınca bu satır gerçek alanla değişir.
export default function ComingSoonRow({ label }: ComingSoonRowProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`${label}, ${t('orders.create.comingSoon')}`}
      accessibilityHint={t('orders.create.comingSoonHint')}
      accessibilityState={{ disabled: true }}
    >
      <Text style={styles.label}>{label}</Text>
      <Badge label={t('orders.create.comingSoon')} tone="neutral" />
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    row: {
      minHeight: MIN_TOUCH_SIZE,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: SPACING.md,
    },
    label: {
      ...typography.body,
      flex: 1,
      color: colors.textDisabled,
    },
  });
}
