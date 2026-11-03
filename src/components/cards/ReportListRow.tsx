import type { ReportRow } from '@/hooks/useReportContent';
import type { AppColors } from '@/theme/colors';
import { RADIUS, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type ReportListRowProps = {
  row: ReportRow;
  colors: AppColors;
};

const DOT_SIZE = SPACING.sm;

function ReportListRow({ row, colors }: ReportListRowProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      {!row.hideDot && <View style={[styles.dot, { backgroundColor: row.color }]} />}
      <Text style={styles.label} numberOfLines={2}>
        {row.label}
      </Text>
      <View style={styles.values}>
        <Text style={styles.value}>{row.valueLabel}</Text>
        {row.secondaryValue && <Text style={styles.secondary}>{row.secondaryValue}</Text>}
      </View>
    </View>
  );
}

export default memo(ReportListRow);

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      paddingVertical: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    dot: {
      width: DOT_SIZE,
      height: DOT_SIZE,
      borderRadius: RADIUS.full,
    },
    label: {
      ...typography.bodySmall,
      flex: 1,
      color: colors.text,
    },
    values: {
      alignItems: 'flex-end',
    },
    value: {
      ...typography.label,
      color: colors.text,
    },
    secondary: {
      ...typography.caption,
      color: colors.textSecondary,
    },
  });
}
