import type { ReportRow } from '@/hooks/useReportContent';
import { useLocale } from '@/hooks/useLocale';
import type { AppColors } from '@/theme/colors';
import { RADIUS, SPACING } from '@/theme/spacing';
import { formatNumber } from '@/utils/formatter';
import { TreemapChart } from 'panelui-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

type ReportTreemapChartProps = {
  rows: ReportRow[];
  height: number;
  // Fazlası tek "Diğer" kutusunda toplanır
  maxTiles: number;
  colors: AppColors;
  // Detayda kutu üstünde pay yazar, dokununca değer görünür
  interactive: boolean;
};

// Kutu alanı pay kadardır; çok markalı mağazada da ilk birkaç marka okunur kalır.
export default function ReportTreemapChart({
  rows,
  height,
  maxTiles,
  colors,
  interactive,
}: ReportTreemapChartProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const [width, setWidth] = useState(0);
  const data = useMemo(
    () => rows.map((row) => ({ label: row.label, value: row.value, color: row.color })),
    [rows],
  );
  const formatValue = (value: number) =>
    t('reports.units', { value: formatNumber(value, locale) });

  return (
    <View style={{ height }} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      {width > 0 && (
        <TreemapChart
          data={data}
          aspectRatio={width / height}
          maxTiles={maxTiles}
          otherLabel={t('reports.other')}
          // "Diğer" kutusu tek renk kalsın; markalarla karışmasın
          color={colors.textSecondary}
          gap={SPACING.xxs}
          cornerRadius={RADIUS.sm}
        >
          <TreemapChart.Tiles />
          <TreemapChart.Labels showShare />
          {interactive && <TreemapChart.Tooltip formatValue={formatValue} />}
        </TreemapChart>
      )}
    </View>
  );
}
