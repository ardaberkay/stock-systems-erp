import { REPORT_BAR_ROW_HEIGHT } from '@/constants/reports';
import type { ReportRow } from '@/hooks/useReportContent';
import type { AppColors } from '@/theme/colors';
import { RADIUS, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { BarChart } from 'panelui-native';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type ReportBarChartProps = {
  rows: ReportRow[];
  colors: AppColors;
};

const BAR_GAP = 0.3;

// Grafik panelui'nin; ad ve değer sütunları bizim. Kütüphanenin sabit etiket alanına
// "Kargoya Verildi" sığmıyor ve kütüphane çubuk ucuna değer yazmıyor.
export default function ReportBarChart({ rows, colors }: ReportBarChartProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [width, setWidth] = useState(0);
  const height = rows.length * REPORT_BAR_ROW_HEIGHT;

  // Renk seri başınadır; her satır kendi serisi olur, stacked ile tam bant kalınlığında çizilir
  const data = useMemo(
    () => rows.map((row) => ({ name: row.label, [row.key]: row.value })),
    [rows],
  );

  return (
    <View style={styles.container}>
      <View style={styles.labels}>
        {rows.map((row) => (
          <View key={row.key} style={styles.cell}>
            <Text style={styles.label} numberOfLines={1}>
              {row.label}
            </Text>
          </View>
        ))}
      </View>

      <View
        pointerEvents="none"
        style={styles.chart}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      >
        {width > 0 && (
          <BarChart
            key={rows.map((row) => row.key).join('|')}
            data={data}
            xDataKey="name"
            orientation="horizontal"
            stacked
            compact
            barGap={BAR_GAP}
            cornerRadius={RADIUS.sm}
            aspectRatio={width / height}
          >
            {rows.map((row) => (
              <BarChart.Bar key={row.key} dataKey={row.key} color={row.color} />
            ))}
          </BarChart>
        )}
      </View>

      <View style={styles.values}>
        {rows.map((row) => (
          <View key={row.key} style={styles.cell}>
            <Text style={styles.value} numberOfLines={1}>
              {row.chartValue ?? row.valueLabel}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: SPACING.sm,
    },
    labels: {
      maxWidth: '42%',
    },
    values: {
      alignItems: 'flex-end',
    },
    chart: {
      flex: 1,
    },
    cell: {
      height: REPORT_BAR_ROW_HEIGHT,
      justifyContent: 'center',
    },
    label: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    value: {
      ...typography.caption,
      color: colors.text,
    },
  });
}
