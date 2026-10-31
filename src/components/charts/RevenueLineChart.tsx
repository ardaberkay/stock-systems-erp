import ChartReadout, { type ChartReadoutItem } from '@/components/ui/ChartReadout';
import ChartTimeAxis from '@/components/ui/ChartTimeAxis';
import type { AppColors } from '@/theme/colors';
import { SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatDayKey, formatMoney, formatNumber } from '@/utils/formatter';
import type { ChartPoint } from '@/utils/orderStats';
import type { ChartGranularity } from '@/utils/periodWindow';
import CalendarClock from 'lucide-react-native/icons/calendar-clock';
import HandCoins from 'lucide-react-native/icons/hand-coins';
import ShoppingBag from 'lucide-react-native/icons/shopping-bag';
import Tag from 'lucide-react-native/icons/tag';
import { LineChart } from 'panelui-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

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

// Yükleme iskeleti için boş seri
const LOADING_POINTS = [{ time: '' }, { time: ' ' }];

// En yüksek değer grafiğin tepesine yapışmasın
const Y_DOMAIN_HEADROOM = 1.1;
const HOUR_AXIS_TICKS = 5;
const DAY_AXIS_TICKS = 4;

// Çizgileri kendi en yüksek değerine göre ölçekler: sipariş ciroya göre küçük olsa da hareketi
// görünür. Yüksekliği yalnızca o çizgi içinde anlamlıdır, gerçek değerler dokununca okunur.
function scaleToRevenue(value: number | null, max: number, revenueTop: number) {
  return value === null ? null : (value / Math.max(1, max)) * revenueTop;
}

function getMax(values: (number | null)[]) {
  return Math.max(0, ...values.map((value) => value ?? 0));
}

// Eksene eşit aralıklı noktalar seçilir; saatlikte 00, 06, 12, 18, 24'e denk gelir.
function getAxisTimes(points: ChartPoint[], tickCount: number) {
  if (points.length === 0) {
    return [];
  }

  return Array.from({ length: tickCount }, (_, index) =>
    points[Math.round((index * (points.length - 1)) / (tickCount - 1))].time,
  );
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

  // Yardımcı çizgiler açıkken gri çizgi gizlenir; aynı alanda dört çizgi okunmaz
  const showPrevious =
    canCompare &&
    !showSold &&
    !showOrders &&
    points.some((point) => point.previousRevenue !== null);

  const { data, yDomain } = useMemo(() => {
    const revenueTop = Math.max(
      getMax(points.map((point) => point.revenue)),
      showPrevious ? getMax(points.map((point) => point.previousRevenue)) : 0,
      1,
    );
    const maxSold = getMax(points.map((point) => point.sold));
    const maxOrders = getMax(points.map((point) => point.orders));

    return {
      yDomain: [0, revenueTop * Y_DOMAIN_HEADROOM] as [number, number],
      data: points.map((point) => ({
        time: point.time,
        revenue: point.revenue,
        previousRevenue: point.previousRevenue,
        sold: scaleToRevenue(point.sold, maxSold, revenueTop),
        orders: scaleToRevenue(point.orders, maxOrders, revenueTop),
      })),
    };
  }, [points, showPrevious]);

  const axisLabels = useMemo(
    () =>
      getAxisTimes(points, granularity === 'day' ? DAY_AXIS_TICKS : HOUR_AXIS_TICKS).map((time) =>
        granularity === 'day' ? formatDayKey(time, locale) : time.slice(0, 2),
      ),
    [points, granularity, locale],
  );

  const activePoint = points[activeIndex];
  const readoutItems: ChartReadoutItem[] = [];

  if (activePoint?.revenue !== null && activePoint?.revenue !== undefined) {
    readoutItems.push(
      {
        key: 'revenue',
        icon: HandCoins,
        value: formatMoney(activePoint.revenue, locale),
        color: colors.orange,
        background: colors.orangeLight,
      },
      {
        key: 'sold',
        icon: Tag,
        value: formatNumber(activePoint.sold ?? 0, locale),
        color: colors.purple,
        background: colors.purpleLight,
      },
      {
        key: 'orders',
        icon: ShoppingBag,
        value: formatNumber(activePoint.orders ?? 0, locale),
        color: colors.green,
        background: colors.greenLight,
      },
    );
  }

  if (showPrevious && activePoint && activePoint.previousRevenue !== null) {
    readoutItems.push({
      key: 'previous',
      icon: CalendarClock,
      value: formatMoney(activePoint.previousRevenue, locale),
      color: colors.textSecondary,
      background: colors.background,
    });
  }

  return (
    <View style={[styles.chartBleed, { width }]}>
      <LineChart
        data={isLoading ? LOADING_POINTS : data}
        status={isLoading ? 'loading' : 'ready'}
        xDataKey="time"
        yDomain={yDomain}
        aspectRatio={1.5}
        compact
        animationDuration={650}
        domainDuration={650}
        onActiveIndexChange={setActiveIndex}
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

      {activePoint && (
        <ChartReadout
          label={granularity === 'day' ? formatDayKey(activePoint.time, locale) : activePoint.time}
          items={readoutItems}
        />
      )}

      <ChartTimeAxis labels={axisLabels} colors={colors} />

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
