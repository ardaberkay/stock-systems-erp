import { REPORT_BAR_ROW_HEIGHT } from '@/features/reports/constants';
import type { ReportRow } from '@/features/reports/hooks/useReportContent';
import type { AppColors } from '@/theme/colors';
import { RADIUS, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { BarChart } from 'panelui-native/components/bar-chart';
import { useMemo, useState } from 'react';
import Text from '@/components/ui/Text';
import { Pressable, StyleSheet, View } from 'react-native';

type ReportBarChartProps = {
  rows: ReportRow[];
  colors: AppColors;
  animated: boolean;
  // Verilirse satırlar dokunulabilir olur ve seçili olmayan çubuklar soluk çizilir
  selectedKey: string | null;
  onSelectRow?: (key: string) => void;
};

const BAR_GAP = 0.3;
// 40'lık satır dokunma alanı 44'e tamamlanır
const ROW_HIT_SLOP = { top: SPACING.xxs, bottom: SPACING.xxs };

// Grafik panelui'nin; ad ve değer sütunları bizim. Kütüphanenin sabit etiket alanına
// "Kargoya Verildi" sığmıyor ve kütüphane çubuk ucuna değer yazmıyor.
export default function ReportBarChart({
  rows,
  colors,
  animated,
  selectedKey,
  onSelectRow,
}: ReportBarChartProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [width, setWidth] = useState(0);
  const height = rows.length * REPORT_BAR_ROW_HEIGHT;
  const isFaded = (row: ReportRow) => selectedKey !== null && row.key !== selectedKey;

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
            <Text
              style={[styles.label, row.key === selectedKey && styles.selectedText]}
              numberOfLines={1}
            >
              {row.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Değer sütunu daralınca grafik yeni genişliği ölçene kadar eski oranla uzun çizilir;
          sabit yükseklik olmazsa alttaki liste bir an aşağı itilir */}
      <View
        pointerEvents="none"
        style={[styles.chart, { height }]}
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
            animationDuration={animated ? undefined : 0}
          >
            {rows.map((row) => (
              <BarChart.Bar
                key={row.key}
                dataKey={row.key}
                color={isFaded(row) ? colors.border : row.color}
              />
            ))}
          </BarChart>
        )}
      </View>

      <View style={styles.values}>
        {rows.map((row) => (
          <View key={row.key} style={styles.cell}>
            <Text style={[styles.value, isFaded(row) && styles.fadedText]} numberOfLines={1}>
              {row.chartValue ?? row.valueLabel}
            </Text>
          </View>
        ))}
      </View>

      {onSelectRow && (
        // Satırın tamamı dokunulabilir; ad, çubuk ve değer tek hedef olur
        <View style={StyleSheet.absoluteFill}>
          {rows.map((row) => (
            <Pressable
              key={row.key}
              accessibilityRole="button"
              accessibilityLabel={`${row.label}, ${row.valueLabel}`}
              accessibilityState={{ selected: row.key === selectedKey }}
              hitSlop={ROW_HIT_SLOP}
              onPress={() => onSelectRow(row.key)}
              style={styles.cell}
            />
          ))}
        </View>
      )}
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
      overflow: 'hidden',
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
    selectedText: {
      color: colors.text,
    },
    fadedText: {
      color: colors.textSecondary,
    },
  });
}
