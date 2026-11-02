import type { ReportTrendPoint } from '@/hooks/useReportContent';
import type { AppColors } from '@/theme/colors';
import { LineChart } from 'panelui-native';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

type ReportTrendChartProps = {
  points: ReportTrendPoint[];
  height: number;
  colors: AppColors;
  // Detayda gün ekseni ve dokununca değer görünür
  interactive: boolean;
};

const AREA_OPACITY = 0.3;
const STROKE_WIDTH = 2;
const MAX_AXIS_TICKS = 5;

export default function ReportTrendChart({
  points,
  height,
  colors,
  interactive,
}: ReportTrendChartProps) {
  const [width, setWidth] = useState(0);
  // Sıfır çizgisi grafiğin dibinde kalsın; hiç iade olmayan dönem ortada düz çizgi olmasın
  const yDomain = useMemo<[number, number]>(
    () => [0, Math.max(1, ...points.map((point) => point.value))],
    [points],
  );

  return (
    <View style={{ height }} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      {width > 0 && (
        <LineChart
          data={points}
          xDataKey="label"
          yDomain={yDomain}
          compact={!interactive}
          curve="monotone"
          aspectRatio={width / height}
        >
          <LineChart.Area dataKey="value" color={colors.orange} opacity={AREA_OPACITY} />
          <LineChart.Line dataKey="value" color={colors.orange} strokeWidth={STROKE_WIDTH} />
          {interactive && (
            <LineChart.XAxis ticks={Math.min(points.length, MAX_AXIS_TICKS)} />
          )}
          {interactive && <LineChart.Tooltip formatValue={(value) => String(value)} />}
        </LineChart>
      )}
    </View>
  );
}
