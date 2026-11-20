import Text from '@/components/ui/Text';
import {
  formatSalesMetric,
  getSalesMetricColor,
  type AffiliateSalesMetric,
} from '@/features/affiliates/affiliateSales';
import type { ChartPoint } from '@/features/orders/utils/orderStats';
import type { ChartGranularity } from '@/features/period/periodWindow';
import type { AppColors } from '@/theme/colors';
import { RADIUS, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatDayKey } from '@/utils/formatter';
import { LineChart } from 'panelui-native/components/line-chart';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

type AffiliateSalesChartProps = {
  points: ChartPoint[];
  granularity: ChartGranularity;
  metric: AffiliateSalesMetric;
  // Basılı tutunca kutuda ana değerin altında yazan ikinci değer (ör. ürün detayında ciro)
  secondaryMetric?: AffiliateSalesMetric;
  // Çizginin altı aşağı doğru solan dolguyla boyanır (yalnızca ürün detayı, AGENTS.md)
  filled?: boolean;
  isLoading: boolean;
  colors: AppColors;
  locale: string;
};

type ChartRow = {
  label: string;
  value: number | null;
  secondary: number | null;
};

// panelui'nin dar ekran için önerdiği oran; grafik kapsayıcının genişliğini kendisi alır,
// yükseklik genişlikle orantılı büyür (360dp telefonda ~200)
const CHART_ASPECT_RATIO = 1.6;
const STROKE_WIDTH = 2.5;
const AXIS_TICKS = 4;
// En yüksek nokta grafiğin tepesine yapışmasın
const Y_DOMAIN_HEADROOM = 1.15;
const LOADING_ROWS = [{ label: '' }, { label: ' ' }];
// Anasayfa grafiğinden (0,6) daha soluk; büyük dolgulu grafik anasayfanın kalsın
const FILL_OPACITY = 0.35;

// İade/iptal raporundaki gibi tek çizgi; ürün detayında altı dolgulu (filled).
// Noktalar (showMarkers) kapalı: panelui çizgiyi grafik alanının kenarında kırptığı için ilk
// ve son nokta yarım görünüyor. Basılı tutunca gün ve değer parmağın karşı tarafında üstte yazar.
export default function AffiliateSalesChart({
  points,
  granularity,
  metric,
  secondaryMetric,
  filled = false,
  isLoading,
  colors,
  locale,
}: AffiliateSalesChartProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const color = getSalesMetricColor(metric, colors);

  const { rows, yDomain } = useMemo(() => {
    const data = points.map(
      (point): ChartRow => ({
        label: granularity === 'day' ? formatDayKey(point.time, locale) : point.time,
        value: point[metric],
        secondary: secondaryMetric ? point[secondaryMetric] : null,
      }),
    );
    const max = Math.max(1, ...data.map((row) => row.value ?? 0));

    return { rows: data, yDomain: [0, max * Y_DOMAIN_HEADROOM] as [number, number] };
  }, [points, granularity, metric, secondaryMetric, locale]);

  const active = rows[activeIndex];
  // Kutu parmağın karşı tarafında durur; çizgiyi ve parmağı kapatmaz
  const isActiveOnLeft = activeIndex < rows.length / 2;

  return (
    <View>
      <LineChart
        data={isLoading ? LOADING_ROWS : rows}
        status={isLoading ? 'loading' : 'ready'}
        xDataKey="label"
        yDomain={yDomain}
        curve="monotone"
        aspectRatio={CHART_ASPECT_RATIO}
        onActiveIndexChange={(index) => setActiveIndex(index)}
      >
        <LineChart.Skeleton color={colors.chartGrid} />
        {filled ? <LineChart.Area dataKey="value" color={color} opacity={FILL_OPACITY} /> : null}
        <LineChart.Line dataKey="value" color={color} strokeWidth={STROKE_WIDTH} />
        <LineChart.XAxis ticks={AXIS_TICKS} />
        <LineChart.Tooltip showLabel={false} />
      </LineChart>

      {active && active.value !== null && (
        <View
          pointerEvents="none"
          style={[styles.readout, isActiveOnLeft ? styles.readoutRight : styles.readoutLeft]}
        >
          <Text style={styles.readoutDay}>{active.label}</Text>
          <Text style={[styles.readoutValue, { color }]}>
            {formatSalesMetric(metric, active.value, locale)}
          </Text>
          {secondaryMetric && active.secondary !== null ? (
            <Text style={styles.readoutSecondary}>
              {formatSalesMetric(secondaryMetric, active.secondary, locale)}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    readout: {
      position: 'absolute',
      top: 0,
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    readoutLeft: {
      left: 0,
    },
    readoutRight: {
      right: 0,
    },
    readoutDay: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    readoutValue: {
      ...typography.label,
    },
    readoutSecondary: {
      ...typography.caption,
      color: colors.text,
    },
  });
}
