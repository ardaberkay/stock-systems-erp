import type { AppColors } from '@/theme/colors';
import { LineChart } from 'panelui-native';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

type ProductMiniChartProps = {
  // Dönem boyunca satış adetleri
  trend: number[];
  colors: AppColors;
};

const CHART_HEIGHT = 24;
const DEFAULT_ASPECT_RATIO = 5;

export default function ProductMiniChart({
  trend,
  colors,
}: ProductMiniChartProps) {
  // Genişlik ciro metnine göre değişir; yükseklik sabit kalsın diye oran ölçümden hesaplanır
  const [width, setWidth] = useState(0);
  const data = useMemo(
    () => trend.map((sold, index) => ({ time: String(index), sold })),
    [trend],
  );
  // Sıfır çizgisi grafiğin dibinde kalsın; satış olmayan ürün ortada düz çizgi olmasın
  const yDomain = useMemo<[number, number]>(() => [0, Math.max(1, ...trend)], [trend]);

  return (
    <View
      style={styles.container}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      <LineChart
        data={data}
        xDataKey="time"
        yDomain={yDomain}
        compact
        curve="monotone"
        aspectRatio={width > 0 ? width / CHART_HEIGHT : DEFAULT_ASPECT_RATIO}
        animationDuration={500}
        domainDuration={400}
      >
        <LineChart.Line
          dataKey="sold"
          color={colors.orange}
          strokeWidth={1.5}
        />
      </LineChart>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: CHART_HEIGHT,
    overflow: 'hidden',
  },
});
