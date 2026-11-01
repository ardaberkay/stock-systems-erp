import PeriodOption from '@/components/filters/PeriodOption';
import { ORDER_PERIODS } from '@/constants/orderFilters';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useOrderFilterStore } from '@/stores/orderFilterStore';
import type { AppColors } from '@/theme/colors';
import { SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Native form sheet içinde açılır (bkz. src/app/_layout.tsx). Yüksekliği içeriğe
// göre ayarlandığı için burada flex: 1 kullanılmaz.
export default function OrderPeriodModal() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const selection = useOrderFilterStore((state) => state.selection);
  const setSelection = useOrderFilterStore((state) => state.setSelection);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + SPACING.lg }]}>
      <Text style={styles.title}>{t('filters.selectPeriod')}</Text>

      <View accessibilityRole="radiogroup" style={styles.options}>
        {ORDER_PERIODS.map((period) => (
          <PeriodOption
            key={period}
            label={t(`filters.${period}`)}
            active={selection.kind === 'preset' && selection.period === period}
            onPress={() => {
              setSelection({ kind: 'preset', period });
              router.back();
            }}
          />
        ))}

        <View style={styles.divider} />

        <PeriodOption
          label={t('filters.customDate')}
          active={selection.kind === 'range'}
          onPress={() => router.push('/order-period-custom')}
          showChevron
        />
      </View>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: SPACING.xl,
      paddingTop: SPACING.xxl,
      gap: SPACING.md,
    },
    title: {
      ...typography.h3,
      color: colors.text,
    },
    options: {
      gap: SPACING.xs,
    },
    divider: {
      height: 1,
      backgroundColor: colors.divider,
      marginVertical: SPACING.xs,
    },
  });
}
