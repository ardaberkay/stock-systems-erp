import {
  REPORT_HEAT_DAYS,
  REPORT_HEAT_HOURS_PER_COLUMN,
} from '@/features/reports/constants';
import type { AppColors } from '@/theme/colors';
import { RADIUS, SPACING } from '@/theme/spacing';
import { HeatmapChart } from 'panelui-native/components/heatmap-chart';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type ReportHeatChartProps = {
  grid: number[][];
  dayLabels: string[];
  colors: AppColors;
  // Kartta hücreye dokunma kapalıdır; okuma detayda yapılır
  interactive: boolean;
};

const DAY_AXIS_WIDTH = 30;

export default function ReportHeatChart({
  grid,
  dayLabels,
  colors,
  interactive,
}: ReportHeatChartProps) {
  const { t } = useTranslation();
  const data = useMemo(
    () =>
      grid.map((days, column) => ({
        bin: column,
        bins: days.map((count, row) => ({ bin: row, count })),
      })),
    [grid],
  );
  // Her sütuna saat yazılınca etiketler üst üste biner
  const hourLabels = grid.map((_, column) =>
    column % 2 === 0 ? String(column * REPORT_HEAT_HOURS_PER_COLUMN).padStart(2, '0') : '',
  );

  return (
    <HeatmapChart
      data={data}
      layout="fill"
      rows={REPORT_HEAT_DAYS}
      gap={SPACING.xxs}
      cornerRadius={RADIUS.sm}
      color={colors.orange}
      emptyColor={colors.chartGrid}
    >
      <HeatmapChart.XAxis labels={hourLabels} />
      <HeatmapChart.YAxis labels={dayLabels} tickFilter="all" width={DAY_AXIS_WIDTH} />
      <HeatmapChart.Cells />
      {interactive && (
        <HeatmapChart.Tooltip
          activateAfterLongPress={0}
          formatLabel={(cell) => {
            const start = cell.column * REPORT_HEAT_HOURS_PER_COLUMN;

            return t('reports.busyHours.slot', {
              day: dayLabels[cell.row],
              start: String(start).padStart(2, '0'),
              end: String(start + REPORT_HEAT_HOURS_PER_COLUMN).padStart(2, '0'),
              value: cell.count,
            });
          }}
        />
      )}
    </HeatmapChart>
  );
}
