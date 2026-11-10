import ChartReadout, { type ChartReadoutItem } from '@/components/ui/charts/ChartReadout';
import ChartTimeAxis, { type ChartTimeAxisLabel } from '@/components/ui/charts/ChartTimeAxis';
import type { AppColors } from '@/theme/colors';
import { MIN_TOUCH_SIZE, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatDayKey, formatMoney, formatNumber } from '@/utils/formatter';
import type { ChartPoint } from '@/features/orders/utils/orderStats';
import type { ChartGranularity } from '@/features/period/periodWindow';
import CalendarClock from 'lucide-react-native/icons/calendar-clock';
import HandCoins from 'lucide-react-native/icons/hand-coins';
import ShoppingBag from 'lucide-react-native/icons/shopping-bag';
import Tag from 'lucide-react-native/icons/tag';
import { LineChart } from 'panelui-native/components/line-chart';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Text from '@/components/ui/Text';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

type RevenueLineChartProps = {
  points: ChartPoint[];
  granularity: ChartGranularity;
  // Yalnızca bitmemiş günde anlamlıdır: dünün çizgisi günün geri kalanını gösterir
  canCompare: boolean;
  isLoading: boolean;
  showSold: boolean;
  showOrders: boolean;
  colors: AppColors;
  locale: string;
};

type ChartRow = {
  time: string;
  revenue: number | null;
  previousRevenue: number | null;
  sold: number | null;
  orders: number | null;
};

type ReadoutValues = Omit<ChartRow, 'time'>;

const SERIES_KEYS = ['revenue', 'previousRevenue', 'sold', 'orders'] as const;

// Yükleme iskeleti için boş seri
const LOADING_POINTS = [{ time: '' }, { time: ' ' }];

const CHART_ASPECT_RATIO = 1.5;
// panelui `compact` modunda çizim alanının üstünde ve altında bıraktığı toplam pay
const CHART_VERTICAL_INSET = 4;
const CHART_ANIMATION_MS = 650;
// Okuma kutusu henüz ölçülmeden de en yüksek değer grafiğin tepesine yapışmasın
const Y_DOMAIN_HEADROOM = 1.1;
// 24 nokta eşit bölünmez; 18 yerine 17 düşmesin diye saatler elle verilir
const HOUR_AXIS_INDICES = [0, 6, 12, 18, 23];
const DAY_AXIS_TICKS = 4;
const EDGE_START_TIME = 'edge-start';
const EDGE_END_TIME = 'edge-end';
const MAX_EDGE_STEPS = 10;

// Çizgileri kendi en yüksek değerine göre ölçekler: sipariş ciroya göre küçük olsa da hareketi
// görünür. Yüksekliği yalnızca o çizgi içinde anlamlıdır, gerçek değerler dokununca okunur.
function scaleToRevenue(value: number | null, max: number, revenueTop: number) {
  return value === null ? null : (value / Math.max(1, max)) * revenueTop;
}

function getMax(values: (number | null)[]) {
  return Math.max(0, ...values.map((value) => value ?? 0));
}

// Günlükte eksene eşit aralıklı günler seçilir
function getAxisIndices(pointCount: number, granularity: ChartGranularity) {
  if (pointCount === 0) {
    return [];
  }

  if (granularity === 'hour') {
    return HOUR_AXIS_INDICES.filter((index) => index < pointCount);
  }

  const tickCount = Math.min(DAY_AXIS_TICKS, pointCount);

  return tickCount === 1
    ? [0]
    : Array.from({ length: tickCount }, (_, index) =>
        Math.round((index * (pointCount - 1)) / (tickCount - 1)),
      );
}

// İlk ve son nokta kenara yapışırsa ne parmakla seçilir ne de altındaki tarih ortalanır.
// İki uca uzantı eklenir; uzantıya basmak en yakın gerçek noktayı gösterir. Adım sayısı,
// uçtaki yazı ortalanana ve dokunma alanı yetene kadar artar.
function getEdgeSteps(pointCount: number, chartWidth: number, edgeLabelWidth: number) {
  if (pointCount < 2 || chartWidth <= 0) {
    return 0;
  }

  const labelInset = edgeLabelWidth / 2 + SPACING.sm;

  for (let steps = 0; steps < MAX_EDGE_STEPS; steps += 1) {
    const step = chartWidth / (pointCount - 1 + steps * 2);
    const inset = step * steps;

    if (inset >= labelInset && inset + step / 2 >= MIN_TOUCH_SIZE / 2) {
      return steps;
    }
  }

  return MAX_EDGE_STEPS;
}

// Uzantı düz değil, uçtaki aralığın eğimiyle sürer; çizgi kenarda kırılmadan biter.
// Gerçek veri değildir: eğim yarıya indirilir ki son günün değişimini abartıp
// "yükseliş sürüyor" izlenimi vermesin; sıfırın altına inmez, en yüksek değeri aşmaz.
const EDGE_SLOPE_FACTOR = 0.5;

function extrapolate(edge: number | null, inner: number | null, distance: number, top: number) {
  if (edge === null) {
    return null;
  }

  if (inner === null) {
    return edge;
  }

  const slope = (edge - inner) * EDGE_SLOPE_FACTOR;

  return Math.min(Math.max(edge + slope * distance, 0), top);
}

function getEdgeRows(edge: ChartRow, inner: ChartRow, steps: number, top: number, prefix: string) {
  return Array.from({ length: steps }, (_, index) => {
    const row: ChartRow = { ...edge, time: `${prefix}-${index}` };

    for (const key of SERIES_KEYS) {
      row[key] = extrapolate(edge[key], inner[key], index + 1, top);
    }

    return row;
  });
}

function extendRows(rows: ChartRow[], steps: number, top: number) {
  const first = rows[0];
  const second = rows[1];
  const last = rows[rows.length - 1];
  const beforeLast = rows[rows.length - 2];

  if (steps === 0 || !first || !second || !last || !beforeLast) {
    return rows;
  }

  return [
    // Soldaki uzantı kenardan içeri doğru sıralanır
    ...getEdgeRows(first, second, steps, top, EDGE_START_TIME).reverse(),
    ...rows,
    ...getEdgeRows(last, beforeLast, steps, top, EDGE_END_TIME),
  ];
}

function getReadoutItems(
  values: ReadoutValues,
  showPrevious: boolean,
  colors: AppColors,
  locale: string,
): ChartReadoutItem[] {
  const items: ChartReadoutItem[] = [];

  if (values.revenue !== null) {
    items.push(
      {
        key: 'revenue',
        icon: HandCoins,
        value: formatMoney(values.revenue, locale),
        color: colors.orange,
        background: colors.orangeLight,
      },
      {
        key: 'sold',
        icon: Tag,
        value: formatNumber(values.sold ?? 0, locale),
        color: colors.purple,
        background: colors.purpleLight,
      },
      {
        key: 'orders',
        icon: ShoppingBag,
        value: formatNumber(values.orders ?? 0, locale),
        color: colors.green,
        background: colors.greenLight,
      },
    );
  }

  if (showPrevious && values.previousRevenue !== null) {
    items.push({
      key: 'previous',
      icon: CalendarClock,
      value: formatMoney(values.previousRevenue, locale),
      color: colors.textSecondary,
      background: colors.background,
    });
  }

  return items;
}

export default function RevenueLineChart({
  points,
  granularity,
  canCompare,
  isLoading,
  showSold,
  showOrders,
  colors,
  locale,
}: RevenueLineChartProps) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(-1);
  // Uçtaki yazı ve okuma kutusu ölçülene kadar 0; ölçülünce grafik onlara göre yerleşir
  const [edgeLabelWidth, setEdgeLabelWidth] = useState(0);
  const [readoutHeight, setReadoutHeight] = useState(0);

  // Yardımcı çizgiler açıkken gri çizgi gizlenir; aynı alanda dört çizgi okunmaz
  const showPrevious =
    canCompare &&
    !showSold &&
    !showOrders &&
    points.some((point) => point.previousRevenue !== null);

  const edgeOffset = getEdgeSteps(points.length, width, edgeLabelWidth);
  const chartPointCount = points.length + edgeOffset * 2;

  const formatLabel = (time: string) =>
    granularity === 'day' ? formatDayKey(time, locale) : time;

  // Okuma kutusunun en geniş hali: her değerin dönemdeki en büyüğü
  const widestReadout = useMemo(
    () =>
      getReadoutItems(
        {
          revenue: getMax(points.map((point) => point.revenue)),
          previousRevenue: getMax(points.map((point) => point.previousRevenue)),
          sold: getMax(points.map((point) => point.sold)),
          orders: getMax(points.map((point) => point.orders)),
        },
        showPrevious,
        colors,
        locale,
      ),
    [points, showPrevious, colors, locale],
  );

  const { data, yDomain } = useMemo(() => {
    const revenueTop = Math.max(
      getMax(points.map((point) => point.revenue)),
      showPrevious ? getMax(points.map((point) => point.previousRevenue)) : 0,
      1,
    );
    const maxSold = getMax(points.map((point) => point.sold));
    const maxOrders = getMax(points.map((point) => point.orders));
    const rows: ChartRow[] = points.map((point) => ({
      time: point.time,
      revenue: point.revenue,
      previousRevenue: point.previousRevenue,
      sold: scaleToRevenue(point.sold, maxSold, revenueTop),
      orders: scaleToRevenue(point.orders, maxOrders, revenueTop),
    }));

    // En yüksek nokta, basılı tutunca açılan kutunun altında kalsın: üstte kutu kadar yer ayrılır
    const plotHeight = width / CHART_ASPECT_RATIO - CHART_VERTICAL_INSET;
    const reserved = readoutHeight > 0 ? readoutHeight + SPACING.xs * 2 : 0;
    const headroom =
      plotHeight > reserved
        ? Math.max(Y_DOMAIN_HEADROOM, plotHeight / (plotHeight - reserved))
        : Y_DOMAIN_HEADROOM;

    return {
      yDomain: [0, revenueTop * headroom] as [number, number],
      data: extendRows(rows, edgeOffset, revenueTop),
    };
  }, [points, showPrevious, edgeOffset, width, readoutHeight]);

  const axisLabels = useMemo<ChartTimeAxisLabel[]>(
    () =>
      getAxisIndices(points.length, granularity).map((index) => ({
        text:
          granularity === 'day'
            ? formatDayKey(points[index].time, locale)
            : points[index].time.slice(0, 2),
        ratio: chartPointCount > 1 ? (index + edgeOffset) / (chartPointCount - 1) : 0,
      })),
    [points, granularity, locale, edgeOffset, chartPointCount],
  );

  // Uzantıya basılınca grafiğin verdiği sıra gerçek noktaya çevrilir
  const handleActiveIndexChange = (index: number) =>
    setActiveIndex(
      index < 0 ? -1 : Math.min(Math.max(index - edgeOffset, 0), points.length - 1),
    );

  const activePoint = points[activeIndex];
  const lastPoint = points[points.length - 1];

  return (
    <View style={[styles.chartBleed, { width }]}>
      <LineChart
        data={isLoading ? LOADING_POINTS : data}
        status={isLoading ? 'loading' : 'ready'}
        xDataKey="time"
        yDomain={yDomain}
        aspectRatio={CHART_ASPECT_RATIO}
        compact
        animationDuration={CHART_ANIMATION_MS}
        domainDuration={CHART_ANIMATION_MS}
        onActiveIndexChange={handleActiveIndexChange}
      >
        <LineChart.Skeleton color={colors.chartGrid} />

        {showPrevious && (
          <LineChart.Line
            dataKey="previousRevenue"
            color={colors.chartAxis}
            strokeWidth={1.5}
          />
        )}

        <LineChart.Area
          dataKey="revenue"
          color={colors.orange}
          opacity={0.6}
        />

        <LineChart.Line
          dataKey="revenue"
          color={colors.orange}
          strokeWidth={2.5}
        />

        {showSold && (
          <LineChart.Line
            dataKey="sold"
            color={colors.purple}
            strokeWidth={1.5}
          />
        )}

        {showOrders && (
          <LineChart.Line
            dataKey="orders"
            color={colors.green}
            strokeWidth={1.5}
          />
        )}

        <LineChart.Tooltip showLabel={false} />
      </LineChart>

      {lastPoint && (
        <ChartReadout
          label={formatLabel(lastPoint.time)}
          items={widestReadout}
          hidden
          onHeightChange={setReadoutHeight}
        />
      )}

      {activePoint && (
        <ChartReadout
          label={formatLabel(activePoint.time)}
          items={getReadoutItems(activePoint, showPrevious, colors, locale)}
        />
      )}

      <ChartTimeAxis
        labels={axisLabels}
        colors={colors}
        visible={!isLoading}
        fadeDuration={CHART_ANIMATION_MS}
        onEdgeWidthChange={setEdgeLabelWidth}
      />

      {/* Yer her zaman ayrılır; filtre değişince alttaki içerik yukarı kaymaz */}
      <View style={styles.legend}>
        {!isLoading && showPrevious && (
          <>
            <View style={[styles.legendLine, { backgroundColor: colors.chartAxis }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              {t('dashboard.previousDay')}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chartBleed: {
    alignSelf: 'flex-start',
    flexGrow: 0,
    flexShrink: 0,
    marginTop: 2,
    marginBottom: SPACING.lg,
    overflow: 'visible',
  },
  legend: {
    minHeight: typography.caption.lineHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  legendLine: {
    width: 16,
    height: 2,
  },
  legendText: {
    ...typography.caption,
  },
});
