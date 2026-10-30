import type { Period } from '@/constants/periods';
import {
  chartData,
  miniChartData,
} from '@/mocks/dashboard';
import type { AppColors } from '@/theme/colors';
import { formatMoney } from '@/utils/formatter';
import { LineChart } from 'panelui-native';
import { useMemo } from 'react';
import {
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

type RevenueLineChartProps = {
  period: Period;
  selectedDate: Date;
  showSold: boolean;
  showOrders: boolean;
  colors: AppColors;
  locale: string;
};


export default function RevenueLineChart({
  period,
  selectedDate,
  showSold,
  showOrders,
  colors,
  locale,
}: RevenueLineChartProps) {
  const { width } = useWindowDimensions();

  const data = useMemo(() => {
    const revenuePoints =
      period === 'today'
        ? chartData.today.map((point, index) => {
            const day = selectedDate.getDate();
            const month = selectedDate.getMonth();

            return {
              ...point,
              revenue: Math.round(
                point.revenue *
                  (1 + ((day + month + index) % 5 - 2) * 0.035),
              ),
            };
          })
        : chartData[period];

    const soldPoints = miniChartData[period];

    const maxRevenue = Math.max(
      ...revenuePoints.map((item) => item.revenue),
    );

    const maxSold = Math.max(
      1,
      ...soldPoints.map((item) => item.sold),
    );

    const maxOrders = Math.max(
      1,
      ...soldPoints.map((item) => Math.round(item.sold * 0.62)),
    );

    return revenuePoints.map((point, index) => {
      const sourceIndex = Math.round(
        (index / Math.max(1, revenuePoints.length - 1)) *
          (soldPoints.length - 1),
      );

      const sold = soldPoints[sourceIndex]?.sold ?? 0;
      const orders = Math.max(1, Math.round(sold * 0.62));

      return {
        ...point,
        sold: (sold / maxSold) * maxRevenue * 0.75,
        orders: (orders / maxOrders) * maxRevenue * 0.55,
      };
    });
  }, [period, selectedDate]);

  return (
    <View style={[styles.chartBleed, { width }]}>
      <LineChart
        data={data}
        xDataKey="time"
        aspectRatio={1.5}
        compact
        animationDuration={650}
        domainDuration={650}
      >
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
            strokeWidth={2.5}
          />
        )}

        {showOrders && (
          <LineChart.Line
            dataKey="orders"
            color={colors.green}
            strokeWidth={2.5}
          />
        )}

        <LineChart.XAxis ticks={5} />

        <LineChart.Tooltip
          formatValue={(value) => formatMoney(value, locale)}
        />
      </LineChart>
    </View>
  );
}

const styles = StyleSheet.create({
  chartBleed: {
    alignSelf: 'flex-start',
    flexGrow: 0,
    flexShrink: 0,
    marginTop: 2,
    marginBottom: 22,
    overflow: 'visible',
  },
});