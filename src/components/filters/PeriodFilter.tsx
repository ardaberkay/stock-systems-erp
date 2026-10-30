import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocale } from '@/hooks/useLocale';
import { useDashboardFilterStore } from '@/stores/dashboardFilterStore';
import type { AppColors } from '@/theme/colors';
import { ICON_SIZE, MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { formatDateRange } from '@/utils/formatter';
import { router } from 'expo-router';
import Calendar from 'lucide-react-native/icons/calendar';
import ChevronDown from 'lucide-react-native/icons/chevron-down';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text } from 'react-native';

// Seçili dönemi gösterir; dokununca native dönem seçim sheet'ini açar.
export default function PeriodFilter() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const locale = useLocale();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const selection = useDashboardFilterStore((state) => state.selection);

  const label =
    selection.kind === 'preset'
      ? t(`filters.${selection.period}`)
      : formatDateRange(selection.from, selection.to, locale);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('filters.changePeriod')}
      accessibilityHint={label}
      onPress={() => router.push('/period-select')}
      style={styles.trigger}
    >
      <Calendar size={ICON_SIZE.sm} color={colors.orange} />
      <Text style={styles.label}>{label}</Text>
      <ChevronDown size={ICON_SIZE.sm} color={colors.icon} />
    </Pressable>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    trigger: {
      minHeight: MIN_TOUCH_SIZE - SPACING.xs,
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      paddingHorizontal: SPACING.md,
      borderRadius: RADIUS.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    label: {
      ...typography.label,
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.text,
    },
  });
}
