import PeriodPill from '@/components/ui/PeriodPill';
import Skeleton from '@/components/ui/Skeleton';
import Text from '@/components/ui/Text';
import type { PeriodSelection } from '@/features/period/constants';
import { usePeriodLabel } from '@/features/period/usePeriodLabel';
import type { AppColors } from '@/theme/colors';
import { RADIUS, SPACING } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatMoney, formatNumber } from '@/utils/formatter';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

type AffiliateOrdersHeaderProps = {
  selection: PeriodSelection;
  orderCount: number;
  revenue: number;
  // Siparişler henüz gelmediyse sayılar yerine iskelet görünür
  isLoading: boolean;
  colors: AppColors;
  locale: string;
};

// Siparişler sekmesinin başı: dönem seçimi, altında dönemdeki sipariş sayısı ve ciro
export default function AffiliateOrdersHeader({
  selection,
  orderCount,
  revenue,
  isLoading,
  colors,
  locale,
}: AffiliateOrdersHeaderProps) {
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const periodLabel = usePeriodLabel(selection);

  const stats = [
    { key: 'count', label: t('affiliates.detail.orderCount'), value: formatNumber(orderCount, locale) },
    { key: 'revenue', label: t('affiliates.detail.revenue'), value: formatMoney(revenue, locale) },
  ];

  return (
    <View style={styles.container}>
      {/* Bölüm adını sekme verir; burada yalnızca dönem seçimi durur */}
      <View style={styles.periodRow}>
        <PeriodPill
          label={periodLabel}
          onPress={() =>
            router.push({ pathname: '/period/[scope]', params: { scope: 'affiliates' } })
          }
        />
      </View>

      <View style={styles.stats}>
        {stats.map((stat) => (
          <View
            key={stat.key}
            style={styles.stat}
            accessible
            accessibilityLabel={isLoading ? stat.label : `${stat.label}: ${stat.value}`}
          >
            <Text style={styles.statLabel}>{stat.label}</Text>
            {isLoading ? (
              <Skeleton width="60%" height={typography.h3.lineHeight} />
            ) : (
              <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
                {stat.value}
              </Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      gap: SPACING.sm,
    },
    periodRow: {
      flexDirection: 'row',
    },
    stats: {
      flexDirection: 'row',
      gap: SPACING.sm,
    },
    stat: {
      flex: 1,
      gap: SPACING.xxs,
      padding: SPACING.md,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    statLabel: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    statValue: {
      ...typography.h3,
      color: colors.text,
    },
  });
}
