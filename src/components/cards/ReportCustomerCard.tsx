import type { ReportRow } from '@/hooks/useReportContent';
import type { AppColors } from '@/theme/colors';
import { RADIUS, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type ReportCustomerCardProps = {
  row: ReportRow;
  colors: AppColors;
  onPress: (row: ReportRow) => void;
};

const RANK_SIZE = 28;

function ReportCustomerCard({ row, colors, onPress }: ReportCustomerCardProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={row.label}
      onPress={() => onPress(row)}
      style={styles.card}
    >
      <View style={styles.rank}>
        <Text style={styles.rankText}>{row.rank}</Text>
      </View>
      <View style={styles.texts}>
        <Text style={styles.label} numberOfLines={1}>
          {row.label}
        </Text>
        {row.subtitle && <Text style={styles.secondary}>{row.subtitle}</Text>}
      </View>
      <View style={styles.values}>
        <Text style={styles.value}>{row.valueLabel}</Text>
        {row.secondaryValue && <Text style={styles.secondary}>{row.secondaryValue}</Text>}
      </View>
    </Pressable>
  );
}

export default memo(ReportCustomerCard);

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      padding: SPACING.md,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.card.border,
      backgroundColor: colors.surface,
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
