import type { ReportCenter, ReportRow } from '@/features/reports/hooks/useReportContent';
import type { AppColors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { PieChart } from 'panelui-native/components/pie-chart';
import { useMemo } from 'react';
import Text from '@/components/ui/Text';
import { StyleSheet, View } from 'react-native';

type ReportPieChartProps = {
  rows: ReportRow[];
  center: ReportCenter;
  size: number;
  colors: AppColors;
};

const INNER_RADIUS = 0.62;
const PAD_ANGLE = 2;
const MIN_ANGLE = 6;

// Orta boşlukta varsayılan değer durur; dilime basınca o dilimin adı ve tutarı görünür.
export default function ReportPieChart({ rows, center, size, colors }: ReportPieChartProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  // 0 değerli satır dilim olmaz ama lejantta %0 ile görünür
  const data = useMemo(
    () => rows.map((row) => ({ label: row.label, value: row.value, color: row.color })),
    [rows],
  );

  return (
    <View style={styles.container}>
      <PieChart
        data={data}
        size={size}
        innerRadius={INNER_RADIUS}
        padAngle={PAD_ANGLE}
        minAngle={MIN_ANGLE}
      >
        <PieChart.Slices />
        <PieChart.Center>
          {(slice) => {
            const selected = slice ? rows.find((row) => row.label === slice.label) : undefined;
            const secondaryValue = selected ? selected.secondaryValue : center.secondaryValue;

            return (
              <View style={[styles.center, { maxWidth: size * INNER_RADIUS }]}>
                <Text style={styles.centerLabel} numberOfLines={1}>
                  {selected?.label ?? center.label}
                </Text>
                <Text
                  style={[styles.centerValue, !selected && center.isNegative && styles.negative]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {selected?.valueLabel ?? center.value}
                </Text>
                {secondaryValue && (
                  <Text style={styles.centerLabel} numberOfLines={1} adjustsFontSizeToFit>
                    {secondaryValue}
                  </Text>
                )}
              </View>
            );
          }}
        </PieChart.Center>
        <PieChart.Legend />
      </PieChart>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
    },
    center: {
      alignItems: 'center',
    },
    centerLabel: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    centerValue: {
      ...typography.h3,
      color: colors.text,
    },
    negative: {
      color: colors.error,
    },
  });
}
