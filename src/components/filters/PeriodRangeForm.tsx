import DateRangePicker from '@/components/ui/DateRangePicker';
import { MAX_RANGE_DAYS } from '@/constants/periods';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocale } from '@/hooks/useLocale';
import type { AppColors } from '@/theme/colors';
import { MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { FONT_FAMILY, typography } from '@/theme/typography';
import { countDays, toDayKey } from '@/utils/dateKey';
import { formatDateRange } from '@/utils/formatter';
import type { DateRange } from 'panelui-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type PeriodRangeFormProps = {
  initialRange: DateRange | undefined;
  onApply: (from: Date, to: Date) => void;
};

// Takvimden en fazla 30 günlük aralık seçtirir; "Uygula"ya basılana kadar ekran değişmez.
export default function PeriodRangeForm({ initialRange, onApply }: PeriodRangeFormProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const locale = useLocale();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [draft, setDraft] = useState<DateRange | undefined>(initialRange);
  const [today] = useState(() => new Date());

  // Yalnızca başlangıç seçiliyse tek günlük aralık sayılır
  const from = draft?.from;
  const to = draft?.to ?? draft?.from;
  const isTooLong =
    from !== undefined &&
    to !== undefined &&
    countDays(toDayKey(from), toDayKey(to)) > MAX_RANGE_DAYS;
  const canApply = from !== undefined && to !== undefined && !isTooLong;

  const apply = () => {
    if (from && to) {
      onApply(from, to);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + SPACING.lg }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('filters.customDate')}</Text>
        <Text style={styles.summary}>
          {from && to ? formatDateRange(from, to, locale) : t('filters.selectRangeHint')}
        </Text>
        {isTooLong && (
          <Text style={styles.error}>{t('filters.maxRangeError', { days: MAX_RANGE_DAYS })}</Text>
        )}
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
    error: {
      ...typography.bodySmall,
      color: colors.error,
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
