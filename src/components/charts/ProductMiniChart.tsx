import type { Period } from '@/mocks/dashboard';
import { miniChartData } from '@/mocks/dashboard';
import type { AppColors } from '@/theme/colors';
import { LineChart } from 'panelui-native';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

type ProductMiniChartProps = {
  period: Period;
  sold: number;
  colors: AppColors;
};

export default function ProductMiniChart({
  period,
  sold,
  colors,
}: ProductMiniChartProps) {
  const data = useMemo(() => {
    const points = miniChartData[period];
    const scale = sold / 128;

    return points.map((point) => ({
      ...point,
      sold: Math.max(1, Math.round(point.sold * scale)),
    }));
  }, [period, sold]);

  return (
    <View style={styles.container}>
      <LineChart
        data={data}
        xDataKey="time"
        compact
        curve="monotone"
        aspectRatio={5}
        animationDuration={500}
        domainDuration={400}
      >
        <LineChart.Line
          dataKey="sold"
          color={colors.orange}
          strokeWidth={2}
        />
      </LineChart>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 28,
    marginTop: 0,
    overflow: 'hidden',
  },
});