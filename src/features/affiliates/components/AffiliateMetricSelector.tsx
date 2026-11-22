import Skeleton from '@/components/ui/Skeleton';
import Text from '@/components/ui/Text';
import {
  AFFILIATE_SALES_METRICS,
  formatSalesMetric,
  getSalesMetricColor,
  type AffiliateSalesMetric,
} from '@/features/affiliates/affiliateSales';
import { haptics } from '@/lib/haptics';
import type { AppColors } from '@/theme/colors';
import { MIN_TOUCH_SIZE, RADIUS, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

type AffiliateMetricSelectorProps = {
  values: Record<AffiliateSalesMetric, number>;
  selected: AffiliateSalesMetric;
  onSelect: (metric: AffiliateSalesMetric) => void;
  isLoading: boolean;
  colors: AppColors;
  locale: string;
};

const LABEL_KEYS: Record<AffiliateSalesMetric, string> = {
  revenue: 'affiliates.detail.revenue',
  orders: 'affiliates.detail.orderCount',
  sold: 'affiliates.detail.unitCount',
};

// Kart yerine yan yana üç rakam: toplamları gösterir ve grafiğin seçicisidir. Seçili olanın
// noktası grafikteki çizginin renginde yanar (anasayfadaki rakamlarla aynı dil); alt çizgi
// sekmelere ait olduğu için burada kullanılmaz.
export default function AffiliateMetricSelector({
  values,
  selected,
  onSelect,
  isLoading,
  colors,
  locale,
}: AffiliateMetricSelectorProps) {
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row} accessibilityRole="tablist">
      {AFFILIATE_SALES_METRICS.map((metric) => {
        const isSelected = metric === selected;
        const label = t(LABEL_KEYS[metric]);
        const value = formatSalesMetric(metric, values[metric], locale);

        return (
          <Pressable
            key={metric}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={isLoading ? label : `${label}: ${value}`}
            accessibilityHint={t('affiliates.detail.metricHint')}
            onPress={() => {
              if (!isSelected) {
                haptics.selection();
              }
              onSelect(metric);
            }}
            style={styles.item}
          >
            <View style={styles.labelRow}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: isSelected
                      ? getSalesMetricColor(metric, colors)
                      : colors.iconDisabled,
                  },
                ]}
              />
              <Text style={styles.label} numberOfLines={1}>
                {label}
              </Text>
            </View>
            {isLoading ? (
              <Skeleton width="70%" height={typography.h3.lineHeight} />
            ) : (
              <Text
                style={[styles.value, !isSelected && styles.valueMuted]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {value}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: SPACING.lg,
    },
    // Üç eşit sütun; içerik sütunun ortasında, sağda boşluk kalmaz
    item: {
      flex: 1,
      minHeight: MIN_TOUCH_SIZE,
      alignItems: 'center',
      gap: SPACING.xxs,
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.xs,
    },
    dot: {
      width: SPACING.sm,
      height: SPACING.sm,
      borderRadius: RADIUS.full,
    },
    label: {
      ...typography.caption,
      flexShrink: 1,
      color: colors.textSecondary,
    },
    value: {
      ...typography.h3,
      textAlign: 'center',
      color: colors.text,
    },
    valueMuted: {
      color: colors.textSecondary,
    },
  });
}
