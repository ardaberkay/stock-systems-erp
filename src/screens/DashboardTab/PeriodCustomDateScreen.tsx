import DateRangePicker from '@/components/ui/DateRangePicker';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocale } from '@/hooks/useLocale';
import { useDashboardFilterStore } from '@/stores/dashboardFilterStore';
import type { AppColors } from '@/theme/colors';
import { MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { formatDateRange } from '@/utils/formatter';
import { router } from 'expo-router';
import type { DateRange } from 'panelui-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Dönem seçim sheet'inin üstüne ikinci bir native sheet olarak açılır.
export default function PeriodCustomDateScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const locale = useLocale();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const selection = useDashboardFilterStore((state) => state.selection);
  const setSelection = useDashboardFilterStore((state) => state.setSelection);
  // "Uygula"ya basılana kadar dashboard değişmez
  const [draft, setDraft] = useState<DateRange | undefined>(() =>
    selection.kind === 'range' ? { from: selection.from, to: selection.to } : undefined,
  );
  const [today] = useState(() => new Date());

  // Yalnızca başlangıç seçiliyse tek günlük aralık sayılır
  const from = draft?.from;
  const to = draft?.to ?? draft?.from;
  const canApply = from !== undefined && to !== undefined;

  const apply = () => {
    if (!from || !to) {
      return;
    }
    setSelection({ kind: 'range', from, to });
    // Hem bu sheet'i hem altındaki dönem seçim sheet'ini kapatır
    router.dismiss(2);
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + SPACING.lg }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('filters.customDate')}</Text>
        <Text style={styles.summary}>
          {from && to ? formatDateRange(from, to, locale) : t('filters.selectRangeHint')}
        </Text>
      </View>

      <DateRangePicker value={draft} onChange={setDraft} locale={locale} maxDate={today} />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('filters.apply')}
        accessibilityState={{ disabled: !canApply }}
        disabled={!canApply}
        onPress={apply}
        style={[styles.applyButton, !canApply && styles.applyButtonDisabled]}
      >
        <Text style={styles.applyText}>{t('filters.apply')}</Text>
      </Pressable>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: SPACING.xl,
      paddingTop: SPACING.xxl,
      gap: SPACING.lg,
    },
    header: {
      gap: SPACING.xxs,
    },
    title: {
      ...typography.h3,
      color: colors.text,
    },
    summary: {
      ...typography.bodySmall,
      color: colors.textSecondary,
    },
    applyButton: {
      minHeight: MIN_TOUCH_SIZE + SPACING.xs,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: RADIUS.md,
      backgroundColor: colors.buttonPrimary,
    },
    applyButtonDisabled: {
      opacity: 0.4,
    },
    applyText: {
      ...typography.body,
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.buttonPrimaryText,
    },
  });
}
