import type { ReportRow } from '@/hooks/useReportContent';
import type { AppColors } from '@/theme/colors';
import { RADIUS, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { BarChart } from 'panelui-native';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type ReportColumnChartProps = {
  rows: ReportRow[];
  height: number;
  colors: AppColors;
};

const BAR_GAP = 0.3;

// Sipariş olmayan gün de yerini korur: 0 değeri ve etiketi görünür kalır.
export default function ReportColumnChart({ rows, height, colors }: ReportColumnChartProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [width, setWidth] = useState(0);
  const data = useMemo(
    () => rows.map((row) => ({ name: row.label, value: row.value })),
    [rows],
  );

  return (
    <View style={styles.container}>
      <View style={styles.axis}>
        {rows.map((row) => (
          <Text key={row.key} style={styles.value} numberOfLines={1}>
            {row.chartValue ?? row.value}
          </Text>
        ))}
      </View>

      <View
        pointerEvents="none"
        style={{ height }}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      >
        {width > 0 && (
          <BarChart
            data={data}
            xDataKey="name"
            compact
            barGap={BAR_GAP}
            cornerRadius={RADIUS.sm}
            aspectRatio={width / height}
          >
            <BarChart.Bar dataKey="value" color={colors.orange} />
          </BarChart>
        )}
      </View>

      <View style={styles.axis}>
        {rows.map((row) => (
          <Text key={row.key} style={styles.label} numberOfLines={1}>
            {row.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      gap: SPACING.xs,
    },
    axis: {
      flexDirection: 'row',
    },
    value: {
      ...typography.caption,
      flex: 1,
      textAlign: 'center',
      color: colors.text,
    },
    label: {
      ...typography.caption,
      flex: 1,
      textAlign: 'center',
      color: colors.textSecondary,
    },
  });
}
