import ReportBarChart from '@/components/charts/ReportBarChart';
import ReportColumnChart from '@/components/charts/ReportColumnChart';
import ReportHeatChart from '@/components/charts/ReportHeatChart';
import ReportKpiGrid from '@/components/charts/ReportKpiGrid';
import ReportPieChart from '@/components/charts/ReportPieChart';
import ReportPolarChart from '@/components/charts/ReportPolarChart';
import ReportTrendChart from '@/components/charts/ReportTrendChart';
import {
  REPORT_COLUMN_HEIGHT,
  REPORT_DETAIL_COLUMN_HEIGHT,
  REPORT_DETAIL_DIAL_SIZE,
  REPORT_DETAIL_PODIUM_HEIGHT,
  REPORT_DETAIL_TREND_HEIGHT,
  REPORT_DIAL_SIZE,
  REPORT_PODIUM_HEIGHT,
  REPORT_TREND_HEIGHT,
} from '@/constants/reports';
import type { ReportContent } from '@/hooks/useReportContent';
import type { AppColors } from '@/theme/colors';
import { SPACING } from '@/theme/spacing';
import { router } from 'expo-router';
import { Leaderboard, type LeaderboardEntry } from 'panelui-native';
import { StyleSheet, View } from 'react-native';

type ReportChartProps = {
  content: ReportContent;
  grid: number[][];
  colors: AppColors;
  // Kartta grafik yalnızca görseldir: kaydırırken yanlışlıkla seçim olmaz. Detayda büyür.
  interactive: boolean;
};

function openCustomer(entry: LeaderboardEntry) {
  router.push({
    pathname: '/report-customer/[phone]',
    params: { phone: entry.id, name: entry.name },
  });
}

export default function ReportChart({ content, grid, colors, interactive }: ReportChartProps) {
  const {
    kind,
    chartRows,
    cardRowLimit,
    center,
    kpis,
    footers,
    trend,
    dayLabels,
    leaders,
    formatLeaderValue,
  } = content;
  const rows =
    !interactive && cardRowLimit !== null ? chartRows.slice(0, cardRowLimit) : chartRows;
  const dialSize = interactive ? REPORT_DETAIL_DIAL_SIZE : REPORT_DIAL_SIZE;

  return (
    <View pointerEvents={interactive ? 'auto' : 'none'} style={styles.container}>
      {kind === 'bar' && <ReportBarChart rows={rows} colors={colors} />}
      {kind === 'column' && (
        <ReportColumnChart
          rows={rows}
          height={interactive ? REPORT_DETAIL_COLUMN_HEIGHT : REPORT_COLUMN_HEIGHT}
          colors={colors}
        />
      )}
      {kind === 'pie' && center && (
        <ReportPieChart rows={rows} center={center} size={dialSize} colors={colors} />
      )}
      {kind === 'polar' && (
        <ReportPolarChart rows={rows} size={dialSize} showValues={interactive} />
      )}
      {kind === 'heat' && (
        <ReportHeatChart
          grid={grid}
          dayLabels={dayLabels}
          colors={colors}
          interactive={interactive}
        />
      )}
      {kind === 'kpi' && <ReportKpiGrid items={kpis} footers={footers} />}
      {kind === 'leaderboard' && (
        <Leaderboard
          data={leaders}
          podiumScale="rank"
          podiumHeight={interactive ? REPORT_DETAIL_PODIUM_HEIGHT : REPORT_PODIUM_HEIGHT}
          formatValue={formatLeaderValue}
          onPressEntry={interactive ? openCustomer : undefined}
        />
      )}
      {trend && (
        <ReportTrendChart
          points={trend}
          height={interactive ? REPORT_DETAIL_TREND_HEIGHT : REPORT_TREND_HEIGHT}
          colors={colors}
          interactive={interactive}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.md,
  },
});
