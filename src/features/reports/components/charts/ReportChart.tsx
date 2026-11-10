import ReportBarChart from '@/features/reports/components/charts/ReportBarChart';
import ReportColumnChart from '@/features/reports/components/charts/ReportColumnChart';
import ReportHeatChart from '@/features/reports/components/charts/ReportHeatChart';
import ReportKpiGrid from '@/features/reports/components/charts/ReportKpiGrid';
import ReportPieChart from '@/features/reports/components/charts/ReportPieChart';
import ReportPolarChart from '@/features/reports/components/charts/ReportPolarChart';
import ReportTreemapChart from '@/features/reports/components/charts/ReportTreemapChart';
import ReportTrendChart from '@/features/reports/components/charts/ReportTrendChart';
import {
  REPORT_BRAND_TILE_LIMIT,
  REPORT_COLUMN_HEIGHT,
  REPORT_DETAIL_BRAND_TILE_LIMIT,
  REPORT_DETAIL_TREEMAP_HEIGHT,
  REPORT_TREEMAP_HEIGHT,
  REPORT_DETAIL_COLUMN_HEIGHT,
  REPORT_DETAIL_DIAL_SIZE,
  REPORT_DETAIL_PODIUM_HEIGHT,
  REPORT_DETAIL_TREND_HEIGHT,
  REPORT_DIAL_SIZE,
  REPORT_PODIUM_HEIGHT,
  REPORT_TREND_HEIGHT,
} from '@/features/reports/constants';
import type { ReportContent } from '@/features/reports/hooks/useReportContent';
import type { AppColors } from '@/theme/colors';
import { SPACING } from '@/theme/spacing';
import { router } from 'expo-router';
import { Leaderboard, type LeaderboardEntry } from 'panelui-native/components/leaderboard';
import { StyleSheet, View } from 'react-native';

type ReportChartProps = {
  content: ReportContent;
  grid: number[][];
  colors: AppColors;
  // Kartta grafik yalnızca görseldir: kaydırırken yanlışlıkla seçim olmaz. Detayda büyür.
  interactive: boolean;
  // Dokunulabilir çubuk grafikte satır seçimi; yalnızca detay verir
  onSelectRow?: (key: string) => void;
};

function openCustomer(entry: LeaderboardEntry) {
  router.push({
    pathname: '/report-customer/[phone]',
    params: { phone: entry.id, name: entry.name },
  });
}

export default function ReportChart({
  content,
  grid,
  colors,
  interactive,
  onSelectRow,
}: ReportChartProps) {
  const {
    kind,
    chartRows,
    cardRowLimit,
    selectedKey,
    animateChart,
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
      {kind === 'bar' && (
        <ReportBarChart
          rows={rows}
          colors={colors}
          animated={animateChart}
          selectedKey={selectedKey}
          onSelectRow={onSelectRow}
        />
      )}
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
      {kind === 'treemap' && (
        <ReportTreemapChart
          rows={rows}
          height={interactive ? REPORT_DETAIL_TREEMAP_HEIGHT : REPORT_TREEMAP_HEIGHT}
          maxTiles={interactive ? REPORT_DETAIL_BRAND_TILE_LIMIT : REPORT_BRAND_TILE_LIMIT}
          colors={colors}
          interactive={interactive}
        />
      )}
      {kind === 'heat' && (
        <ReportHeatChart
          grid={grid}
          dayLabels={dayLabels}
          colors={colors}
          interactive={interactive}
        />
      )}
      {kpis.length > 0 && <ReportKpiGrid items={kpis} footers={footers} />}
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
