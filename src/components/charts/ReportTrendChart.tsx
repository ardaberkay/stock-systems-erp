import type { ReportTrendPoint } from '@/hooks/useReportContent';
import { useLocale } from '@/hooks/useLocale';
import type { AppColors } from '@/theme/colors';
import { RADIUS, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatNumber, formatPercent } from '@/utils/formatter';
import { LineChart } from 'panelui-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

type ReportTrendChartProps = {
  points: ReportTrendPoint[];
  height: number;
  colors: AppColors;
  // Detayda gün ekseni ve basılı tutunca değer görünür
  interactive: boolean;
};

const AREA_OPACITY = 0.3;
const STROKE_WIDTH = 2;
// 7 günde 4 etiket tam eşit aralıklı düşer; 5 etikette araları 2-1-2-1 gün olur
const AXIS_TICKS = 4;
// Oranı hiç olmayan dönemde de çizgi dipte kalsın, ortada düz çizgi olmasın
const MIN_RATE_DOMAIN = 0.1;

export default function ReportTrendChart({
  points,
  height,
  colors,
  interactive,
}: ReportTrendChartProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [width, setWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const yDomain = useMemo<[number, number]>(
    () => [0, Math.max(MIN_RATE_DOMAIN, ...points.map((point) => point.rate))],
    [points],
  );
  const active = points[activeIndex];
  // Kutu parmağın karşı tarafında durur; çizgiyi ve parmağı kapatmaz
  const isActiveOnLeft = activeIndex < points.length / 2;

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
          onActiveIndexChange={(index) => setActiveIndex(index)}
        >
          <LineChart.Area dataKey="rate" color={colors.orange} opacity={AREA_OPACITY} />
          <LineChart.Line dataKey="rate" color={colors.orange} strokeWidth={STROKE_WIDTH} />
          {interactive && <LineChart.XAxis ticks={AXIS_TICKS} />}
          {/* panelui etiketi tek satırlık; oran, iade ve iptal alt alta bizim kutuda yazılır */}
          {interactive && <LineChart.Tooltip showLabel={false} />}
        </LineChart>
      )}

      {interactive && active && (
        <View
          pointerEvents="none"
          style={[styles.readout, isActiveOnLeft ? styles.readoutRight : styles.readoutLeft]}
        >
          <Text style={styles.readoutDay}>{active.label}</Text>
          <Text style={styles.readoutRate}>{formatPercent(active.rate, locale)}</Text>
          <Text style={styles.readoutLine}>
            {t('reports.returns.returned')} {formatNumber(active.returned, locale)}
          </Text>
          <Text style={styles.readoutLine}>
            {t('reports.returns.cancelled')} {formatNumber(active.cancelled, locale)}
          </Text>
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
    readoutRate: {
      ...typography.label,
      color: colors.text,
    },
    readoutLine: {
      ...typography.caption,
      color: colors.text,
    },
  });
}
