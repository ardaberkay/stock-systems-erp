import type { ReportRow } from '@/hooks/useReportContent';
import type { AppColors } from '@/theme/colors';
import { RADIUS, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type ReportListRowProps = {
  row: ReportRow;
  colors: AppColors;
  onPress?: (row: ReportRow) => void;
};

const DOT_SIZE = SPACING.sm;
const RANK_SIZE = 28;

function ReportListRow({ row, colors, onPress }: ReportListRowProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);

  const content = (
    <>
      {row.rank !== undefined ? (
        <View style={styles.rank}>
          <Text style={styles.rankText}>{row.rank}</Text>
        </View>
      ) : (
        <View style={[styles.dot, { backgroundColor: row.color }]} />
      )}
      <View style={styles.texts}>
        <Text style={styles.label} numberOfLines={2}>
          {row.label}
        </Text>
        {row.subtitle && <Text style={styles.subtitle}>{row.subtitle}</Text>}
      </View>
      <Text style={styles.value}>{row.valueLabel}</Text>
    </>
  );

  return onPress ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={row.label}
      onPress={() => onPress(row)}
      style={styles.row}
    >
      {content}
    </Pressable>
  ) : (
    <View style={styles.row}>{content}</View>
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
    rank: {
      width: RANK_SIZE,
      height: RANK_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: RADIUS.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    rankText: {
      ...typography.caption,
      color: colors.text,
    },
    texts: {
      flex: 1,
    },
    label: {
      ...typography.bodySmall,
      color: colors.text,
    },
    subtitle: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    value: {
      ...typography.label,
      color: colors.text,
    },
  });
}
