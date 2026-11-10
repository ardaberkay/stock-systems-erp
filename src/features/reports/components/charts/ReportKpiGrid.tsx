import type { ReportKpi } from '@/features/reports/hooks/useReportContent';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AppColors } from '@/theme/colors';
import { SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Kpi } from 'panelui-native/components/kpi';
import { useMemo } from 'react';
import Text from '@/components/ui/Text';
import { StyleSheet, View } from 'react-native';

type ReportKpiGridProps = {
  items: ReportKpi[];
  footers: string[];
};

// Kartın kendi yüzeyi olduğu için Kpi'nin yüzeyi kapalıdır.
export default function ReportKpiGrid({ items, footers }: ReportKpiGridProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {items.map((item) => (
          <View key={item.key} style={styles.cell}>
            <Kpi surface={false} goodDirection="none">
              <Kpi.Title>{item.label}</Kpi.Title>
              <Kpi.Value>{item.value}</Kpi.Value>
            </Kpi>
          </View>
        ))}
      </View>

      {footers.length > 0 && (
        <View>
          {footers.map((footer) => (
            <Text key={footer} style={styles.footer} numberOfLines={1}>
              {footer}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      gap: SPACING.md,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      rowGap: SPACING.lg,
    },
    cell: {
      width: '50%',
      paddingRight: SPACING.sm,
    },
    footer: {
      ...typography.caption,
      color: colors.textSecondary,
    },
  });
}
