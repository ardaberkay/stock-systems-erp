import type { AppColors } from '@/theme/colors';
import { FONT_FAMILY, FONT_SIZE, typography } from '@/theme/typography';
import {
    DateTimePicker as PanelDateTimePicker,
} from 'panelui-native';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text } from 'react-native';

type DateTimePickerProps = {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  colors: AppColors;
  locale: string;
  formatDateTime: (date: Date) => string;
};

export default function DateTimePicker({
  selectedDate,
  onDateChange,
  colors,
  locale,
  formatDateTime,
}: DateTimePickerProps) {
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <PanelDateTimePicker
      value={selectedDate}
      onValueChange={onDateChange}
      presentation="bottom-sheet"
      layout="wheel"
      hourCycle={24}
      minuteStep={5}
      locale={locale}
      maxDate={new Date()}
      timeLabel={t('filters.time')}
      doneLabel={t('filters.done')}
      placeholder={t('filters.selectDate')}
      format={formatDateTime}
    >
      <Pressable
        accessibilityLabel={t('filters.selectDateTime')}
        style={styles.dateFilter}
      >
        <Text style={styles.dateFilterText}>
          {t('filters.selectDate')}
        </Text>

        <Text style={styles.dateFilterChevron}>⌄</Text>
      </Pressable>
    </PanelDateTimePicker>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    dateFilter: {
      minHeight: 42,
      paddingLeft: 14,
      paddingRight: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      justifyContent: 'center',
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    dateFilterText: {
      ...typography.label,
      color: colors.textSecondary,
      fontSize: FONT_SIZE.sm,
      fontFamily: FONT_FAMILY.semiBold,
    },
    dateFilterChevron: {
      ...typography.label,
      color: colors.textSecondary,
      fontSize: FONT_SIZE.sm,
      fontFamily: FONT_FAMILY.semiBold,
    },
  });
}