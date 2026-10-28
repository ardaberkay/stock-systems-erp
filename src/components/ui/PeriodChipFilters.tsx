import DateTimePicker from '@/components/ui/DateTimePicker';
import type { Period } from '@/mocks/dashboard';
import { PERIODS } from '@/mocks/dashboard';
import type { AppColors } from '@/theme/colors';
import { FONT_FAMILY, FONT_SIZE, typography } from '@/theme/typography';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from 'react-native';

type PeriodChipFiltersProps = {
  value: Period;
  onChange: (period: Period) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  colors: AppColors;
  locale: string;
  formatDateTime: (date: Date) => string;
};

export default function PeriodChipFilters({
  value,
  onChange,
  selectedDate,
  onDateChange,
  colors,
  locale,
  formatDateTime,
}: PeriodChipFiltersProps) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const periodLabels: Record<Period, string> = {
    Bugün: t('filters.today'),
    Dün: t('filters.yesterday'),
    Haftalık: t('filters.weekly'),
    Aylık: t('filters.monthly'),
    Yıllık: t('filters.yearly'),
  };

  return (
    <View style={[styles.fullBleed, { width }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        <DateTimePicker
          selectedDate={selectedDate}
          onDateChange={onDateChange}
          colors={colors}
          locale={locale}
          formatDateTime={formatDateTime}
        />

        {PERIODS.map((period) => {
          const active = value === period;

          return (
            <Pressable
              key={period}
              onPress={() => onChange(period)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[
                styles.filterButton,
                active && styles.filterButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  active && styles.filterTextActive,
                ]}
              >
                {periodLabels[period]}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    fullBleed: {
      alignSelf: 'flex-start',
      flexGrow: 0,
      flexShrink: 0,
    },
    filters: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingLeft: 20,
      paddingRight: 20,
      paddingVertical: 4,
    },
    filterButton: {
      minHeight: 40,
      paddingHorizontal: 18,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    filterButtonActive: {
      backgroundColor: colors.orange,
      borderColor: colors.orange,
    },
    filterText: {
      ...typography.label,
      color: colors.chipInactiveText,
      fontSize: FONT_SIZE.sm,
      fontFamily: FONT_FAMILY.semiBold,
    },
    filterTextActive: {
      ...typography.label,
      color: colors.chipActiveText,
      fontFamily: FONT_FAMILY.bold,
    },
  });
}