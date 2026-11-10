import type { ReportRow } from '@/features/reports/hooks/useReportContent';
import { PolarAreaChart } from 'panelui-native/components/polar-area-chart';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

type ReportPolarChartProps = {
  rows: ReportRow[];
  size: number;
  // Dilim üstü sayılar yalnızca büyük grafikte okunur
  showValues: boolean;
};

const MIN_LABEL_RADIUS = 24;

// Alan ölçeği: yarıçapta iki kat değer dört kat alan kaplar, büyük dilim abartılı görünür.
export default function ReportPolarChart({ rows, size, showValues }: ReportPolarChartProps) {
  const data = useMemo(
    () => rows.map((row) => ({ label: row.label, value: row.value, color: row.color })),
    [rows],
  );

  return (
    <View style={styles.container}>
      <PolarAreaChart data={data} size={size} scale="area">
        <PolarAreaChart.Grid />
        <PolarAreaChart.Wedges />
        {showValues && <PolarAreaChart.Labels minRadius={MIN_LABEL_RADIUS} />}
        <PolarAreaChart.Legend />
      </PolarAreaChart>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
});
